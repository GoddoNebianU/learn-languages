// 统一的按钮组件导出
// 基于 Button 组件的便捷包装器，提供语义化的按钮类型

import { Button } from "../Button";

// ========== 基础按钮 ==========

// PrimaryButton: 主要操作按钮（主题色）
export const PrimaryButton = (props: any) => <Button variant="primary" {...props} />;

// SecondaryButton: 次要按钮，支持 selected 状态
export const SecondaryButton = (props: any) => <Button variant="secondary" {...props} />;

// LightButton: 次要按钮的别名（向后兼容）
export const LightButton = SecondaryButton;

// ========== 图标按钮 ==========

// IconButton: SVG 图标按钮（方形背景）
export const IconButton = (props: any) => {
  const { icon, ...rest } = props;
  return <Button variant="icon" leftIcon={icon} {...rest} />;
};

// IconClick: 图片图标按钮（支持 Next.js Image）
export const IconClick = (props: any) => {
  const { src, alt, size, disableOnHoverBgChange, className, ...rest } = props;
  let buttonSize: "sm" | "md" | "lg" = "md";
  if (typeof size === "number") {
    if (size <= 20) buttonSize = "sm";
    else if (size >= 32) buttonSize = "lg";
  } else if (typeof size === "string") {
    buttonSize = (size === "sm" || size === "md" || size === "lg") ? size : "md";
  }

  const hoverClass = disableOnHoverBgChange ? "hover:bg-black/30 hover:cursor-pointer border-0 bg-transparent shadow-none" : "";

  return (
    <Button
      variant="icon"
      iconSrc={src}
      iconAlt={alt}
      size={buttonSize}
      className={`${hoverClass} ${className || ""}`}
      {...rest}
    />
  );
};

// CircleButton: 圆形图标按钮
export const CircleButton = (props: any) => {
  const { icon, className, ...rest } = props;
  return <Button variant="circle" leftIcon={icon} className={className} {...rest} />;
};

// CircleToggleButton: 带选中状态的圆形切换按钮
export const CircleToggleButton = (props: any) => {
  const { selected, className, children, ...rest } = props;
  const selectedClass = selected
    ? "bg-[#35786f] text-white"
    : "bg-gray-200 text-gray-600 hover:bg-gray-300";
  return (
    <Button
      variant="circle"
      className={`rounded-full px-3 py-1 text-sm transition-colors ${selectedClass} ${className || ""}`}
      {...rest}
    >
      {children}
    </Button>
  );
};

// ========== 特殊样式按钮 ==========

// GhostButton: 透明导航按钮
export const GhostButton = (props: any) => {
  const { className, children, ...rest } = props;
  return (
    <Button variant="ghost" className={className} {...rest}>
      {children}
    </Button>
  );
};

// LinkButton: 链接样式按钮
export const LinkButton = (props: any) => <Button variant="link" {...props} />;

// DashedButton: 虚线边框按钮
export const DashedButton = (props: any) => <Button variant="dashed" {...props} />;
