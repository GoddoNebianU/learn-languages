import { env } from "process";

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
const API_KEY = env.ZHIPU_API_KEY;
export async function callZhipuAPI(messages: { role: string; content: string; }[], model = 'glm-4.5-flash') {
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
            temperature: 0.2,
            thinking: {
                type: 'disabled'
            }
        })
    });

    if (!response.ok) {
        throw new Error(`API 调用失败: ${response.status}`);
    }

    return await response.json();
}

