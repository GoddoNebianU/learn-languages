/**
 * 边框和圆角系统设计令牌
 */

/**
 * 圆角半径
 */
export const borderRadius = {
  none: '0',
  sm: '0.125rem',    // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',
} as const;

/**
 * 语义化圆角
 */
export const semanticBorderRadius = {
  // 按钮
  button: {
    sm: borderRadius.lg,
    md: borderRadius.xl,
    lg: borderRadius['2xl'],
  },

  // 输入框
  input: {
    sm: borderRadius.md,
    md: borderRadius.lg,
    lg: borderRadius.xl,
  },

  // 卡片
  card: {
    sm: borderRadius.xl,
    md: borderRadius['2xl'],
    lg: borderRadius['3xl'],
  },

  // 模态框
  modal: borderRadius['2xl'],

  // 徽章/标签
  badge: borderRadius.full,

  // 圆形按钮/图标
  circle: borderRadius.full,
} as const;

/**
 * 边框宽度
 */
export const borderWidth = {
  DEFAULT: '1px',
  0: '0',
  2: '2px',
  4: '4px',
  8: '8px',
} as const;

/**
 * 边框样式
 */
export const borderStyle = {
  solid: 'solid',
  dashed: 'dashed',
  dotted: 'dotted',
  double: 'double',
} as const;
