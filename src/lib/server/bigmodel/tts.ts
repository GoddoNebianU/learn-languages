// ==================== 类型定义 ====================
/**
 * 支持的语音合成模型
 */
type TTSModel = 'qwen3-tts-flash' | string; // 主要模型为 'qwen3-tts-flash'

/**
 * API 支持的语言类型（必须严格按文档使用）
 */
type SupportedLanguage =
    | 'Auto'        // 自动检测（混合语言场景）
    | 'Chinese'     // 中文
    | 'English'     // 英文
    | 'German'      // 德文
    | 'Italian' | 'Portuguese' | 'Spanish'
    | 'Japanese' | 'Korean' | 'French'
    | 'Russian';

/**
 * API 请求参数接口
 */
interface TTSRequest {
    model: TTSModel;
    input: {
        text: string;           // 要合成的文本（qwen3-tts-flash最长600字符）
        voice: string;          // 音色名称，如 'Cherry'
        language_type?: SupportedLanguage; // 可选，默认为 'Auto'
    };
    parameters?: {
        stream?: boolean;       // 是否流式输出（需配合特定Header）
    };
}

/**
 * API 响应接口（通用结构）
 */
interface TTSResponse {
    status_code: number;      // HTTP状态码，200表示成功
    request_id: string;       // 请求唯一标识，用于排查问题
    code: string;            // 错误码，成功时为 ''
    message: string;         // 错误信息，成功时为 ''
    output: {
        audio: {
            data: string;        // Base64编码的音频数据（流式输出时有效）
            url: string;         // 音频文件下载URL（非流式输出时有效）
            id: string;          // 音频ID
            expires_at: number;  // URL过期时间戳
        };
        text: null;            // 文档注明：始终为null
        choices: null;         // 文档注明：始终为null
        finish_reason: string; // 生成状态
    };
    usage: {
        characters: number;    // 计费字符数（qwen3-tts-flash）
        input_tokens?: number;
        output_tokens?: number;
    };
}

// ==================== TTS 服务类 ====================
class QwenTTSService {
    private baseUrl: string;
    private apiKey: string;
    private region: 'cn-beijing' | 'intl-singapore'; // 地域

    /**
     * 构造函数
     * @param apiKey - DashScope API Key（从环境变量获取更安全）
     * @param region - 服务地域，默认北京
     */
    constructor(
        apiKey: string,
        region: 'cn-beijing' | 'intl-singapore' = 'cn-beijing'
    ) {
        this.apiKey = apiKey;
        this.region = region;

        // 根据地域设置API端点（文档中特别强调）
        this.baseUrl = region === 'cn-beijing'
            ? 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation'
            : 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';
    }

    /**
     * 验证文本长度（qwen3-tts-flash模型限制600字符）
     */
    private validateTextLength(text: string, model: TTSModel): void {
        const maxLength = model.includes('qwen3-tts-flash') ? 600 : 512;
        if (text.length > maxLength) {
            throw new Error(
                `文本长度 ${text.length} 字符超过模型限制（最大 ${maxLength} 字符）`
            );
        }
    }

    /**
     * 合成语音（非流式输出，返回音频URL）
     */
    async synthesize(
        text: string,
        options: {
            voice?: string;           // 音色，默认 'Cherry'
            language?: SupportedLanguage; // 语种，默认 'Auto'
            model?: TTSModel;         // 模型，默认 'qwen3-tts-flash'
        } = {}
    ): Promise<TTSResponse> {
        const {
            voice = 'Cherry',
            language = 'Auto',
            model = 'qwen3-tts-flash'
        } = options;

        // 1. 文本长度验证
        this.validateTextLength(text, model);

        // 2. 构建请求体
        const requestBody: TTSRequest = {
            model,
            input: {
                text,
                voice,
                language_type: language
            }
            // 非流式输出不需要 stream 参数
        };

        try {
            // 3. 调用API
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const data: TTSResponse = await response.json();

            // 4. 错误处理
            if (data.status_code !== 200) {
                throw new Error(`API错误: [${data.code}] ${data.message}`);
            }

            return data;

        } catch (error) {
            console.error('语音合成请求失败:', error);
            throw error;
        }
    }

    /**
     * 流式合成语音（边生成边输出Base64音频数据）
     */
    async synthesizeStream(
        text: string,
        options: {
            voice?: string;
            language?: SupportedLanguage;
            model?: TTSModel;
            onAudioChunk?: (chunk: string) => void; // 接收音频片段的回调
        } = {}
    ): Promise<void> {
        const {
            voice = 'Cherry',
            language = 'Auto',
            model = 'qwen3-tts-flash',
            onAudioChunk
        } = options;

        this.validateTextLength(text, model);

        const requestBody: TTSRequest = {
            model,
            input: {
                text,
                voice,
                language_type: language
            },
            parameters: {
                stream: true // 启用流式输出
            }
        };

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'X-DashScope-SSE': 'enable' // 关键：启用服务器发送事件
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok || !response.body) {
                throw new Error(`流式请求失败: ${response.status}`);
            }

            // 处理流式响应（此处为简化示例，实际需解析SSE格式）
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                if (onAudioChunk && chunk.trim()) {
                    onAudioChunk(chunk); // 处理音频数据片段
                }
            }

        } catch (error) {
            console.error('流式合成失败:', error);
            throw error;
        }
    }
}

export type TTS_SUPPORTED_LANGUAGES = 'Auto' | 'Chinese' | 'English' | 'German' | 'Italian' | 'Portuguese' | 'Spanish' | 'Japanese' | 'Korean' | 'French' | 'Russian';
export async function getTTSUrl(text: string, lang: TTS_SUPPORTED_LANGUAGES) {
    try {
        if (!process.env.DASHSCORE_API_KEY) {
            console.warn(
                `⚠️  环境变量 DASHSCORE_API_KEY 未设置\n` +
                `   请在 .env 文件中设置或直接传入API Key\n` +
                `   获取API Key: https://help.aliyun.com/zh/model-studio/get-api-key`
            );
            throw "API Key设置错误";
        }
        const ttsService = new QwenTTSService(
            process.env.DASHSCOPE_API_KEY || 'sk-xxx',
        );
        const result = await ttsService.synthesize(
            text,
            {
                voice: 'Cherry',
                language: lang
            }
        );
        return result.output.audio.url;
    } catch (error) {
        console.error('TTS合成失败:', error instanceof Error ? error.message : error);
        return "error";
    }
}
