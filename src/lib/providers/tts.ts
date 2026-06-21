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

// ==================== 对外接口 ====================

/**
 * 获取 TTS 音频 URL。
 * - 配了 primary (自定义接口): 返回 `/api/tts` 代理 URL,由 route 处理请求
 * - 没配 primary: 返回 null
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

  log.warn("TTS not configured (primary missing)");
  return null;
}
