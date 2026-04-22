"use server";

import { createLogger } from "@/lib/logger";

const log = createLogger("llm");

type Messages = Array<
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | { role: "assistant"; content: string }
>;

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 2
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });

      if (response.status === 429 || response.status === 503) {
        if (attempt < maxRetries) {
          log.warn("Retrying LLM call", { attempt: attempt + 1, status: response.status });
          await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
          continue;
        }
      }

      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error("Max retries exceeded");
}

async function getAnswer(prompt: string): Promise<string>;
async function getAnswer(prompt: Messages): Promise<string>;
async function getAnswer(prompt: string | Messages): Promise<string> {
  if (!process.env.ZHIPU_API_KEY) {
    throw new Error("ZHIPU_API_KEY environment variable is not set");
  }

  const messages: Messages =
    typeof prompt === "string" ? [{ role: "user", content: prompt }] : prompt;

  const response = await fetchWithRetry(
    process.env.ZHIPU_API_URL || "https://open.bigmodel.cn/api/paas/v4/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ZHIPU_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.ZHIPU_MODEL_NAME || "glm-4.6",
        messages,
        temperature: 0.2,
        thinking: {
          type: "disabled",
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`AI API 请求失败: ${response.status}`);
  }

  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("AI API 返回空响应");
  }

  return content.trim();
}

export { getAnswer };
