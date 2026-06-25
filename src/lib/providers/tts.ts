"use server";

import { createLogger } from "@/lib/logger";
import { getServices, getTtsConfig } from "@/lib/capability";

const log = createLogger("tts");

/**
 * TTS 对接 inference.sh 托管的 OmniVoice (infsh/omnivoice) 应用。
 * - 鉴权: Bearer API Key (Authorization: Bearer inf_xxx)
 * - 接口: POST https://api.inference.sh/run, 异步任务模型
 * - 返回: WAV 24kHz 音频, 由 output.audio.uri 托管, 需二次下载
 *
 * lang 参数语义保留但 OmniVoice 不使用: 语言由 text 自动推导 (支持 600+ 语言)。
 * lang 仍流经签名以保持调用方契约, 并用于审计日志。
 */

const RUN_URL = "https://api.inference.sh/run";
const TASK_URL = "https://api.inference.sh/tasks";
const OMNIVOICE_APP = "infsh/omnivoice";

// inference.sh 任务状态码
const STATUS_COMPLETED = 10;
const STATUS_FAILED = 11;
const STATUS_CANCELLED = 12;

const TIMEOUT_MS = 90_000;
const POLL_INTERVAL_MS = 1_500;
const MAX_POLLS = 55;
// status=10 但 output 尚未就绪时, 额外重试次数 (inference.sh 存在 status 先翻 output 后到的竞态)
const OUTPUT_SETTLE_RETRIES = 4;
const OUTPUT_SETTLE_INTERVAL_MS = 1_000;

// ==================== 配置访问 ====================

async function getTtsProviderConfig() {
  const services = await getServices();
  const c = getTtsConfig(services);
  return { apiKey: c.apiKey };
}

function hasPrimary(config: { apiKey: string }): boolean {
  return !!config.apiKey;
}

// ==================== Primary TTS (inference.sh OmniVoice, 返回 wav) ====================
// 供 /api/tts route 调用。凭据从 DB 读取,不暴露前端。

function authHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "X-API-Version": "2",
  };
}

/**
 * 从 task.output 提取音频 URI, 兼容多种可能的字段结构。
 * inference.sh 文件类型标准表示为 { uri: string }, 但实际响应可能存在字段名差异。
 */
function extractAudioUri(output: unknown): string | null {
  if (!output || typeof output !== "object") return null;
  const o = output as Record<string, unknown>;

  // 常见路径: output.audio = { uri: "..." }
  const audio = o.audio;
  if (audio && typeof audio === "object") {
    const uri = (audio as Record<string, unknown>).uri;
    if (typeof uri === "string" && uri) return uri;
  }
  // output.audio 直接是 URL 字符串
  if (typeof audio === "string" && audio.startsWith("http")) return audio;

  // 备选字段名
  for (const key of ["audio_url", "url", "file", "wav", "sound", "speech"]) {
    const v = o[key];
    if (typeof v === "string" && v.startsWith("http")) return v;
    if (v && typeof v === "object") {
      const uri = (v as Record<string, unknown>).uri;
      if (typeof uri === "string" && uri) return uri;
    }
  }

  // 兜底: 遍历 output 一级字段, 找任何 { uri: "http..." }
  for (const key of Object.keys(o)) {
    const v = o[key];
    if (v && typeof v === "object") {
      const uri = (v as Record<string, unknown>).uri;
      if (typeof uri === "string" && uri.startsWith("http")) return uri;
    }
  }
  return null;
}

/**
 * 轮询任务直到终态。处理 inference.sh status=10 但 output 尚未就绪的竞态:
 * 命中 status=10 但提取不到 audio uri 时, 额外重试几次等 output 就绪。
 */
async function pollTaskUntilDone(
  taskId: string,
  apiKey: string,
  signal: AbortSignal
): Promise<{ ok: true; audioUri: string } | { ok: false }> {
  let settleRetries = 0;

  for (let i = 0; i < MAX_POLLS; i++) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    if (signal.aborted) return { ok: false };

    let pollResp: Response;
    try {
      pollResp = await fetch(`${TASK_URL}/${taskId}`, {
        headers: authHeaders(apiKey),
        signal,
      });
    } catch {
      return { ok: false };
    }
    if (!pollResp.ok) {
      log.warn("OmniVoice poll request failed", { status: pollResp.status });
      return { ok: false };
    }
    const task = (await pollResp.json()) as Record<string, unknown>;
    const status = task.status as number;

    if (status === STATUS_COMPLETED) {
      const uri = extractAudioUri(task.output);
      if (uri) return { ok: true, audioUri: uri };
      // status=10 但 output 未就绪: 重试等待 output 就绪, 不立即放弃
      settleRetries++;
      if (settleRetries > OUTPUT_SETTLE_RETRIES) {
        log.warn("OmniVoice task completed but audio uri never appeared", {
          output: JSON.stringify(task.output)?.slice(0, 800),
          settleRetries,
        });
        return { ok: false };
      }
      await new Promise((resolve) => setTimeout(resolve, OUTPUT_SETTLE_INTERVAL_MS));
      continue;
    }
    if (status === STATUS_FAILED || status === STATUS_CANCELLED) {
      log.warn("OmniVoice task failed/cancelled", { status, error: task.error });
      return { ok: false };
    }
    // 状态 < 10 仍在处理, 继续轮询
  }
  log.warn("OmniVoice task polling timed out");
  return { ok: false };
}

export async function fetchPrimaryTtsAudio(
  text: string,
  lang?: string
): Promise<{ ok: true; buffer: ArrayBuffer; contentType: string } | { ok: false }> {
  const config = await getTtsProviderConfig();
  if (!hasPrimary(config)) return { ok: false };
  void lang; // OmniVoice 自动从 text 推导语言, lang 仅用于审计日志

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    // 1. 提交任务 (?wait=true 显式要求阻塞到完成, 避免 status/output 竞态)
    let submitResp: Response;
    try {
      submitResp = await fetch(`${RUN_URL}?wait=true`, {
        method: "POST",
        headers: authHeaders(config.apiKey),
        body: JSON.stringify({
          app: OMNIVOICE_APP,
          input: { text, mode: "auto" },
        }),
        signal: controller.signal,
      });
    } catch (error) {
      log.warn("OmniVoice submit error", { error: error instanceof Error ? error.message : String(error) });
      return { ok: false };
    }
    if (!submitResp.ok) {
      log.warn("OmniVoice submit failed", { status: submitResp.status });
      return { ok: false };
    }
    const task = (await submitResp.json()) as Record<string, unknown>;

    // 2. 取结果: 已完成直接提取 uri, 否则轮询
    let audioUri: string;
    if (task.status === STATUS_COMPLETED) {
      const uri = extractAudioUri(task.output);
      if (!uri) {
        // 阻塞返回了 status=10 但 output 未就绪 — 退化到轮询补救
        const taskId = task.id as string | undefined;
        if (!taskId) {
          log.warn("OmniVoice completed but no audio uri and no task id for retry", {
            output: JSON.stringify(task.output)?.slice(0, 800),
          });
          return { ok: false };
        }
        const polled = await pollTaskUntilDone(taskId, config.apiKey, controller.signal);
        if (!polled.ok) return { ok: false };
        audioUri = polled.audioUri;
      } else {
        audioUri = uri;
      }
    } else if (task.status === STATUS_FAILED || task.status === STATUS_CANCELLED) {
      log.warn("OmniVoice task failed/cancelled", { status: task.status, error: task.error });
      return { ok: false };
    } else {
      const taskId = task.id as string | undefined;
      if (!taskId) {
        log.warn("OmniVoice task missing id for polling");
        return { ok: false };
      }
      const polled = await pollTaskUntilDone(taskId, config.apiKey, controller.signal);
      if (!polled.ok) return { ok: false };
      audioUri = polled.audioUri;
    }

    // 3. 下载托管音频文件
    let audioResp: Response;
    try {
      audioResp = await fetch(audioUri, { signal: controller.signal });
    } catch (error) {
      log.warn("OmniVoice audio download error", { error: error instanceof Error ? error.message : String(error) });
      return { ok: false };
    }
    if (!audioResp.ok) {
      log.warn("OmniVoice audio download failed", { status: audioResp.status });
      return { ok: false };
    }
    const buffer = await audioResp.arrayBuffer();
    const contentType = audioResp.headers.get("content-type") ?? "audio/wav";
    return { ok: true, buffer, contentType };
  } catch (error) {
    log.warn("Primary TTS error", { error: error instanceof Error ? error.message : String(error) });
    return { ok: false };
  } finally {
    clearTimeout(timeoutId);
  }
}

// ==================== 对外接口 ====================

/**
 * 获取 TTS 音频 URL。
 * - 配了 primary (apiKey): 返回 `/api/tts` 代理 URL, 由 route 调 inference.sh OmniVoice
 * - 没配 primary: 返回 null
 * lang 参数保留兼容性 (OmniVoice 自动从 text 推导语言), regenerate 为 true 时追加时间戳绕过缓存。
 */
export async function getTTSUrl(
  text: string,
  lang: string,
  regenerate = false
): Promise<string | null> {
  const config = await getTtsProviderConfig();

  if (hasPrimary(config)) {
    const base = `/api/tts?text=${encodeURIComponent(text)}&lang=${encodeURIComponent(lang)}`;
    return regenerate ? `${base}&_t=${Date.now()}` : base;
  }

  log.warn("TTS not configured (apiKey missing)");
  return null;
}
