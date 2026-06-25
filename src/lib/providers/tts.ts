"use server";

import { createLogger } from "@/lib/logger";
import { getServices, getTtsConfig } from "@/lib/capability";

const log = createLogger("tts");

/**
 * TTS 对接 inference.sh 托管的 OmniVoice (infsh/omnivoice) 应用。
 * - 鉴权: Bearer API Key (Authorization: Bearer ...)
 * - 接口: POST https://api.inference.sh/run (异步任务, 立即返回 status<10)
 * - 轮询: GET /tasks/:id 直到 status=10
 * - 取音频: output.audio 是裸字符串 URL (WAV 24kHz), 二次 GET 下载
 * - 语言: OmniVoice 从 text 自动推导 (支持 600+ 语言), lang 参数仅用于审计日志
 */

const RUN_URL = "https://api.inference.sh/run";
const TASK_URL = "https://api.inference.sh/tasks";
const OMNIVOICE_APP = "infsh/omnivoice";

const STATUS_COMPLETED = 10;
const STATUS_FAILED = 11;
const STATUS_CANCELLED = 12;

const TIMEOUT_MS = 90_000;
const POLL_INTERVAL_MS = 1_500;
const MAX_POLLS = 55;

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
 * 从 task.output 提取音频 URL。
 * inference.sh file 类型字段标准返回裸字符串 URL (非 { uri } 对象),
 * 同时兼容 { uri } 对象形式以防御 API 变更。
 */
function extractAudioUri(output: unknown): string | null {
  if (!output || typeof output !== "object") return null;
  const o = output as Record<string, unknown>;
  const audio = o.audio;

  // 标准格式: output.audio = "https://cloud.inference.sh/.../xxx.wav"
  if (typeof audio === "string" && audio.startsWith("http")) return audio;
  // 备选: output.audio = { uri: "https://..." }
  if (audio && typeof audio === "object") {
    const uri = (audio as Record<string, unknown>).uri;
    if (typeof uri === "string" && uri.startsWith("http")) return uri;
  }
  // 兜底: 遍历一级字段找 URL
  for (const v of Object.values(o)) {
    if (typeof v === "string" && v.startsWith("http")) return v;
    if (v && typeof v === "object") {
      const uri = (v as Record<string, unknown>).uri;
      if (typeof uri === "string" && uri.startsWith("http")) return uri;
    }
  }
  return null;
}

/** 轮询 GET /tasks/:id 直到终态, 返回 audio URL。 */
async function pollTaskUntilDone(
  taskId: string,
  apiKey: string,
  signal: AbortSignal
): Promise<{ ok: true; audioUri: string } | { ok: false }> {
  for (let i = 0; i < MAX_POLLS; i++) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    if (signal.aborted) return { ok: false };

    let resp: Response;
    try {
      resp = await fetch(`${TASK_URL}/${taskId}`, {
        headers: authHeaders(apiKey),
        signal,
      });
    } catch {
      return { ok: false };
    }
    if (!resp.ok) {
      log.warn("OmniVoice poll failed", { status: resp.status });
      return { ok: false };
    }
    const task = (await resp.json()) as Record<string, unknown>;
    const status = task.status as number;

    if (status === STATUS_COMPLETED) {
      const uri = extractAudioUri(task.output);
      if (uri) return { ok: true, audioUri: uri };
      log.warn("OmniVoice completed but no audio url in output", {
        output: JSON.stringify(task.output)?.slice(0, 500),
      });
      return { ok: false };
    }
    if (status === STATUS_FAILED || status === STATUS_CANCELLED) {
      log.warn("OmniVoice task failed/cancelled", { status, error: task.error });
      return { ok: false };
    }
  }
  log.warn("OmniVoice polling timed out");
  return { ok: false };
}

export async function fetchPrimaryTtsAudio(
  text: string,
  lang?: string
): Promise<{ ok: true; buffer: ArrayBuffer; contentType: string } | { ok: false }> {
  const config = await getTtsProviderConfig();
  if (!hasPrimary(config)) return { ok: false };
  void lang; // OmniVoice 自动推导语言, lang 仅用于审计日志

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    // 1. 提交任务 (POST /run 立即返回 status<10 + task id)
    let submitResp: Response;
    try {
      submitResp = await fetch(RUN_URL, {
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

    // 2. 若提交即完成 (理论上少见) 直接取, 否则轮询
    let audioUri: string;
    if (task.status === STATUS_COMPLETED) {
      const uri = extractAudioUri(task.output);
      if (!uri) {
        log.warn("OmniVoice completed but no audio url in output", {
          output: JSON.stringify(task.output)?.slice(0, 500),
        });
        return { ok: false };
      }
      audioUri = uri;
    } else if (task.status === STATUS_FAILED || task.status === STATUS_CANCELLED) {
      log.warn("OmniVoice task failed/cancelled", { status: task.status, error: task.error });
      return { ok: false };
    } else {
      const taskId = task.id as string | undefined;
      if (!taskId) {
        log.warn("OmniVoice submit response missing task id");
        return { ok: false };
      }
      const polled = await pollTaskUntilDone(taskId, config.apiKey, controller.signal);
      if (!polled.ok) return { ok: false };
      audioUri = polled.audioUri;
    }

    // 3. 下载托管音频
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
