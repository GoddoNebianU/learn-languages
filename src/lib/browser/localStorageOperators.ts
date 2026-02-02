import { z } from "zod";

interface LocalStorageOperator<T> {
  get: () => T;
  set: (value: T) => void;
}

export function getLocalStorageOperator<T extends z.ZodType>(
  key: string,
  schema: T
): LocalStorageOperator<z.infer<T>> {
  const get = (): z.infer<T> => {
    if (typeof window === "undefined") {
      return [] as unknown as z.infer<T>;
    }

    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return [] as unknown as z.infer<T>;
      }

      const parsed = JSON.parse(item);
      return schema.parse(parsed);
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return [] as unknown as z.infer<T>;
    }
  };

  const set = (value: z.infer<T>): void => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  };

  return { get, set };
}
