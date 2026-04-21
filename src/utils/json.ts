export function parseAIGeneratedJSON<T>(aiResponse: string): T {
  // 匹配 ```json ... ``` 或 ```JSON ... ``` 或 ``` ... ``` 包裹的内容
  const jsonMatch = aiResponse.match(/```(?:json|JSON)?\s*([\s\S]*?)\s*```/i);

  if (jsonMatch && jsonMatch[1]) {
    try {
      return JSON.parse(jsonMatch[1].trim());
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to parse JSON: ${error.message}`);
      } else if (typeof error === 'string') {
        throw new Error(`Failed to parse JSON: ${error}`);
      } else {
        throw new Error('Failed to parse JSON: Unknown error');
      }
    }
  }

  // 如果没有找到json代码块，尝试直接解析整个字符串
  try {
    return JSON.parse(aiResponse.trim());
  } catch (error) {
    throw new Error('No valid JSON found in the response');
  }
}