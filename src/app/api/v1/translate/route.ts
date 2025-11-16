import { simpleGetLLMAnswer } from "@/lib/ai";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return await simpleGetLLMAnswer(
    `请翻译文本[[[%s]]]到语言[[[%s]]]然后直接发给我,不要附带任何说明,不要新增任何符号。`,
    req.nextUrl.searchParams,
    ["text", "lang"],
  );
}
