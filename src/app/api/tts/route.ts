import { NextRequest } from "next/server";
import { fetchPrimaryTtsAudio } from "@/lib/providers/tts";
import { getCurrentUserId } from "@/modules/shared/action-utils";
import { logActivity } from "@/modules/activity/activity-service";
import { ACTIVITY_ACTIONS } from "@/modules/activity/activity-constants";

/**
 * TTS 代理路由。
 * 调用 OmniVoice TTS 接口 (返回 wav)。凭据在服务端从 DB 读取,不暴露给前端。
 * lang 可选,格式为首字母大写的英文语言名 (如 Chinese / English / Esperanto);
 * 缺省或不支持时 OmniVoice 自动从 text 推导。OmniVoice 支持 600+ 语言。
 */
export async function GET(request: NextRequest) {
  const text = request.nextUrl.searchParams.get("text");
  const langParam = request.nextUrl.searchParams.get("lang") ?? "Auto";

  if (!text) {
    return new Response("Missing 'text' parameter", { status: 400 });
  }

  const primary = await fetchPrimaryTtsAudio(text, langParam);
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
