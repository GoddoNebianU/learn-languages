/**
 * Design System 设计令牌统一导出
 *
 * 包含所有设计系统的原始令牌
 */

export * from './colors';
export * from './spacing';
export * from './typography';
export * from './borders';
export * from './shadows';

import type { Colors } from './colors';

/**
 * 完整的设计令牌类型
 */
export interface DesignTokens {
  colors: Colors;
  spacing: typeof import('./spacing').spacing;
  semanticSpacing: typeof import('./spacing').semanticSpacing;
  sizes: typeof import('./spacing').sizes;
  fontFamily: typeof import('./typography').fontFamily;
  fontSize: typeof import('./typography').fontSize;
  fontWeight: typeof import('./typography').fontWeight;
  letterSpacing: typeof import('./typography').letterSpacing;
  typography: typeof import('./typography').typography;
  borderRadius: typeof import('./borders').borderRadius;
  borderWidth: typeof import('./borders').borderWidth;
  boxShadow: typeof import('./shadows').boxShadow;
}

/**
 * 设计令牌常量（供 TypeScript 类型使用）
 */
export const tokens = {
  colors: {} as Colors,
} as const;
