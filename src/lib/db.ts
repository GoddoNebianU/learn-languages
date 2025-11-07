import bcrypt from "bcryptjs";
import { Pool } from "pg";

export const pool = new Pool({
  user: "postgres",
  host: "localhost",
  max: 20,
  idleTimeoutMillis: 3000,
  connectionTimeoutMillis: 2000,
  maxLifetimeSeconds: 60,
});

export class UserController {
  static async createUser(username: string, password: string) {
    const encodedPassword = await bcrypt.hash(password, 10);
    try {
      await pool.query(
        "INSERT INTO users (username, password) VALUES ($1, $2)",
        [username, encodedPassword],
      );
    } catch (e) {
      console.log(e);
    }
  }
  static async getUserByUsername(username: string) {
    try {
      const user = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
      return user.rows[0];
    } catch (e) {
      console.log(e);
    }
  }
}

export class FolderController {
  
}
