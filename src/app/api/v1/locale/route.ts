import { simpleGetLLMAnswer } from "@/lib/ai";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return await simpleGetLLMAnswer(
    `请根据文本[[[%s]]]推断地区(locale)，形如zh-CN、en-US，然后直接发给我,不要附带任何说明。`,
    req.nextUrl.searchParams,
    ["text"],
  );
}
