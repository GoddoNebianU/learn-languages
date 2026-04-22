/**
 * PageHeader - 页面标题组件
 *
 * 使用 Design System 重写的页面标题组件
 */
import { VStack } from "@/design-system/stack";
import { cn } from "@/utils/cn";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function PageHeader({ title, subtitle, className }: PageHeaderProps) {
  return (
    <VStack gap={2} className={cn("mb-6", className)}>
      <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </VStack>
  );
}
