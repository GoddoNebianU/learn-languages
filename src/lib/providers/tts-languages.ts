/**
 * TTS 支持的语言类型。
 *
 * 本文件不含 `"use server"` 指令，仅为纯类型定义模块，
 * 供 `tts.ts` (server module) 和消费方以 `import type` 引用，
 * 避免 Turbopack 在 `"use server"` 模块中无法正确擦除 `type` 别名导致的运行时 ReferenceError。
 */
export type TTS_SUPPORTED_LANGUAGES =
  | "Auto" // 自动检测（混合语言场景）
  | "Chinese" // 中文
  | "English" // 英文
  | "German" // 德文
  | "Italian"
  | "Portuguese"
  | "Spanish"
  | "Japanese"
  | "Korean"
  | "French"
  | "Russian";
