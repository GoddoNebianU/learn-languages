"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";
import { focusRing, transition } from "./_shared";

const cardVariants = cva(
  cn("rounded-lg bg-white", transition),
  {
    variants: {
      variant: {
        default: "shadow-xl",
        bordered: "border-2 border-gray-200 shadow-sm",
        elevated: "shadow-2xl",
        flat: "border border-gray-200 shadow-none",
      },
      padding: {
        none: "",
        xs: "p-3",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
      clickable: {
        true: cn(
          "cursor-pointer hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0",
          focusRing
        ),
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
      clickable: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  children: React.ReactNode;
  disabled?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = "default", padding = "md", clickable = false, className, children, onClick, onKeyDown, disabled, ...props },
  ref
) {
  const isClickable = clickable || !!onClick;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isClickable && !disabled && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick?.(new MouseEvent("click", { bubbles: true }) as unknown as React.MouseEvent<HTMLDivElement>);
    }
    onKeyDown?.(e);
  };

  return (
    <div
      ref={ref}
      className={cn(
        cardVariants({ variant, padding, clickable: isClickable }),
        disabled && "pointer-events-none opacity-50",
        className
      )}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable && !disabled ? 0 : undefined}
      aria-disabled={isClickable && disabled ? true : undefined}
      onClick={onClick}
      onKeyDown={isClickable ? handleKeyDown : onKeyDown}
      {...props}
    >
      {children}
    </div>
  );
});

export function CardBody({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) {
  return (
    <div className={cn("p-4", className)} {...props}>
      {children}
    </div>
  );
}
