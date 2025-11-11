import { Pool } from "pg";

export const pool = new Pool({
  user: "postgres",
  host: "localhost",
  max: 20,
  idleTimeoutMillis: 3000,
  connectionTimeoutMillis: 2000,
  maxLifetimeSeconds: 60,
});
