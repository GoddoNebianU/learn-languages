/**
 * PageLayout - 页面布局组件
 *
 * 使用 Design System 重写的页面布局组件
 */
import { Card } from "@/design-system/base/card/card";
import { Container } from "@/design-system/layout/container/container";

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
};

export function PageLayout({
  children,
  className = "",
  variant = "centered-card",
  align = "center",
}: PageLayoutProps) {
  // 居中卡片布局
  if (variant === "centered-card") {
    return (
      <div className={`min-h-[calc(100vh-64px)] bg-primary-500 flex ${alignClasses[align]} justify-center px-4 py-8 ${className}`}>
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
      <div className={`min-h-[calc(100vh-64px)] bg-primary-500 px-4 py-8 ${className}`}>
        <Container size="2xl">
          {children}
        </Container>
      </div>
    );
  }

  // 全屏布局
  if (variant === "fullscreen") {
    return (
      <div className={`min-h-[calc(100vh-64px)] bg-primary-500 ${className}`}>
        {children}
      </div>
    );
  }

  return null;
}
