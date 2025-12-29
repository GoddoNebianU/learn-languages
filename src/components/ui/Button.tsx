"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { COLORS } from "@/lib/theme/colors";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "icon";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  // Content
  children?: React.ReactNode;

  // Behavior
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";

  // Styling
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  selected?: boolean;
  style?: React.CSSProperties;

  // Icons
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconSrc?: string; // For Next.js Image icons
  iconAlt?: string;

  // Navigation
  href?: string;
}

export default function Button({
  variant = "secondary",
  size = "md",
  selected = false,
  href,
  iconSrc,
  iconAlt,
  leftIcon,
  rightIcon,
  children,
  className = "",
  style,
  type = "button",
  disabled = false,
  ...props
}: ButtonProps) {
  // Base classes
  const baseClasses = "inline-flex items-center justify-center gap-2 rounded font-bold shadow hover:cursor-pointer transition-colors";

  // Variant-specific classes
  const variantStyles: Record<ButtonVariant, string> = {
    primary: `
      text-white
      hover:opacity-90
    `,
    secondary: `
      text-black
      hover:bg-gray-100
    `,
    ghost: `
      hover:bg-black/30
      p-2
    `,
    icon: `
      p-2 bg-gray-200 rounded-full
      hover:bg-gray-300
    `
  };

  // Size-specific classes
  const sizeStyles: Record<ButtonSize, string> = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };

  const variantClass = variantStyles[variant];
  const sizeClass = sizeStyles[size];

  // Selected state for secondary variant
  const selectedClass = variant === "secondary" && selected ? "bg-gray-100" : "";

  // Background color for primary variant
  const backgroundColor = variant === "primary" ? COLORS.primary : undefined;

  // Combine all classes
  const combinedClasses = `
    ${baseClasses}
    ${variantClass}
    ${sizeClass}
    ${selectedClass}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `.trim().replace(/\s+/g, " ");

  // Icon rendering helper for SVG icons
  const renderSvgIcon = (icon: React.ReactNode, position: "left" | "right") => {
    if (!icon) return null;
    return (
      <span className={`flex items-center ${position === "left" ? "-ml-1 mr-2" : "-mr-1 ml-2"}`}>
        {icon}
      </span>
    );
  };

  // Image icon rendering for Next.js Image
  const renderImageIcon = () => {
    if (!iconSrc) return null;
    const sizeMap = { sm: 16, md: 20, lg: 24 };
    const imgSize = sizeMap[size] || 20;

    return (
      <Image
        src={iconSrc}
        width={imgSize}
        height={imgSize}
        alt={iconAlt || "icon"}
      />
    );
  };

  // Content assembly
  const content = (
    <>
      {renderImageIcon()}
      {renderSvgIcon(leftIcon, "left")}
      {children}
      {renderSvgIcon(rightIcon, "right")}
    </>
  );

  // If href is provided, render as Link
  if (href) {
    return (
      <Link
        href={href}
        className={combinedClasses}
        style={{ ...style, backgroundColor }}
      >
        {content}
      </Link>
    );
  }

  // Otherwise render as button
  return (
    <button
      type={type}
      disabled={disabled}
      className={combinedClasses}
      style={{ ...style, backgroundColor }}
      {...props}
    >
      {content}
    </button>
  );
}
