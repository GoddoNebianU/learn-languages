"use server";

import { createLogger } from "@/lib/logger";
import { getServices, getTtsConfig } from "@/lib/capability";

const log = createLogger("tts");

/**
 * lang 参数语义:
 * - 空串或 "Auto": 不带 lang 参数, 由 OmniVoice 自动从 text 推导朗读语言
 * - 其他值: 首字母大写的英文语言名 (如 "Chinese" / "English" / "Esperanto");
 *   OmniVoice 支持 600+ 语言, 无法识别时也会回退到自动推导
 */
const AUTO_DETECT = "Auto";

function shouldSkipLang(lang: string): boolean {
  return !lang || lang === AUTO_DETECT;
}

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

// ==================== Primary TTS (OmniVoice, 返回 wav) ====================
// 供 /api/tts route 调用。凭据从 DB 读取,不暴露前端。

export async function fetchPrimaryTtsAudio(
  text: string,
  lang?: string
): Promise<{ ok: true; buffer: ArrayBuffer; contentType: string } | { ok: false }> {
  const config = await getTtsProviderConfig();
  if (!hasPrimary(config)) return { ok: false };

  try {
    let url = `${config.primaryUrl}?text=${encodeURIComponent(text)}`;
    if (lang && !shouldSkipLang(lang)) {
      url += `&lang=${encodeURIComponent(lang)}`;
    }
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
 * - 配了 primary: 返回 `/api/tts` 代理 URL, 由 route 调 OmniVoice
 * - 没配 primary: 返回 null
 * lang 为 "Auto" 或空时不带 lang 参数, 由 OmniVoice 自动推导。
 */
export async function getTTSUrl(
  text: string,
  lang: string,
  regenerate = false
): Promise<string | null> {
  const config = await getTtsProviderConfig();

  if (hasPrimary(config)) {
    const langParam = shouldSkipLang(lang) ? "" : `&lang=${encodeURIComponent(lang)}`;
    const base = `/api/tts?text=${encodeURIComponent(text)}${langParam}`;
    return regenerate ? `${base}&_t=${Date.now()}` : base;
  }

  log.warn("TTS not configured (primary missing)");
  return null;
}
