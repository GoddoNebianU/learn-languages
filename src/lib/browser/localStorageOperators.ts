"use client";

import { z } from "zod";

interface LocalStorageOperator<T> {
  get: () => T | null;
  set: (value: T) => void;
}

export function getLocalStorageOperator<T extends z.ZodType>(
  key: string,
  schema: T
): LocalStorageOperator<z.infer<T>> {
  const get = (): z.infer<T> | null => {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return null;
      }

      const parsed = JSON.parse(item);
      const result = schema.safeParse(parsed);

      if (!result.success) {
        console.warn(
          `[localStorage] Schema validation failed for key "${key}":`,
          result.error.message
        );
        return null;
      }

      return result.data;
    } catch (error) {
      console.error(
        `[localStorage] Error reading key "${key}":`,
        error instanceof Error ? error.message : String(error)
      );
      return null;
    }
  };

  const set = (value: z.infer<T>): void => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(
        `[localStorage] Error writing key "${key}":`,
        error instanceof Error ? error.message : String(error)
      );
    }
  };

  return { get, set };
}
