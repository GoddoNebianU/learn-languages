/**
 * CardList - 可滚动的卡片列表容器
 *
 * 使用 Design System 重写的卡片列表组件
 */
import { VStack } from "@/design-system/stack";
import { cn } from "@/utils/cn";

interface CardListProps {
  children: React.ReactNode;
  className?: string;
}

export function CardList({ children, className }: CardListProps) {
  return (
    <div className={cn("max-h-96 overflow-y-auto rounded-lg border-2 border-gray-200", className)}>
      <VStack gap={0} align="stretch">
        {children}
      </VStack>
    </div>
  );
}
