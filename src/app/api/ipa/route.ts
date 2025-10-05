import { NextRequest, NextResponse } from "next/server";
import { env } from "process";

const API_KEY = env.ZHIPU_API_KEY;

async function callZhipuAPI(messages: { role: string, content: string }[], model = 'glm-4.5-flash') {
    const url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: 0.6
        })
    });

    if (!response.ok) {
        throw new Error(`API 调用失败: ${response.status}`);
    }

    return await response.json();
}



// callZhipuAPI(messages)
//     .then(result => {
//         console.log(result.choices[0].message.content);
//     })
//     .catch(error => {
//         console.error('错误:', error);
//     });

async function getIPAFromLLM(text: string) {
    const messages = [
        {
            role: 'user', content: `
[TEXT]
请推断以上文本的语言，并返回其宽式国际音标(IPA)，以JSON格式
如：
{
"lang": "german",
"ipa": "[ˈɡuːtn̩ ˈtaːk]"
}
注意：直接返回json文本，
不要带markdown记号，
ipa一定要加[]，
lang的值是小写英语的语言名称
`.replace('[TEXT]', text)
        }
    ];
    try {
        const response = await callZhipuAPI(messages);
        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const text = searchParams.get('text');

        if (!text) {
            return NextResponse.json(
                { error: "查询参数错误", message: "text 参数是必需的" },
                { status: 400 }
            );
        }

        const ipaData = await getIPAFromLLM(text);

        if (!ipaData) {
            return NextResponse.json(
                { error: "服务暂时不可用", message: "LLM API 请求失败" },
                { status: 503 }
            );
        }

        return NextResponse.json(ipaData, { status: 200 });

    } catch (error) {
        console.error('API 错误:', error);

        return NextResponse.json(
            { error: "服务器内部错误", message: "请稍后重试" },
            { status: 500 }
        );
    }
}