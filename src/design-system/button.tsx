"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold shadow leading-none transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary-500 text-white hover:bg-primary-600 shadow-md",
        light: "bg-gray-100 text-gray-900 hover:bg-gray-200 shadow-sm",
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
    },
    defaultVariants: {
      variant: "light",
      size: "md",
      fullWidth: false,
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
  selected?: boolean;
  className?: string;
}

export function Button({
  variant = "light",
  size = "md",
  fullWidth = false,
  href,
  openInNewTab = false,
  iconSrc,
  iconAlt,
  leftIcon,
  rightIcon,
  children,
  className,
  loading = false,
  selected = false,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  const actualSize = size ?? "md";

  const computedClass = cn(
    buttonVariants({ variant, size: actualSize, fullWidth }),
    selected && "bg-gray-200",
    className
  );

  const iconSize = { sm: 14, md: 16, lg: 20 }[actualSize];

  const renderSvgIcon = (icon: React.ReactNode, position: "left" | "right") => {
    if (!icon) return null;
    return (
      <span
        className={`flex shrink-0 items-center ${position === "left" ? "mr-2 -ml-1" : "-mr-1 ml-2"}`}
        aria-hidden="true"
      >
        {icon}
      </span>
    );
  };

  const renderImageIcon = () => {
    if (!iconSrc) return null;
    return (
      <Image
        src={iconSrc}
        width={iconSize}
        height={iconSize}
        alt={iconAlt || "icon"}
        className="shrink-0"
      />
    );
  };

  const renderLoadingIcon = () => {
    if (!loading) return null;
    return (
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
    );
  };

  const content = (
    <>
      {loading && renderLoadingIcon()}
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
    <button type={type} disabled={disabled || loading} className={computedClass} {...props}>
      {content}
    </button>
  );
}
