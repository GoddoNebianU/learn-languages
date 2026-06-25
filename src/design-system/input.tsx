"use client";

import React, { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";
import { focusRing, disabledStyles, transition } from "./_shared";

const inputVariants = cva(
  cn("flex w-full rounded-md border px-3 py-2 text-base placeholder:text-gray-400 resize-none", transition, focusRing, disabledStyles),
  {
    variants: {
      variant: {
        default: "border-b-2 border-gray-300 bg-transparent rounded-t-md",
        bordered: "border-gray-300 bg-white",
        filled: "border-transparent bg-gray-100",
        search: "border-gray-200 bg-white pl-10 rounded-full",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-5 text-lg",
      },
      error: {
        true: "border-error-500 focus-visible:ring-error-500",
        false: "",
      },
    },
    compoundVariants: [
      { variant: "filled", error: true, className: "bg-error-50" },
    ],
    defaultVariants: {
      variant: "default",
      size: "md",
      error: false,
    },
  }
);

export type InputVariant = VariantProps<typeof inputVariants>["variant"];
export type InputSize = VariantProps<typeof inputVariants>["size"];

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variant = "default", size = "md", error = false, className, containerClassName, leftIcon, rightIcon, type = "text", ...props }, ref) => {
    const inputEl = (
      <input
        ref={ref}
        type={type}
        className={cn(inputVariants({ variant, size, error }), leftIcon && "pl-10", className)}
        aria-invalid={error ? "true" : undefined}
        {...props}
      />
    );

    if (!leftIcon && !rightIcon) {
      return containerClassName ? <div className={cn("relative", containerClassName)}>{inputEl}</div> : inputEl;
    }

    return (
      <div className={cn("relative", containerClassName)}>
        {leftIcon && (
          <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" aria-hidden="true">
            {leftIcon}
          </div>
        )}
        {inputEl}
        {rightIcon && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400" aria-hidden="true">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
