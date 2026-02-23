/**
 * Container - 容器组件
 *
 * 使用 Design System 重写的容器组件
 */
import { Container as DSContainer } from "@/design-system/layout/container/container";
import { Card } from "@/design-system/base/card/card";

interface ContainerProps {
  children?: React.ReactNode;
  className?: string;
}

export function Container({ children, className = "" }: ContainerProps) {
  return (
    <DSContainer size="2xl" className={`mx-auto ${className}`}>
      <Card variant="bordered" padding="md">
        {children}
      </Card>
    </DSContainer>
  );
}
