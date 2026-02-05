/**
 * PageLayout - 统一的页面布局组件
 *
 * 提供应用统一的标准页面布局：
 * - 绿色背景 (#35786f)
 * - 最小高度 min-h-[calc(100vh-64px)]
 * - 支持多种布局变体
 *
 * @example
 * ```tsx
 * // 默认：居中白色卡片布局
 * <PageLayout>
 *   <PageHeader title="标题" subtitle="副标题" />
 *   <div>页面内容</div>
 * </PageLayout>
 *
 * // 全宽布局（无白色卡片）
 * <PageLayout variant="full-width" maxWidth="3xl">
 *   <div>页面内容</div>
 * </PageLayout>
 *
 * // 全屏布局（用于 translator 等）
 * <PageLayout variant="fullscreen">
 *   <div>全屏内容</div>
 * </PageLayout>
 * ```
 */
import { Card } from "./Card";

type PageLayoutVariant = "centered-card" | "full-width" | "fullscreen";
type MaxWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
type AlignItems = "center" | "start" | "end";

interface PageLayoutProps {
  children: React.ReactNode;
  /** 额外的 CSS 类名，用于自定义布局行为 */
  className?: string;
  /** 布局变体 */
  variant?: PageLayoutVariant;
  /** 最大宽度（仅对 full-width 变体有效） */
  maxWidth?: MaxWidth;
  /** 内容垂直对齐方式（仅对 centered-card 变体有效） */
  align?: AlignItems;
}

// 最大宽度映射
const maxWidthClasses: Record<MaxWidth, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  full: "max-w-full",
};

// 对齐方式映射
const alignClasses: Record<AlignItems, string> = {
  center: "items-center",
  start: "items-start",
  end: "items-end",
};

export function PageLayout({
  children,
  className = "",
  variant = "centered-card",
  maxWidth = "2xl",
  align = "center",
}: PageLayoutProps) {
  // 默认变体：居中白色卡片布局
  if (variant === "centered-card") {
    return (
      <div className={`min-h-[calc(100vh-64px)] bg-[#35786f] flex ${alignClasses[align]} justify-center px-4 py-8 ${className}`}>
        <div className="w-full max-w-2xl">
          <Card padding="lg" className="p-6 md:p-8">
            {children}
          </Card>
        </div>
      </div>
    );
  }

  // 全宽布局：绿色背景，最大宽度容器，无白色卡片
  if (variant === "full-width") {
    return (
      <div className={`min-h-[calc(100vh-64px)] bg-[#35786f] px-4 py-8 ${className}`}>
        <div className={`w-full ${maxWidthClasses[maxWidth]} mx-auto`}>
          {children}
        </div>
      </div>
    );
  }

  // 全屏布局：仅绿色背景，无其他限制
  if (variant === "fullscreen") {
    return (
      <div className={`min-h-[calc(100vh-64px)] bg-[#35786f] ${className}`}>
        {children}
      </div>
    );
  }

  return null;
}
