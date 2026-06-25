"use server";

import { createLogger } from "@/lib/logger";
import { getServices, getTtsConfig } from "@/lib/capability";
import { getCurrentUserId } from "@/modules/shared/action-utils";
import { logActivity } from "@/modules/activity/activity-service";
import { ACTIVITY_ACTIONS } from "@/modules/activity/activity-constants";

const log = createLogger("tts");

/**
 * TTS 对接 inference.sh 托管的 OmniVoice (infsh/omnivoice) 应用。
 * - 鉴权: Bearer API Key (Authorization: Bearer ...)
 * - 接口: POST https://api.inference.sh/run (异步任务, 立即返回 status<10)
 * - 轮询: GET /tasks/:id 直到 status=10
 * - 取音频: output.audio 是裸字符串 URL (WAV 24kHz), 二次 GET 下载
 * - 语言: OmniVoice 从 text 自动推导 (支持 600+ 语言)
 * - 音色: voice_design 模式, 年轻女性
 *
 * 对外只导出 synthesizeTts server action, 不暴露 HTTP 接口。
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

// ==================== inference.sh OmniVoice ====================

function authHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "X-API-Version": "2",
  };
}

function extractAudioUri(output: unknown): string | null {
  if (!output || typeof output !== "object") return null;
  const o = output as Record<string, unknown>;
  const audio = o.audio;

  if (typeof audio === "string" && audio.startsWith("http")) return audio;
  if (audio && typeof audio === "object") {
    const uri = (audio as Record<string, unknown>).uri;
    if (typeof uri === "string" && uri.startsWith("http")) return uri;
  }
  for (const v of Object.values(o)) {
    if (typeof v === "string" && v.startsWith("http")) return v;
    if (v && typeof v === "object") {
      const uri = (v as Record<string, unknown>).uri;
      if (typeof uri === "string" && uri.startsWith("http")) return uri;
    }
  }
  return null;
}

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
      log.warn("OmniVoice completed but no audio url", {
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

async function fetchPrimaryTtsAudio(
  text: string
): Promise<{ ok: true; buffer: ArrayBuffer; contentType: string } | { ok: false }> {
  const config = await getTtsProviderConfig();
  if (!hasPrimary(config)) return { ok: false };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    let submitResp: Response;
    try {
      submitResp = await fetch(RUN_URL, {
        method: "POST",
        headers: authHeaders(config.apiKey),
        body: JSON.stringify({
          app: OMNIVOICE_APP,
          input: { text, mode: "voice_design", instruct: "female, young" },
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

    let audioUri: string;
    if (task.status === STATUS_COMPLETED) {
      const uri = extractAudioUri(task.output);
      if (!uri) {
        log.warn("OmniVoice completed but no audio url", {
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
 * 合成 TTS 音频 (server action)。
 * 调 inference.sh OmniVoice, 返回 base64 编码的 WAV 音频。
 * 不暴露 HTTP 接口 — 仅通过 server action RPC 从客户端调用。
 *
 * @returns null = 未配置或失败; { audio, contentType } = 成功
 */
export async function synthesizeTts(text: string): Promise<{
  audio: string;
  contentType: string;
} | null> {
  const result = await fetchPrimaryTtsAudio(text);
  if (!result.ok) return null;

  void logActivity({
    userId: await getCurrentUserId(),
    action: ACTIVITY_ACTIONS.TTS.SYNTHESIZE,
    entityType: "tts",
    metadata: { textLength: text.length },
  });

  return {
    audio: Buffer.from(result.buffer).toString("base64"),
    contentType: result.contentType,
  };
}
