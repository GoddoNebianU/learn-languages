/**
 * PageLayout - 统一的页面布局组件
 *
 * 提供应用统一的标准页面布局：
 * - 绿色背景 (#35786f)
 * - 居中的白色圆角卡片
 * - 响应式内边距
 *
 * @example
 * ```tsx
 * <PageLayout>
 *   <PageHeader title="标题" subtitle="副标题" />
 *   <div>页面内容</div>
 * </PageLayout>
 * ```
 */
interface PageLayoutProps {
  children: React.ReactNode;
  /** 额外的 CSS 类名，用于自定义布局行为 */
  className?: string;
}

export default function PageLayout({ children, className = "" }: PageLayoutProps) {
  return (
    <div className={`min-h-[calc(100vh-64px)] bg-[#35786f] flex items-center justify-center px-4 py-8 ${className}`}>
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
