"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/utils/cn";

interface LinkButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  href?: string;
  openInNewTab?: boolean;
  className?: string;
}

export function LinkButton({
  children,
  href,
  openInNewTab = false,
  className,
  ...props
}: LinkButtonProps) {
  const classes = cn(
    "inline-flex items-center text-primary-500 hover:text-primary-600 hover:underline font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    className
  );

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        target={openInNewTab ? "_blank" : undefined}
        rel={openInNewTab ? "noopener noreferrer" : undefined}
      >
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
