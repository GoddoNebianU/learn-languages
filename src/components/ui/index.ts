// 统一的 UI 组件导出
// 可以从 '@/components/ui' 导入所有组件

// 表单组件
export { Input } from './Input';
export { Select, Option } from './Select';
export { Textarea } from './Textarea';
export { RangeInput } from './RangeInput';
export type { InputVariant } from './Input';
export type { SelectSize } from './Select';
export type { TextareaVariant } from './Textarea';

// 按钮组件
export { Button } from './Button';
export {
  PrimaryButton,
  SecondaryButton,
  LightButton,
  IconButton,
  IconClick,
  CircleButton,
  CircleToggleButton,
  GhostButton,
  LinkButton,
  DashedButton,
} from './buttons';
export type { ButtonVariant, ButtonSize, ButtonProps } from './Button';

// 布局组件
export { Container } from './Container';
export { PageLayout } from './PageLayout';
export { PageHeader } from './PageHeader';
export { CardList } from './CardList';
export { Card } from './Card';
export type { CardProps, CardVariant, CardPadding } from './Card';

// 复合组件
export { LocaleSelector } from './LocaleSelector';
