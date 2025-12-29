/**
 * 统一的日志工具
 * 在生产环境中可以通过环境变量控制日志级别
 */

type LogLevel = 'info' | 'warn' | 'error';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  error: (message: string, error?: unknown) => {
    if (isDevelopment) {
      console.error(message, error);
    }
    // 在生产环境中，这里可以发送到错误追踪服务（如 Sentry）
  },

  warn: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.warn(message, data);
    }
  },

  info: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.info(message, data);
    }
  },
};
