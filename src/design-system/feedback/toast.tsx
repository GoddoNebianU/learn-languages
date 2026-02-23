"use client";

/**
 * Toast 组件
 *
 * 基于项目已安装的 sonner 库封装的 Toast 通知组件。
 * 提供类型安全的 API 和预设样式。
 *
 * @example
 * ```tsx
 * import { toast } from '@/design-system/feedback/toast';
 * ```
 * // 基础用法
 * toast.success("操作成功！");
 * toast.error("发生错误");
 * toast.warning("请注意");
 * toast.info("提示信息");
 *
 * // 自定义选项
 * toast.success("操作成功！", {
 *   description: "您的更改已保存",
 *   duration: 5000,
 * });
 *
 * // Promise Toast
 * toast.promise(
 *   fetchData(),
 *   {
 *     loading: "加载中...",
 *     success: "加载成功",
 *     error: "加载失败",
 *   }
 * );
 * ```
 */

import { toast as sonnerToast } from "sonner";

export type ToastProps = {
  description?: string;
  duration?: number;
  id?: string;
  onDismiss?: () => void;
};

/**
 * Toast 通知组件
 */
export const toast = {
  success: (message: string, props?: ToastProps) => {
    return sonnerToast.success(message, {
      description: props?.description,
      duration: props?.duration,
      id: props?.id,
      onDismiss: props?.onDismiss,
    });
  },

  error: (message: string, props?: ToastProps) => {
    return sonnerToast.error(message, {
      description: props?.description,
      duration: props?.duration,
      id: props?.id,
      onDismiss: props?.onDismiss,
    });
  },

  warning: (message: string, props?: ToastProps) => {
    return sonnerToast.warning(message, {
      description: props?.description,
      duration: props?.duration,
      id: props?.id,
      onDismiss: props?.onDismiss,
    });
  },

  info: (message: string, props?: ToastProps) => {
    return sonnerToast.info(message, {
      description: props?.description,
      duration: props?.duration,
      id: props?.id,
      onDismiss: props?.onDismiss,
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    });
  },

  dismiss: (id?: string) => {
    sonnerToast.dismiss(id);
  },
};
