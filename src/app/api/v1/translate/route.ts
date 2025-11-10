import { simpleGetLLMAnswer } from "@/lib/ai";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return await simpleGetLLMAnswer(
    `请翻译%s到%s然后直接发给我。`,
    req.nextUrl.searchParams,
    ["text", "lang"],
  );
}
