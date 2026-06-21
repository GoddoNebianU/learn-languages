"use server";

import { createLogger } from "@/lib/logger";
import { getServices, getTtsConfig } from "@/lib/capability";
import type { TTS_SUPPORTED_LANGUAGES } from "./tts-languages";

const log = createLogger("tts");

// ==================== 配置访问 ====================

async function getTtsProviderConfig() {
  const services = await getServices();
  const c = getTtsConfig(services);
  return {
    primaryUrl: c.primaryUrl,
    primaryUsername: c.primaryUsername,
    primaryPassword: c.primaryPassword,
    apiKey: c.apiKey, // DashScope (fallback)
  };
}

function hasPrimary(config: {
  primaryUrl: string;
  primaryUsername: string;
  primaryPassword: string;
}): boolean {
  return !!(config.primaryUrl && config.primaryUsername && config.primaryPassword);
}

// ==================== Primary TTS (自定义接口, 返回 wav) ====================
// 供 /api/tts route 调用。凭据从 DB 读取,不暴露前端。

export async function fetchPrimaryTtsAudio(
  text: string
): Promise<{ ok: true; buffer: ArrayBuffer; contentType: string } | { ok: false }> {
  const config = await getTtsProviderConfig();
  if (!hasPrimary(config)) return { ok: false };

  try {
    const url = `${config.primaryUrl}?text=${encodeURIComponent(text)}`;
    const auth = Buffer.from(`${config.primaryUsername}:${config.primaryPassword}`).toString("base64");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    try {
      const resp = await fetch(url, {
        headers: { Authorization: `Basic ${auth}` },
        signal: controller.signal,
      });
      if (!resp.ok) {
        log.warn("Primary TTS request failed", { status: resp.status });
        return { ok: false };
      }
      const buffer = await resp.arrayBuffer();
      const contentType = resp.headers.get("content-type") ?? "audio/wav";
      return { ok: true, buffer, contentType };
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    log.warn("Primary TTS error", { error: error instanceof Error ? error.message : String(error) });
    return { ok: false };
  }
}

// ==================== DashScope TTS (fallback, 返回 URL) ====================

interface TTSRequest {
  model: string;
  input: {
    text: string;
    voice: string;
    language_type?: TTS_SUPPORTED_LANGUAGES;
  };
  parameters?: { stream?: boolean };
}

interface TTSResponse {
  status_code: number;
  request_id: string;
  code: string;
  message: string;
  output: {
    audio: { data: string; url: string; id: string; expires_at: number };
    text: null;
    choices: null;
    finish_reason: string;
  };
  usage: { characters: number; input_tokens?: number; output_tokens?: number };
}

class QwenTTSService {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl =
      "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation";
  }

  private validateTextLength(text: string, model: string): void {
    const maxLength = model.includes("qwen3-tts-flash") ? 600 : 512;
    if (text.length > maxLength) {
      throw new Error(`文本长度 ${text.length} 字符超过模型限制（最大 ${maxLength} 字符）`);
    }
  }

  async synthesize(
    text: string,
    voice: string,
    language: TTS_SUPPORTED_LANGUAGES,
    model = "qwen3-tts-flash"
  ): Promise<TTSResponse> {
    this.validateTextLength(text, model);
    const requestBody: TTSRequest = { model, input: { text, voice, language_type: language } };
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    if (response.status !== 200) {
      throw new Error(`TTS API错误: [${response.status}] ${response.statusText}`);
    }
    return response.json();
  }
}

/** 供 /api/tts route fallback 调用,返回 DashScope 音频 URL 或 null。 */
export async function getQwenTtsUrl(
  text: string,
  lang: TTS_SUPPORTED_LANGUAGES
): Promise<string | null> {
  const config = await getTtsProviderConfig();
  if (!config.apiKey) return null;
  try {
    const service = new QwenTTSService(config.apiKey);
    const result = await service.synthesize(text, "Jennifer", lang);
    return result.output.audio.url ?? null;
  } catch (error) {
    log.error("DashScope TTS synthesis failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

// DashScope URL 缓存 (primary wav 二进制不缓存)
const ttsCache = new Map<string, { url: string; expiresAt: number }>();

// ==================== 对外接口 ====================

/**
 * 获取 TTS 音频 URL。
 * - 配了 primary (自定义接口): 返回 `/api/tts` 代理 URL,由 route 处理优先级和 fallback
 * - 没配 primary: 直接走 DashScope 返回其 URL (带缓存)
 */
export async function getTTSUrl(
  text: string,
  lang: TTS_SUPPORTED_LANGUAGES,
  regenerate = false
): Promise<string | null> {
  const config = await getTtsProviderConfig();

  if (hasPrimary(config)) {
    const base = `/api/tts?text=${encodeURIComponent(text)}&lang=${encodeURIComponent(lang)}`;
    return regenerate ? `${base}&_t=${Date.now()}` : base;
  }

  try {
    const voice = "Jennifer";
    const cacheKey = `${voice}:${lang}:${text}`;
    if (!regenerate) {
      const cached = ttsCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now() / 1000) {
        log.debug("TTS cache hit", { textLength: text.length, lang });
        return cached.url;
      }
    }
    if (!config.apiKey) return null;
    const service = new QwenTTSService(config.apiKey);
    const result = await service.synthesize(text, voice, lang);
    const url = result.output.audio.url;
    const expiresAt = result.output.audio.expires_at;
    if (url && expiresAt) {
      ttsCache.set(cacheKey, { url, expiresAt });
    }
    return url;
  } catch (error) {
    log.error("TTS synthesis failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
