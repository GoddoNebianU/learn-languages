# Design System

完整的设计系统，提供可复用的 UI 组件和设计令牌，确保整个应用的一致性。

## 目录结构

```
src/design-system/
├── tokens/              # 设计令牌（颜色、间距、字体等）
├── lib/                 # 工具函数
├── base/                # 基础组件
│   ├── button/
│   ├── input/
│   ├── textarea/
│   ├── card/
│   ├── checkbox/
│   ├── radio/
│   ├── switch/
│   └── select/
├── feedback/            # 反馈组件
│   ├── alert/
│   ├── progress/
│   ├── skeleton/
│   └── toast/
├── overlay/             # 覆盖组件
│   └── modal/
├── data-display/        # 数据展示组件
│   ├── badge/
│   └── divider/
├── layout/              # 布局组件
│   ├── container/
│   ├── grid/
│   └── stack/
├── navigation/          # 导航组件
│   └── tabs/
```

## 快速开始

### 安装依赖

```bash
pnpm add class-variance-authority clsx tailwind-merge
```

### 导入组件

```tsx
// 使用显式导入以获得更好的 tree-shaking
import { Button } from '@/design-system/base/button';
import { Input } from '@/design-system/base/input';
import { Card } from '@/design-system/base/card';
```

### 使用组件

```tsx
import { Button } from '@/design-system/base/button';
import { Card } from '@/design-system/base/card';

export function MyComponent() {
  return (
    <Card>
      <h1>标题</h1>
      <p>内容</p>
      <Button variant="primary">点击我</Button>
    </Card>
  );
}
```

## 组件列表

### 基础组件

| 组件 | 说明 | 状态 |
|------|------|------|
| [Button](#button) | 按钮 | ✅ |
| [Input](#input) | 输入框 | ✅ |
| [Textarea](#textarea) | 多行文本输入 | ✅ |
| [Card](#card) | 卡片容器 | ✅ |
| [Checkbox](#checkbox) | 复选框 | ✅ |
| [Radio](#radio) | 单选按钮 | ✅ |
| [Switch](#switch) | 开关 | ✅ |
| [Select](#select) | 下拉选择框 | ✅ |

### 反馈组件

| 组件 | 说明 | 状态 |
|------|------|------|
| [Alert](#alert) | 警告提示 | ✅ |
| [Progress](#progress) | 进度条 | ✅ |
| [Skeleton](#skeleton) | 骨架屏 | ✅ |
| [Toast](#toast) | 通知提示 | ✅ |

### 覆盖组件

| 组件 | 说明 | 状态 |
|------|------|------|
| [Modal](#modal) | 模态框 | ✅ |

### 数据展示组件

| 组件 | 说明 | 状态 |
|------|------|------|
| [Badge](#badge) | 徽章 | ✅ |
| [Divider](#divider) | 分隔线 | ✅ |

### 布局组件

| 组件 | 说明 | 状态 |
|------|------|------|
| [Container](#container) | 容器 | ✅ |
| [Grid](#grid) | 网格布局 | ✅ |
| [Stack](#stack) | 堆叠布局 | ✅ |

### 导航组件

| 组件 | 说明 | 状态 |
|------|------|------|
| [Tabs](#tabs) | 标签页 | ✅ |

## 组件 API

### Button

按钮组件，支持多种变体和尺寸。

```tsx
import { Button } from '@/design-system/base/button';

<Button variant="primary" size="md" onClick={handleClick}>
  点击我
</Button>
```

**变体 (variant)**: `primary` | `secondary` | `success` | `warning` | `error` | `ghost` | `outline` | `link`

**尺寸 (size)**: `sm` | `md` | `lg`

**快捷组件**: `PrimaryButton`, `SecondaryButton`, `SuccessButton`, `WarningButton`, `ErrorButton`, `GhostButton`, `OutlineButton`, `LinkButton`

### Input

输入框组件。

```tsx
import { Input } from '@/design-system/base/input';

<Input
  variant="bordered"
  placeholder="请输入内容"
  error={hasError}
/>
```

**变体 (variant)**: `default` | `bordered` | `filled` | `search`

**尺寸 (size)**: `sm` | `md` | `lg`

### Textarea

多行文本输入组件。

```tsx
import { Textarea } from '@/design-system/base/textarea';

<Textarea
  variant="bordered"
  placeholder="请输入内容"
  rows={4}
/>
```

**变体 (variant)**: `default` | `bordered` | `filled`

### Card

卡片容器组件。

```tsx
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '@/design-system/base/card';

<Card>
  <CardHeader>
    <CardTitle>标题</CardTitle>
  </CardHeader>
  <CardBody>
    <p>内容</p>
  </CardBody>
  <CardFooter>
    <Button>确定</Button>
  </CardFooter>
</Card>
```

**变体 (variant)**: `default` | `bordered` | `elevated` | `flat`

**内边距 (padding)**: `none` | `xs` | `sm` | `md` | `lg` | `xl`

### Checkbox

复选框组件。

```tsx
import { Checkbox } from '@/design-system/base/checkbox';

<Checkbox checked={checked} onChange={setChecked}>
  同意条款
</Checkbox>
```

### Radio

单选按钮组件。

```tsx
import { Radio, RadioGroup } from '@/design-system/base/radio';

<RadioGroup name="choice" value={value} onChange={setValue}>
  <Radio value="1">选项 1</Radio>
  <Radio value="2">选项 2</Radio>
</RadioGroup>
```

### Switch

开关组件。

```tsx
import { Switch } from '@/design-system/base/switch';

<Switch checked={enabled} onChange={setEnabled} />
```

### Alert

警告提示组件。

```tsx
import { Alert } from '@/design-system/feedback/alert';

<Alert variant="success" title="成功">
  操作成功完成
</Alert>
```

**变体 (variant)**: `info` | `success` | `warning` | `error`

### Progress

进度条组件。

```tsx
import { Progress } from '@/design-system/feedback/progress';

<Progress value={60} showLabel />
```

### Skeleton

骨架屏组件。

```tsx
import { Skeleton, TextSkeleton, CardSkeleton } from '@/design-system/feedback/skeleton';

<Skeleton className="h-4 w-32" />
<TextSkeleton lines={3} />
<CardSkeleton />
```

### Toast

通知提示组件（基于 sonner）。

```tsx
import { toast } from '@/design-system/feedback/toast';

toast.success("操作成功！");
toast.error("发生错误");
toast.promise(promise, {
  loading: "加载中...",
  success: "加载成功",
  error: "加载失败",
});
```

### Modal

模态框组件。

```tsx
import { Modal } from '@/design-system/overlay/modal';

<Modal open={open} onClose={() => setOpen(false)}>
  <Modal.Header>
    <Modal.Title>标题</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <p>内容</p>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setOpen(false)}>
      取消
    </Button>
    <Button variant="primary">确定</Button>
  </Modal.Footer>
</Modal>
```

### Badge

徽章组件。

```tsx
import { Badge } from '@/design-system/data-display/badge';

<Badge variant="success">成功</Badge>
<Badge dot />
```

**变体 (variant)**: `default` | `primary` | `success` | `warning` | `error` | `info`

### Divider

分隔线组件。

```tsx
import { Divider } from '@/design-system/data-display/divider';

<Divider />
<Divider>或者</Divider>
<Divider orientation="vertical" />
```

### Container

容器组件。

```tsx
import { Container } from '@/design-system/layout/container';

<Container size="lg" padding="xl">
  <p>内容</p>
</Container>
```

### Grid

网格布局组件。

```tsx
import { Grid } from '@/design-system/layout/grid';

<Grid cols={3} gap={4}>
  <div>项目 1</div>
  <div>项目 2</div>
  <div>项目 3</div>
</Grid>
```

### Stack

堆叠布局组件。

```tsx
import { Stack, VStack, HStack } from '@/design-system/layout/stack';

<VStack gap={4}>
  <div>项目 1</div>
  <div>项目 2</div>
</VStack>
```

### Tabs

标签页组件。

```tsx
import { Tabs } from '@/design-system/navigation/tabs';

<Tabs value={activeTab} onValueChange={setActiveTab}>
  <Tabs.List>
    <Tabs.Trigger value="tab1">标签 1</Tabs.Trigger>
    <Tabs.Trigger value="tab2">标签 2</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="tab1">
    <p>内容 1</p>
  </Tabs.Content>
  <Tabs.Content value="tab2">
    <p>内容 2</p>
  </Tabs.Content>
</Tabs>
```

## 设计令牌

### 颜色

```tsx
import { colors } from '@/design-system/tokens';

// 主色
colors.primary.500  // #35786f

// 语义色
colors.success.500  // #22c55e
colors.warning.500  // #f59e0b
colors.error.500    // #ef4444
colors.info.500     // #3b82f6
```

在组件中使用：

```tsx
<div className="bg-primary-500 text-white">主色背景</div>
<div className="text-success-600">成功文本</div>
```

### 间距

基于 8pt 网格系统：

```tsx
<div className="p-4">  // 16px
<div className="p-6">  // 24px
<div className="p-8">  // 32px
```

### 字体

```tsx
<div className="text-sm">小文本</div>
<div className="text-base">正常文本</div>
<div className="text-lg">大文本</div>
<div className="font-semibold">半粗体</div>
<div className="font-bold">粗体</div>
```

### 圆角

```tsx
<div className="rounded-lg">  // 8px
<div className="rounded-xl">  // 12px
<div className="rounded-2xl"> // 16px
```

### 阴影

```tsx
<div className="shadow-sm">  // 小阴影
<div className="shadow-md">  // 中阴影
<div className="shadow-lg">  // 大阴影
<div className="shadow-xl">  // 超大阴影
```

## 工具函数

### cn

合并 Tailwind CSS 类名的工具函数。

```tsx
import { cn } from '@/design-system/lib/utils';

const className = cn(
  'base-class',
  isActive && 'active-class',
  'another-class'
);
```

## 最佳实践

### 1. 组件导入

对于更好的 tree-shaking，建议从子路径导入：

```tsx
// ✅ 使用显式导入
import { Button } from '@/design-system/base/button';
import { Input } from '@/design-system/base/input';
import { Card } from '@/design-system/base/card';
```

### 2. 样式覆盖

使用 `className` 属性覆盖样式：

```tsx
<Button className="w-full">全宽按钮</Button>
```

### 3. 组合组件

利用组件组合来构建复杂 UI：

```tsx
<Card>
  <CardHeader>
    <CardTitle>标题</CardTitle>
  </CardHeader>
  <CardBody>
    <VStack gap={4}>
      <Input placeholder="输入框" />
      <Button>提交</Button>
    </VStack>
  </CardBody>
</Card>
```

### 4. 可访问性

所有组件都内置了可访问性支持：

- 正确的 ARIA 属性
- 键盘导航支持
- 焦点管理
- 屏幕阅读器友好

## 迁移指南

### 从旧组件迁移

旧的组件路径：

```tsx
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
```

新的组件路径：

```tsx
import { Button } from '@/design-system/base/button';
import { Input } from '@/design-system/base/input';
```

### API 变化

大部分 API 保持兼容，但有以下变化：

1. **颜色不再使用硬编码值**
   ```tsx
   // 旧
   style={{ backgroundColor: '#35786f' }}

   // 新
   className="bg-primary-500"
   ```

2. **变体命名更加一致**
   ```tsx
   // 旧
   <Button variant="icon" />

   // 新
   <Button variant="ghost" />
   ```

3. **新增语义色变体**
   ```tsx
   <Button variant="success">成功</Button>
   <Button variant="warning">警告</Button>
   <Button variant="error">错误</Button>
   ```

## 贡献

添加新组件时，请遵循以下规范：

1. 在对应的目录下创建组件
2. 使用 `cva` 定义变体样式
3. 使用 `forwardRef` 支持 ref 转发
4. 添加完整的 TypeScript 类型
5. 编写详细的 JSDoc 注释和示例
6. 在导出文件中添加导出

## 许可证

AGPL-3.0-only
