import z from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL connection string"),
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
  BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL").optional().default(""),
  ADMIN_PASSWORD: z.string().min(1, "ADMIN_PASSWORD is required"),
  ADMIN_JWT_SECRET: z.string().min(1, "ADMIN_JWT_SECRET must be a non-empty string").optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export const serverEnv = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV,
});
