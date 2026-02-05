// 向后兼容的按钮组件包装器
// 这些组件将新 Button 组件包装，以保持向后兼容

import { Button } from "../Button";

// LightButton: 次要按钮，支持 selected 状态
export const LightButton = (props: any) => <Button variant="secondary" {...props} />;

// GreenButton: 主题色主要按钮
export const GreenButton = (props: any) => <Button variant="primary" {...props} />;

// IconButton: SVG 图标按钮
export const IconButton = (props: any) => {
  const { icon, ...rest } = props;
  return <Button variant="icon" leftIcon={icon} {...rest} />;
};

// GhostButton: 透明导航按钮
export const GhostButton = (props: any) => {
  const { className, children, ...rest } = props;
  return (
    <Button variant="ghost" className={className} {...rest}>
      {children}
    </Button>
  );
};

// IconClick: 图片图标按钮
export const IconClick = (props: any) => {
  // IconClick 使用 src/alt 属性，需要映射到 Button 的 iconSrc/iconAlt
  const { src, alt, size, disableOnHoverBgChange, className, ...rest } = props;
  let buttonSize: "sm" | "md" | "lg" = "md";
  if (typeof size === "number") {
    if (size <= 20) buttonSize = "sm";
    else if (size >= 32) buttonSize = "lg";
  } else if (typeof size === "string") {
    buttonSize = (size === "sm" || size === "md" || size === "lg") ? size : "md";
  }

  // 如果禁用悬停背景变化，通过 className 覆盖
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

// PlainButton: 基础小按钮
export const PlainButton = (props: any) => <Button variant="secondary" size="sm" {...props} />;

// CircleButton: 圆形导航按钮
export const CircleButton = (props: any) => {
  const { icon, className, ...rest } = props;
  return <Button variant="circle" leftIcon={icon} className={className} {...rest} />;
};

// DashedButton: 虚线边框按钮
export const DashedButton = (props: any) => <Button variant="dashed" {...props} />;

// LinkButton: 链接样式按钮
export const LinkButton = (props: any) => <Button variant="link" {...props} />;

// CircleToggleButton: 圆形切换按钮（支持 selected 状态）
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
