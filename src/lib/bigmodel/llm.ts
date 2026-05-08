"use server";

import { createLogger } from "@/lib/logger";
import { getServices, getLlmConfig } from "@/lib/capability";

const log = createLogger("llm");

type Messages = Array<
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | { role: "assistant"; content: string }
>;

type GetAnswerOptions = {
  jsonMode?: boolean;
};

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

async function getAnswer(prompt: string, options?: GetAnswerOptions): Promise<string>;
async function getAnswer(prompt: Messages, options?: GetAnswerOptions): Promise<string>;
async function getAnswer(prompt: string | Messages, options?: GetAnswerOptions): Promise<string> {
  const services = await getServices();
  const { apiKey, apiUrl, modelName } = getLlmConfig(services);

  if (!apiKey) {
    throw new Error("LLM API key is not configured. Set it in SystemConfig services.");
  }

  const messages: Messages =
    typeof prompt === "string" ? [{ role: "user", content: prompt }] : prompt;

  const body: Record<string, unknown> = {
    model: modelName,
    messages,
    temperature: 0.2,
  };

  if (options?.jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const response = await fetchWithRetry(
    apiUrl,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
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
export type { GetAnswerOptions };
