"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.ZHIPU_API_KEY,
  baseURL: "https://open.bigmodel.cn/api/paas/v4",
});

type Messages = Array<
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | { role: "assistant"; content: string }
>;

async function getAnswer(prompt: string): Promise<string>;
async function getAnswer(prompt: Messages): Promise<string>;
async function getAnswer(prompt: string | Messages): Promise<string> {
  const messages: Messages = typeof prompt === "string"
    ? [{ role: "user", content: prompt }]
    : prompt;

  const response = await openai.chat.completions.create({
    model: process.env.ZHIPU_MODEL_NAME || "glm-4",
    messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    temperature: 0.2,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI API 返回空响应");
  }

  return content.trim();
}

export { getAnswer };
