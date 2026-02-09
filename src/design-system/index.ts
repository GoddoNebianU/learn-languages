/**
 * Design System 统一导出
 *
 * 这是 Design System 的主入口，所有组件和工具都可以从这里导入。
 *
 * @example
 * ```tsx
 * // 从主入口导入
 * import { Button, Input, Card } from '@/design-system';
 *
 * // 或者从子路径导入（更好的 tree-shaking）
 * import { Button } from '@/design-system/base/button';
 * import { Input } from '@/design-system/base/input';
 * ```
 */

// 设计令牌
export * from './tokens';

// 工具函数
export * from './lib/utils';

// 基础组件
export * from './base/button';
export * from './base/input';
export * from './base/textarea';
export * from './base/card';
export * from './base/checkbox';
export * from './base/radio';
export * from './base/switch';
export * from './base/select';

// 反馈组件
export * from './feedback/alert';
export * from './feedback/progress';
export * from './feedback/skeleton';
export * from './feedback/toast';

// 覆盖组件
export * from './overlay/modal';

// 数据展示组件
export * from './data-display/badge';
export * from './data-display/divider';

// 布局组件
export * from './layout/container';
export * from './layout/grid';
export * from './layout/stack';

// 导航组件
export * from './navigation/tabs';
