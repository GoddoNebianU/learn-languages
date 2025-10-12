import { EdgeTTS, ProsodyOptions } from "edge-tts-universal/browser";
import { env } from "process";
import { TextSpeakerArraySchema } from "./interfaces";
import z from "zod";

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

export async function getTTSAudioUrl(text: string, short_name: string, options: ProsodyOptions | undefined = undefined) {
    const tts = new EdgeTTS(text, short_name, options);
    try {
        const result = await tts.synthesize();
        return URL.createObjectURL(result.audio);
    } catch (e) {
        throw e;
    }
}
export const getTextSpeakerData = () => {
    try {
        const item = localStorage.getItem('text-speaker');

        if (!item) return [];

        const rawData = JSON.parse(item);
        const result = TextSpeakerArraySchema.safeParse(rawData);

        if (result.success) {
            return result.data;
        } else {
            console.error('Invalid data structure in localStorage:', result.error);
            return [];
        }
    } catch (e) {
        console.error('Failed to parse text-speaker data:', e);
        return [];
    }
};
export const setTextSpeakerData = (data: z.infer<typeof TextSpeakerArraySchema>) => {
    if (!localStorage) return;
    localStorage.setItem('text-speaker', JSON.stringify(data));
};