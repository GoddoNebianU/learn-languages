import { logger } from "./logger";

export { logger };

export function createLogger(context: string) {
  return {
    debug: (message: string, meta?: object) =>
      logger.debug(`[${context}] ${message}`, meta),
    info: (message: string, meta?: object) =>
      logger.info(`[${context}] ${message}`, meta),
    warn: (message: string, meta?: object) =>
      logger.warn(`[${context}] ${message}`, meta),
    error: (message: string, meta?: object) =>
      logger.error(`[${context}] ${message}`, meta),
  };
}
