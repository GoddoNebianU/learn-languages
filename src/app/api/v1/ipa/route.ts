import { simpleGetLLMAnswer } from "@/lib/ai";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return await simpleGetLLMAnswer(
    `请生成[[[%s]]]的严式国际音标(International Phonetic Alphabet)，然后直接发给我,不要附带任何说明。`,
    req.nextUrl.searchParams,
    ["text"],
  );
}
