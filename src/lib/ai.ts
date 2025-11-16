import { format } from "util";

async function callZhipuAPI(
  messages: { role: string; content: string }[],
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
    throw new Error(`API 调用失败: ${response.status}`);
  }

  return await response.json();
}

export async function getLLMAnswer(prompt: string) {
  return (
    await callZhipuAPI([
      {
        role: "user",
        content: prompt,
      },
    ])
  ).choices[0].message.content.trim() as string;
}

export async function simpleGetLLMAnswer(
  prompt: string,
  searchParams: URLSearchParams,
  args: string[],
) {
  if (args.some((arg) => typeof searchParams.get(arg) !== "string")) {
    return Response.json({
      status: "error",
      message: "Missing required parameters",
    });
  }
  return Response.json({
    status: "success",
    message: await getLLMAnswer(
      format(prompt, ...args.map((v) => searchParams.get(v))),
    ),
  });
}
