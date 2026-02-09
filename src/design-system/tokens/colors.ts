/**
 * 颜色系统设计令牌
 *
 * 基于 8 色阶系统（50-900），提供完整的颜色语义化命名
 *
 * 主色：Teal (#35786f)
 * - 用于主要操作按钮、链接、重要元素
 *
 * 语义色：
 * - success: 成功状态
 * - warning: 警告状态
 * - error: 错误/危险状态
 * - info: 信息提示
 */

/**
 * 主色 - Teal
 */
export const primary = {
  50: '#f0f9f8',
  100: '#e0f2f0',
  200: '#bce6e1',
  300: '#8dd4cc',
  400: '#5ec2b7',
  500: '#35786f',
  600: '#2a605b',
  700: '#1f4844',
  800: '#183835',
  900: '#122826',
  950: '#0a1413',
} as const;

/**
 * 中性色 - Gray
 */
export const gray = {
  50: '#f9fafb',
  100: '#f3f4f6',
  200: '#e5e7eb',
  300: '#d1d5db',
  400: '#9ca3af',
  500: '#6b7280',
  600: '#4b5563',
  700: '#374151',
  800: '#1f2937',
  900: '#111827',
  950: '#030712',
} as const;

/**
 * 语义色 - Success
 */
export const success = {
  50: '#f0fdf4',
  100: '#dcfce7',
  200: '#bbf7d0',
  300: '#86efac',
  400: '#4ade80',
  500: '#22c55e',
  600: '#16a34a',
  700: '#15803d',
  800: '#166534',
  900: '#14532d',
  950: '#052e16',
} as const;

/**
 * 语义色 - Warning
 */
export const warning = {
  50: '#fffbeb',
  100: '#fef3c7',
  200: '#fde68a',
  300: '#fcd34d',
  400: '#fbbf24',
  500: '#f59e0b',
  600: '#d97706',
  700: '#b45309',
  800: '#92400e',
  900: '#78350f',
  950: '#451a03',
} as const;

/**
 * 语义色 - Error
 */
export const error = {
  50: '#fef2f2',
  100: '#fee2e2',
  200: '#fecaca',
  300: '#fca5a5',
  400: '#f87171',
  500: '#ef4444',
  600: '#dc2626',
  700: '#b91c1c',
  800: '#991b1b',
  900: '#7f1d1d',
  950: '#450a0a',
} as const;

/**
 * 语义色 - Info
 */
export const info = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
  950: '#172554',
} as const;

/**
 * 完整的颜色令牌集合
 */
export const colors = {
  primary,
  gray,
  success,
  warning,
  error,
  info,

  // 语义别名
  semantic: {
    success: success,
    warning: warning,
    error: error,
    info: info,
  },

  // 通用别名
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',

  // 前景色
  foreground: gray[900],
  'foreground-secondary': gray[600],
  'foreground-tertiary': gray[500],
  'foreground-disabled': gray[400],

  // 背景色
  background: gray[50],
  'background-secondary': gray[100],
  'background-tertiary': gray[200],

  // 边框色
  border: gray[300],
  'border-secondary': gray[200],
  'border-focus': primary[500],

  // 阴影
  shadow: 'rgba(0, 0, 0, 0.1)',
} as const;

export type Colors = typeof colors;
