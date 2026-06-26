import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

interface SpinnerProps {
  size?: number;
  className?: string;
}

export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = 20, className },
  ref
) {
  return (
    <span ref={ref} className={cn("inline-flex", className)} role="status" aria-label="Loading">
      <Loader2 style={{ width: size, height: size }} className="animate-spin" aria-hidden="true" />
    </span>
  );
});
