class Logger {
  error(message: string, error?: unknown): void {
    if (error instanceof Error) {
      console.error(`[ERROR] ${message}:`, error.message, error.stack);
    } else {
      console.error(`[ERROR] ${message}:`, error);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(`[WARN] ${message}`, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    console.info(`[INFO] ${message}`, ...args);
  }

  debug(message: string, ...args: unknown[]): void {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
}

export const logger = new Logger();
