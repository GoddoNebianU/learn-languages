"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "@/utils/cn";

const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface ModalContextValue {
  titleId: string;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-full mx-4",
};

export function Modal({
  open,
  onClose,
  children,
  size = "md",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
}: ModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const prevOpenRef = useRef(open);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const getFocusableElements = useCallback(() => {
    if (!dialogRef.current) return [];
    return Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    ).filter((el) => !el.hasAttribute("disabled") && el.tabIndex >= 0);
  }, []);

  const handleTrapFocus = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [getFocusableElements]
  );

  useEffect(() => {
    if (open) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement;
    }
  }, [open]);

  useEffect(() => {
    if (open && dialogRef.current) {
      const focusable = getFocusableElements();
      requestAnimationFrame(() => {
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          dialogRef.current?.focus();
        }
      });
    }

    if (!open && previouslyFocusedRef.current) {
      previouslyFocusedRef.current.focus();
      previouslyFocusedRef.current = null;
    }
  }, [open, getFocusableElements]);

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleTrapFocus);
    return () => document.removeEventListener("keydown", handleTrapFocus);
  }, [open, handleTrapFocus]);

  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, closeOnEscape, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  useEffect(() => {
    if (prevOpenRef.current && !open) {
      const closeRaf = requestAnimationFrame(() => {
        setIsClosing(true);
        animationTimeoutRef.current = setTimeout(() => {
          setIsClosing(false);
        }, 200);
      });
      return () => {
        cancelAnimationFrame(closeRaf);
        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current);
        }
      };
    }
    prevOpenRef.current = open;
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [open]);

  const isVisible = open || isClosing;
  const shouldRender = open || isClosing;

  if (!shouldRender) return null;

  return (
    <ModalContext.Provider value={{ titleId }}>
      <div
        className={cn(
          "fixed inset-0 z-modal flex items-center justify-center p-4",
          "transition-opacity duration-200 ease-out",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/50 backdrop-blur-sm",
            "transition-opacity duration-200",
            isVisible ? "opacity-100" : "opacity-0"
          )}
          onClick={closeOnOverlayClick ? onClose : undefined}
        />

        <div
          ref={dialogRef}
          tabIndex={-1}
          className={cn(
            "relative z-10 w-full bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-hidden flex flex-col",
            "transition-all duration-200 ease-out",
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
            sizeClasses[size],
            className
          )}
        >
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  );
}

export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

Modal.Header = function ModalHeader({
  children,
  className,
  ...props
}: ModalHeaderProps) {
  return (
    <div
      className={cn("flex items-center justify-between p-6 border-b border-gray-200", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export interface ModalTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

Modal.Title = function ModalTitle({
  children,
  className,
  ...props
}: ModalTitleProps) {
  const ctx = useContext(ModalContext);
  return (
    <h2
      id={ctx?.titleId}
      className={cn("text-xl font-semibold text-gray-900", className)}
      {...props}
    >
      {children}
    </h2>
  );
};

export interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

Modal.Body = function ModalBody({
  children,
  className,
  ...props
}: ModalBodyProps) {
  return (
    <div className={cn("p-6 overflow-y-auto flex-1", className)} {...props}>
      {children}
    </div>
  );
};

export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
}

Modal.Footer = function ModalFooter({
  children,
  align = "right",
  className,
  ...props
}: ModalFooterProps) {
  const alignClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-6 border-t border-gray-200",
        alignClasses[align],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface ModalCloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

Modal.CloseButton = function ModalCloseButton({
  className,
  onClick,
  ...props
}: ModalCloseButtonProps) {
  return (
    <button
      type="button"
      aria-label="Close"
      className={cn(
        "rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors",
        className
      )}
      onClick={onClick}
      {...props}
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
};
