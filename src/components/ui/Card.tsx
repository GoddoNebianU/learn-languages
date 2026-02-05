/**
 * Card - 可复用的卡片组件
 *
 * 提供应用统一的标准白色卡片样式：
 * - 白色背景
 * - 圆角 (rounded-2xl)
 * - 阴影 (shadow-xl)
 * - 可配置内边距
 * - 多种样式变体
 *
 * @example
 * ```tsx
 * // 默认卡片
 * <Card>
 *   <p>卡片内容</p>
 * </Card>
 *
 * // 带边框的卡片
 * <Card variant="bordered" padding="lg">
 *   <p>带边框的内容</p>
 * </Card>
 *
 * // 无内边距卡片
 * <Card padding="none">
 *   <img src="image.jpg" alt="完全填充的图片" />
 * </Card>
 * ```
 */
export type CardVariant = "default" | "bordered" | "elevated";
export type CardPadding = "none" | "sm" | "md" | "lg" | "xl";

export interface CardProps {
  children: React.ReactNode;
  /** 额外的 CSS 类名，用于自定义样式 */
  className?: string;
  /** 卡片样式变体 */
  variant?: CardVariant;
  /** 内边距大小 */
  padding?: CardPadding;
}

// 变体样式映射
const variantClasses: Record<CardVariant, string> = {
  default: "bg-white shadow-xl",
  bordered: "bg-white border-2 border-gray-200",
  elevated: "bg-white shadow-2xl",
};

// 内边距映射
const paddingClasses: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
  xl: "p-8 md:p-12",
};

export function Card({
  children,
  className = "",
  variant = "default",
  padding = "md",
}: CardProps) {
  const baseClasses = "rounded-2xl";
  const variantClass = variantClasses[variant];
  const paddingClass = paddingClasses[padding];

  return (
    <div className={`${baseClasses} ${variantClass} ${paddingClass} ${className}`}>
      {children}
    </div>
  );
}
