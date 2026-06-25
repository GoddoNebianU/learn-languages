"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { focusRing, disabledStyles } from "./_shared";

interface LinkButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  href?: string;
  openInNewTab?: boolean;
  className?: string;
}

export const LinkButton = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, LinkButtonProps>(
  function LinkButton(
    { children, href, openInNewTab = false, className, ...props },
    ref
  ) {
    const classes = cn(
      "inline-flex items-center text-primary-500 hover:text-primary-600 hover:underline font-medium transition-colors",
      focusRing,
      disabledStyles,
      className
    );

    if (href) {
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
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
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={classes}
        {...props}
      >
        {children}
      </button>
    );
  }
);
