import { NextRequest } from "next/server";
import { fetchPrimaryTtsAudio } from "@/lib/providers/tts";
import type { TTS_SUPPORTED_LANGUAGES } from "@/lib/providers/tts-languages";
import { getCurrentUserId } from "@/modules/shared/action-utils";
import { logActivity } from "@/modules/activity/activity-service";
import { ACTIVITY_ACTIONS } from "@/modules/activity/activity-constants";

/**
 * TTS 代理路由。
 * 调用自定义 TTS 接口 (返回 wav)。凭据在服务端从 DB 读取,不暴露给前端。
 */
export async function GET(request: NextRequest) {
  const text = request.nextUrl.searchParams.get("text");
  const langParam = (request.nextUrl.searchParams.get("lang") ?? "Auto") as TTS_SUPPORTED_LANGUAGES;

  if (!text) {
    return new Response("Missing 'text' parameter", { status: 400 });
  }

  const primary = await fetchPrimaryTtsAudio(text);
  if (primary.ok) {
    void logActivity({
      userId: await getCurrentUserId(),
      action: ACTIVITY_ACTIONS.TTS.SYNTHESIZE,
      entityType: "tts",
      metadata: { provider: "primary", lang: langParam, textLength: text.length },
    });
    return new Response(primary.buffer, {
      headers: {
        "Content-Type": primary.contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  }

  return new Response("TTS synthesis failed (primary unavailable)", { status: 502 });
}
