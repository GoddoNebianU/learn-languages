import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并 Tailwind CSS 类名的工具函数
 *
 * 使用 clsx 处理条件类名，然后使用 tailwind-merge 解决 Tailwind 类名冲突
 *
 * @param inputs - 类名（字符串、对象、数组等）
 * @returns 合并后的类名字符串
 *
 * @example
 * ```tsx
 * cn('px-4 py-2', isActive && 'bg-primary-500', 'text-white')
 * // => 'px-4 py-2 bg-primary-500 text-white'
 *
 * cn('px-4 px-6')  // 自动解决冲突
 * // => 'px-6'
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
