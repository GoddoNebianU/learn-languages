import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-md font-medium",
  {
    variants: {
      variant: {
        neutral: "bg-gray-100 text-gray-700",
        info: "bg-info-50 text-info-600",
        success: "bg-success-50 text-success-600",
        warning: "bg-warning-50 text-warning-600",
        error: "bg-error-50 text-error-600",
      },
      size: {
        sm: "px-1.5 py-0.5 text-xs",
        md: "px-2 py-1 text-xs",
        lg: "px-2.5 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "md",
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  children?: React.ReactNode;
}

export function Badge({ variant, size, className, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {children}
    </span>
  );
}
