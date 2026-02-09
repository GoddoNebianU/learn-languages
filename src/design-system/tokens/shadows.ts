/**
 * 阴影系统设计令牌
 *
 * 提供多层次的阴影效果，用于创建深度和层次感
 */

/**
 * 阴影级别
 */
export const boxShadow = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  none: 'none',
} as const;

/**
 * 语义化阴影
 */
export const semanticShadow = {
  // 按钮
  button: {
    sm: boxShadow.sm,
    md: boxShadow.DEFAULT,
    lg: boxShadow.md,
  },

  // 卡片
  card: {
    default: boxShadow.xl,
    bordered: 'none',
    elevated: boxShadow['2xl'],
  },

  // 模态框/弹窗
  modal: boxShadow['2xl'],
  dropdown: boxShadow.lg,
  popover: boxShadow.lg,
  tooltip: boxShadow.md,

  // 导航栏
  navbar: boxShadow.sm,

  // 输入框 focus
  focus: `0 0 0 3px rgba(53, 120, 111, 0.1)`, // primary-500 的 10% 透明度
} as const;

/**
 * 颜色阴影（用于特定元素的阴影）
 */
export const coloredShadow = {
  primary: `0 4px 14px 0 rgba(53, 120, 111, 0.39)`,
  success: `0 4px 14px 0 rgba(34, 197, 94, 0.39)`,
  warning: `0 4px 14px 0 rgba(245, 158, 11, 0.39)`,
  error: `0 4px 14px 0 rgba(239, 68, 68, 0.39)`,
  info: `0 4px 14px 0 rgba(59, 130, 246, 0.39)`,
} as const;
