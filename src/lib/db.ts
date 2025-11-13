import { Pool } from "pg";
import z from "zod";

export const pool = new Pool({
  user: "postgres",
  host: "localhost",
  max: 20,
  idleTimeoutMillis: 3000,
  connectionTimeoutMillis: 2000,
  maxLifetimeSeconds: 60,
});

export const TextPairSchema = z.object({
  id: z.number().int().positive(),
  text1: z.string().min(1).max(100),
  text2: z.string().min(1).max(100),
  locale1: z.string().min(2).max(10),
  locale2: z.string().min(2).max(10),
  owner: z.string().min(1).max(40),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const 