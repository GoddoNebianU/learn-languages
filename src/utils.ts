import { GoogleGenAI } from "@google/genai";

export function inspect(word: string) {
    const goto = (url: string) => {
        window.open(url, '_blank');
    }
    return () => {
        word = word.toLowerCase();
        goto(`https://www.youdao.com/result?word=${word}&lang=en`);
    }
}

export function urlGoto(url: string) {
    window.open(url, '_blank');
}

const ai = new GoogleGenAI({});
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
export async function getIPA(text: string) {
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
