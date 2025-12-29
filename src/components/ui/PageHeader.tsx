/**
 * PageHeader - 页面标题组件
 *
 * 用于 PageLayout 内的页面标题，支持主标题和可选的副标题
 *
 * @example
 * ```tsx
 * <PageHeader title="我的文件夹" subtitle="管理和组织你的学习内容" />
 * ```
 */
interface PageHeaderProps {
  /** 页面主标题 */
  title: string;
  /** 可选的副标题/描述 */
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-gray-500">{subtitle}</p>
      )}
    </div>
  );
}
