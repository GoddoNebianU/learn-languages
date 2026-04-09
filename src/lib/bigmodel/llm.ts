"use server";

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

  const response = await fetch(process.env.ZHIPU_API_URL || "https://open.bigmodel.cn/api/paas/v4/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.ZHIPU_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.ZHIPU_MODEL_NAME || "glm-4.6",
      messages,
      temperature: 0.2,
      thinking: {
        type: "disabled"
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API 请求失败: ${response.status}`);
  }

  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("AI API 返回空响应");
  }

  return content.trim();
}

export { getAnswer };
