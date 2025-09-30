import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { env } from "process";

const api_key = env.GEMINI_API_KEY;
const ai = new GoogleGenAI(api_key ? { apiKey: api_key } : {});
const prompt = `[TEXT]
请推断以上文本的语言，并返回其宽式国际音标(IPA)，以JSON格式
如：
{
"lang": "german",
"ipa": "[ˈɡuːtn̩ ˈtaːk]"
}
注意：直接返回json文本，
不要带markdown记号，
ipa一定要加[]，
lang的值是小写英语的语言名称`;

async function getIPAFromGemini(text: string) {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt.replace("[TEXT]", text),
    });
    if (response.text === undefined) return null;
    return JSON.parse(response.text);
}

export async function ggetIPA(text: string): Promise<{ lang: string, ipa: string } | null> {
    return {
        lang: `(这是的${text}的lang)`,
        ipa: `(这是的${text}的ipa)`
    };
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    const text = searchParams.get('text');
    if (!text) return NextResponse.json("查询参数错误", { status: 400 });

    const r = await getIPAFromGemini(text);
    if (r === null) return NextResponse.json("Gemini Api请求失败", { status: 424 });

    return NextResponse.json({ r }, { status: 200 });
}
