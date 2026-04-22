"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/utils/cn";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-md p-2 text-gray-700 transition-colors hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        className
      )}
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
