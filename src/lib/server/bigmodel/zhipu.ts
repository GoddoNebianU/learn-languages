"use server";

type Messages = { role: string; content: string; }[];

async function callZhipuAPI(
  messages: Messages,
  model = process.env.ZHIPU_MODEL_NAME,
) {
  const url = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + process.env.ZHIPU_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.2,
      thinking: {
        type: "disabled",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`API 调用失败: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function getAnswer(prompt: string): Promise<string>;
async function getAnswer(prompt: Messages): Promise<string>;
async function getAnswer(prompt: string | Messages): Promise<string> {
  const messages = typeof prompt === "string"
    ? [{ role: "user", content: prompt }]
    : prompt;

  const response = await callZhipuAPI(messages);
  return response.choices[0].message.content.trim() as string;
}

export { getAnswer };