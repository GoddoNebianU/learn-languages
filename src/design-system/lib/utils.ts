import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并 Tailwind CSS 类名的工具函数
 *
 * @example
 * ```tsx
 * import { cn } from '@/design-system/lib/utils';
 *
 * const className = cn(
 *   'base-class',
 *   isActive && 'active-class',
 *   'another-class'
 * );
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
