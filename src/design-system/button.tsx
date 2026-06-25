"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";
import { focusRing, disabledStyles, transition } from "./_shared";

const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-2 rounded-md font-semibold shadow leading-none",
    transition,
    focusRing,
    disabledStyles
  ),
  {
    variants: {
      variant: {
        primary: "bg-primary-500 text-white hover:bg-primary-600 shadow-md",
        light: "bg-gray-100 text-gray-900 hover:bg-gray-200 shadow-sm",
        danger: "bg-error-500 text-white hover:bg-error-600 shadow-md",
        ghost: "bg-transparent text-gray-700 hover:bg-gray-100 shadow-none",
        outline: "border-2 border-gray-300 text-gray-700 hover:border-primary-500 hover:text-primary-600 shadow-none",
      },
      size: {
        sm: "h-8 px-2.5 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
      pill: {
        true: "rounded-full",
        false: "",
      },
      selected: {
        true: "ring-2 ring-primary-500 ring-offset-1",
        false: "",
      },
    },
    defaultVariants: {
      variant: "light",
      size: "md",
      fullWidth: false,
      pill: false,
      selected: false,
    },
  }
);

export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
export type ButtonSize = VariantProps<typeof buttonVariants>["size"];

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
  href?: string;
  openInNewTab?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconSrc?: string;
  iconAlt?: string;
  loading?: boolean;
  className?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "light",
    size = "md",
    fullWidth = false,
    pill = false,
    selected = false,
    href,
    openInNewTab = false,
    iconSrc,
    iconAlt,
    leftIcon,
    rightIcon,
    children,
    className,
    loading = false,
    disabled,
    type = "button",
    ...props
  },
  ref
) {
  const computedClass = cn(buttonVariants({ variant, size, fullWidth, pill, selected }), className);
  const iconSize = { sm: 14, md: 16, lg: 20 }[size ?? "md"];

  const renderSvgIcon = (icon: React.ReactNode, position: "left" | "right") => {
    if (!icon) return null;
    return (
      <span
        className={cn("flex shrink-0 items-center", position === "left" ? "mr-2 -ml-1" : "-mr-1 ml-2")}
        aria-hidden="true"
      >
        {icon}
      </span>
    );
  };

  const renderImageIcon = () => {
    if (!iconSrc) return null;
    return (
      <Image src={iconSrc} width={iconSize} height={iconSize} alt={iconAlt || "icon"} className="shrink-0" />
    );
  };

  const content = (
    <>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {renderImageIcon()}
      {renderSvgIcon(leftIcon, "left")}
      {children}
      {renderSvgIcon(rightIcon, "right")}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={computedClass}
        target={openInNewTab ? "_blank" : undefined}
        rel={openInNewTab ? "noopener noreferrer" : undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={computedClass}
      {...props}
    >
      {content}
    </button>
  );
});
