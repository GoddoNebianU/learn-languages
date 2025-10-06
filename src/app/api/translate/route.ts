import { callZhipuAPI } from "@/utils";
import { NextRequest, NextResponse } from "next/server";

async function translate(text: string, target_lang: string) {
    console.log(`translate "${text}" into ${target_lang}`);
    const messages = [
        {
            role: 'user', content: `
请推断以下文本的语言、locale，生成宽式国际音标（IPA），并翻译到${target_lang}，同样需要语言、locale、IPA信息，以JSON格式返回
[${text}]
结果如：
{
    "source": {
        "text": "你好。",
        "lang": "mandarin",
        "ipa": "[ni˨˩˦ xɑʊ˨˩˦]",
        "locale": "zh-CN"
    },
    "target": {
        "text": "Hallo.",
        "lang": "german",
        "ipa": " [haˈloː]",
        "locale": "de-DE"
    }
}
注意：
直接返回json文本，
ipa一定要加[]，
lang的值是小写字母的英文的语言名称，
locale如果可能有多个，选取最可能的一个，其中使用符号"-"
`
        }];
    try {
        const response = await callZhipuAPI(messages);
        let to_parse = response.choices[0].message.content.trim() as string;
        if (to_parse.startsWith('`')) to_parse = to_parse.slice(7, to_parse.length - 3);
        if (to_parse.length === 0) throw Error('ai啥也每说');
        return JSON.parse(to_parse);
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const text = searchParams.get('text');
        const target_lang = searchParams.get('target');

        if (!text || !target_lang) {
            return NextResponse.json(
                { error: "查询参数错误", message: "text参数, target参数是必需的" },
                { status: 400 }
            );
        }

        const textInfo = await translate(text, target_lang);
        if (!textInfo) {
            return NextResponse.json(
                { error: "服务暂时不可用", message: "LLM API 请求失败" },
                { status: 503 }
            );
        }
        return NextResponse.json(textInfo, { status: 200 });
    } catch (error) {
        console.error('API 错误:', error);
        return NextResponse.json(
            { error: "服务器内部错误", message: "请稍后重试" },
            { status: 500 }
        );
    }
}