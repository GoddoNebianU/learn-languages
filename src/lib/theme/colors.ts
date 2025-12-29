/**
 * 主题配色常量
 * 集中管理应用的品牌颜色
 *
 * 注意：Tailwind CSS 已有的标准颜色（gray、red 等）请直接使用 Tailwind 类名
 * 这里只定义项目独有的品牌色
 */
export const COLORS = {
  // ===== 主色调 =====
  /** 主绿色 - 应用主题色，用于页面背景、主要按钮 */
  primary: '#35786f',
  /** 悬停绿色 - 按钮悬停状态 */
  primaryHover: '#2d5f58'
} as const;
