import { NextRequest } from "next/server";
import { fetchPrimaryTtsAudio, getQwenTtsUrl } from "@/lib/providers/tts";
import type { TTS_SUPPORTED_LANGUAGES } from "@/lib/providers/tts-languages";

/**
 * TTS 代理路由。
 * 优先调用自定义 TTS 接口 (返回 wav),失败 fallback 到 DashScope (重定向其音频 URL)。
 * 凭据在服务端从 DB 读取,不暴露给前端。
 */
export async function GET(request: NextRequest) {
  const text = request.nextUrl.searchParams.get("text");
  const langParam = (request.nextUrl.searchParams.get("lang") ?? "Auto") as TTS_SUPPORTED_LANGUAGES;

  if (!text) {
    return new Response("Missing 'text' parameter", { status: 400 });
  }

  // 1. 优先 primary TTS (自定义接口, 返回 wav 二进制)
  const primary = await fetchPrimaryTtsAudio(text);
  if (primary.ok) {
    return new Response(primary.buffer, {
      headers: {
        "Content-Type": primary.contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  }

  // 2. Fallback: DashScope (重定向到其音频 URL, <audio> 可跨域加载)
  const qwenUrl = await getQwenTtsUrl(text, langParam);
  if (qwenUrl) {
    return Response.redirect(qwenUrl, 302);
  }

  return new Response("TTS synthesis failed (primary and fallback both unavailable)", {
    status: 502,
  });
}
