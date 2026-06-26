import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const alertVariants = cva(
  "rounded-lg border p-4 flex items-start gap-3",
  {
    variants: {
      variant: {
        info: "border-info-300 bg-info-50 text-info-700",
        success: "border-success-300 bg-success-50 text-success-700",
        warning: "border-warning-300 bg-warning-50 text-warning-700",
        error: "border-error-300 bg-error-50 text-error-700",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  children: React.ReactNode;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { variant, className, children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {children}
    </div>
  );
});
