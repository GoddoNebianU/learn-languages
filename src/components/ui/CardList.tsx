/**
 * CardList - 可滚动的卡片列表容器
 *
 * 用于显示可滚动的列表内容，如文件夹列表、文本对列表等
 * - 最大高度 96 (24rem)
 * - 垂直滚动
 * - 圆角边框
 *
 * @example
 * ```tsx
 * <CardList>
 *   {items.map(item => (
 *     <div key={item.id}>{item.name}</div>
 *   ))}
 * </CardList>
 * ```
 */
interface CardListProps {
  children: React.ReactNode;
  /** 额外的 CSS 类名 */
  className?: string;
}

export default function CardList({ children, className = "" }: CardListProps) {
  return (
    <div className={`max-h-96 overflow-y-auto rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
