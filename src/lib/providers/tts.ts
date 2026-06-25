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

const TIMEOUT_MS = 60_000;
const POLL_INTERVAL_MS = 1_000;
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

async function pollTaskUntilDone(
  taskId: string,
  apiKey: string,
  signal: AbortSignal
): Promise<{ ok: true; audioUri: string } | { ok: false }> {
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
      const output = (task.output ?? {}) as Record<string, unknown>;
      const audio = (output.audio ?? {}) as Record<string, unknown>;
      const audioUri = audio.uri as string | undefined;
      if (!audioUri) {
        log.warn("OmniVoice task completed but missing audio uri");
        return { ok: false };
      }
      return { ok: true, audioUri };
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
    // 1. 提交任务 (默认阻塞, 但兼容非阻塞: 未完成则轮询)
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

    // 2. 取结果: 已完成直接读 uri, 否则轮询
    let audioUri: string;
    if (task.status === STATUS_COMPLETED) {
      const output = (task.output ?? {}) as Record<string, unknown>;
      const audio = (output.audio ?? {}) as Record<string, unknown>;
      const uri = audio.uri as string | undefined;
      if (!uri) {
        log.warn("OmniVoice task completed but missing audio uri");
        return { ok: false };
      }
      audioUri = uri;
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
