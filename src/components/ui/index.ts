// 统一的 UI 组件导出
// 可以从 '@/components/ui' 导入所有组件

// Design System 组件（向后兼容）
export { Input, type InputVariant, type InputProps } from '@/design-system/base/input/input';
export { Select, type SelectVariant, type SelectSize, type SelectProps } from '@/design-system/base/select/select';
export { Textarea, type TextareaVariant, type TextareaProps } from '@/design-system/base/textarea/textarea';
export { Card, type CardVariant, type CardPadding, type CardProps } from '@/design-system/base/card/card';
export {
  Button,
  PrimaryButton,
  LightButton,
  GhostLightButton,
  LinkButton,
  IconClick,
  CircleButton,
  CircleToggleButton,
  type ButtonVariant,
  type ButtonSize,
  type ButtonProps
} from '@/design-system/base/button/button';

// 业务特定组件
export { RangeInput } from './RangeInput';
export { Container } from './Container';
export { PageLayout } from './PageLayout';
export { PageHeader } from './PageHeader';
export { CardList } from './CardList';
export { LocaleSelector } from './LocaleSelector';
