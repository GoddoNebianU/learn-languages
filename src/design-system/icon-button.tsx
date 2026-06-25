"use client";

import React from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";
import { focusRing } from "./_shared";

const iconButtonVariants = cva(
  cn(
    "inline-flex items-center justify-center p-2 transition-colors",
    focusRing,
    "disabled:cursor-not-allowed disabled:opacity-50"
  ),
  {
    variants: {
      shape: {
        default: "rounded-md",
        round: "rounded-full",
      },
      tone: {
        default: "text-gray-700 hover:bg-gray-100",
        muted: "text-gray-400 hover:bg-gray-100 hover:text-primary-600",
        danger: "text-gray-400 hover:bg-error-50 hover:text-error-500",
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
  loading?: boolean;
  className?: string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    icon,
    iconSrc,
    iconAlt,
    size = 20,
    loading = false,
    shape,
    tone,
    className,
    children,
    disabled,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(iconButtonVariants({ shape, tone }), className)}
      {...props}
    >
      {loading ? (
        <Loader2 style={{ width: size, height: size }} className="animate-spin shrink-0" aria-hidden="true" />
      ) : (
        <>
          {iconSrc && (
            <Image src={iconSrc} width={size} height={size} alt={iconAlt || "icon"} className="shrink-0" />
          )}
          {icon ?? children}
        </>
      )}
    </button>
  );
});
