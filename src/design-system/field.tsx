"use client";

import React, { useId } from "react";
import { cn } from "@/utils/cn";

/**
 * Field — 表单字段包装器。
 *
 * 自动关联 label ↔ input (htmlFor / id), 接管 aria-invalid / aria-describedby,
 * 渲染 required 指示符、错误文案、辅助文案。消除消费端手写 `<label>` 的 a11y 隐患。
 *
 * @example
 * ```tsx
 * <Field label="邮箱" required errorText="格式不正确">
 *   <Input type="email" />
 * </Field>
 * ```
 */
interface FieldProps {
  label?: string;
  errorText?: string;
  helperText?: string;
  required?: boolean;
  children: React.ReactElement<{ id?: string } & React.AriaAttributes>;
  className?: string;
}

export function Field({ label, errorText, helperText, required, children, className }: FieldProps) {
  const autoId = useId();
  const id = children.props.id ?? autoId;
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  const describedBy = errorText ? errorId : helperText ? helpId : undefined;

  const child = React.cloneElement(children, {
    id,
    "aria-invalid": errorText ? "true" : undefined,
    "aria-describedby": describedBy,
  });

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-0.5 text-error-500">*</span>}
        </label>
      )}
      {child}
      {errorText && (
        <p id={errorId} className="mt-1 text-sm text-error-500">{errorText}</p>
      )}
      {!errorText && helperText && (
        <p id={helpId} className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
