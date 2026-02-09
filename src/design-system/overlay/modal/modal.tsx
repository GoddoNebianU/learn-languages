"use client";

import React, { useEffect } from "react";
import { cn } from "@/design-system/lib/utils";

/**
 * Modal 模态框组件
 *
 * 全屏遮罩的模态对话框组件。
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [open, setOpen] = useState(false);
 *
 *   return (
 *     <>
 *       <Button onClick={() => setOpen(true)}>打开模态框</Button>
 *       <Modal open={open} onClose={() => setOpen(false)}>
 *         <Modal.Header>
 *           <Modal.Title>标题</Modal.Title>
 *         </Modal.Header>
 *         <Modal.Body>
 *           <p>模态框内容</p>
 *         </Modal.Body>
 *         <Modal.Footer>
 *           <Button variant="secondary" onClick={() => setOpen(false)}>
 *             取消
 *           </Button>
 *           <Button variant="primary">确定</Button>
 *         </Modal.Footer>
 *       </Modal>
 *     </>
 *   );
 * }
 * ```
 */

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

/**
 * Modal 组件
 */
export function Modal({
  open,
  onClose,
  children,
  size = "md",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
}: ModalProps) {
  // ESC 键关闭
  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, closeOnEscape, onClose]);

  // 禁止背景滚动
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* 模态框内容 */}
      <div
        className={cn(
          "relative z-10 w-full bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-hidden flex flex-col",
          sizeClasses[size],
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Modal.Header - 模态框头部
 */
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

/**
 * Modal.Title - 模态框标题
 */
export interface ModalTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

Modal.Title = function ModalTitle({
  children,
  className,
  ...props
}: ModalTitleProps) {
  return (
    <h2 className={cn("text-xl font-semibold text-gray-900", className)} {...props}>
      {children}
    </h2>
  );
};

/**
 * Modal.Body - 模态框主体
 */
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

/**
 * Modal.Footer - 模态框底部
 */
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

/**
 * Modal.CloseButton - 关闭按钮
 */
export interface ModalCloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

Modal.CloseButton = function ModalCloseButton({
  className,
  onClick,
  ...props
}: ModalCloseButtonProps) {
  return (
    <button
      type="button"
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
