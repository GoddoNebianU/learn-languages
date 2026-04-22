/**
 * PageLayout - 页面布局组件
 *
 * 使用 Design System 重写的页面布局组件
 */
import { Card } from "@/design-system/card";
import { Container } from "@/design-system/container";
import { cn } from "@/utils/cn";

type PageLayoutVariant = "centered-card" | "full-width" | "fullscreen";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  variant?: PageLayoutVariant;
  align?: "center" | "start" | "end";
}

const alignClasses = {
  center: "items-center",
  start: "items-start",
  end: "items-end",
} as const;

export function PageLayout({
  children,
  className,
  variant = "centered-card",
  align = "center",
}: PageLayoutProps) {
  // 居中卡片布局
  if (variant === "centered-card") {
    return (
      <div
        className={cn(
          "flex min-h-[calc(100vh-64px)] justify-center bg-primary-500 px-4 py-8",
          alignClasses[align],
          className
        )}
      >
        <div className="w-full max-w-2xl">
          <Card padding="lg" className="p-6 md:p-8">
            {children}
          </Card>
        </div>
      </div>
    );
  }

  // 全宽布局
  if (variant === "full-width") {
    return (
      <div className={cn("min-h-[calc(100vh-64px)] bg-primary-500 px-4 py-8", className)}>
        <Container size="2xl">{children}</Container>
      </div>
    );
  }

  return <div className={cn("min-h-[calc(100vh-64px)] bg-primary-500", className)}>{children}</div>;
}
