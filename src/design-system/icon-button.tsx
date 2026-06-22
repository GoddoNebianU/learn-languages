"use client";

import React from "react";
import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const iconButtonVariants = cva(
  "inline-flex items-center justify-center p-2 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40",
  {
    variants: {
      shape: {
        default: "rounded-md",
        round: "rounded-full",
      },
      tone: {
        default: "text-gray-700 hover:bg-gray-100",
        muted: "text-gray-400 hover:bg-gray-100 hover:text-primary-600",
      },
    },
    defaultVariants: {
      shape: "default",
      tone: "default",
    },
  }
);

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  icon?: React.ReactNode;
  iconSrc?: string;
  iconAlt?: string;
  size?: number;
  className?: string;
}

export function IconButton({
  icon,
  iconSrc,
  iconAlt,
  size = 20,
  shape,
  tone,
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={cn(iconButtonVariants({ shape, tone }), className)}
      {...props}
    >
      {iconSrc && (
        <Image
          src={iconSrc}
          width={size}
          height={size}
          alt={iconAlt || "icon"}
          className="shrink-0"
        />
      )}
      {icon ?? children}
    </button>
  );
}
