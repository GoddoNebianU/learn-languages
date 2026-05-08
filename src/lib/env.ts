import z from "zod";

const baseEnvSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL connection string"),
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
  BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL").optional().default(""),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const smtpSchema = z.object({
  SMTP_HOST: z.string().min(1, "SMTP_HOST is required in multi-user mode"),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  SMTP_USER: z.string().min(1, "SMTP_USER is required in multi-user mode"),
  SMTP_PASS: z.string().min(1, "SMTP_PASS is required in multi-user mode"),
  SMTP_FROM: z.string().min(1).optional(),
});

const isSingleMode = process.env.NEXT_PUBLIC_AUTH_MODE === "single";

const baseEnv = baseEnvSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  NODE_ENV: process.env.NODE_ENV,
});

const smtpEnv = isSingleMode
  ? smtpSchema.parse({
      SMTP_HOST: process.env.SMTP_HOST || "localhost",
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_SECURE: process.env.SMTP_SECURE,
      SMTP_USER: process.env.SMTP_USER || "unused",
      SMTP_PASS: process.env.SMTP_PASS || "unused",
      SMTP_FROM: process.env.SMTP_FROM,
    })
  : smtpSchema.parse({
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_SECURE: process.env.SMTP_SECURE,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS,
      SMTP_FROM: process.env.SMTP_FROM,
    });

export const serverEnv = { ...baseEnv, ...smtpEnv };

export type AuthMode = "single" | "multi";

export function getAuthMode(): AuthMode {
  return process.env.NEXT_PUBLIC_AUTH_MODE === "single" ? "single" : "multi";
}

export function isSingleUserMode(): boolean {
  return getAuthMode() === "single";
}

function requireApiKey(name: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    throw new Error(`${name} environment variable is not set`);
  }
  return value;
}

export function getLlmApiKey(): string {
  return requireApiKey("LLM_API_KEY", process.env.LLM_API_KEY);
}

export function getLlmApiUrl(): string {
  return process.env.LLM_API_URL || "https://api.deepseek.com/chat/completions";
}

export function getLlmModelName(): string {
  return process.env.LLM_MODEL_NAME || "deepseek-v3";
}

export function getDashscopeApiKey(): string {
  return requireApiKey("DASHSCORE_API_KEY", process.env.DASHSCORE_API_KEY);
}
