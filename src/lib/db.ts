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
      const user = await pool.query("SELECT * FROM users WHERE username = $1", [
        username,
      ]);
      return user.rows[0];
    } catch (e) {
      console.log(e);
    }
  }
  static async deleteUserById(id: number) {
    try {
      await pool.query("DELETE FROM users WHERE id = $1", [id]);
    } catch (e) {
      console.log(e);
    }
  }
}

export class FolderController {
  static async getFolderById(id: number) {
    try {
      const folder = await pool.query("SELECT * FROM folders WHERE id = $1", [
        id,
      ]);
      return folder.rows[0];
    } catch (e) {
      console.log(e);
    }
  }
  static async deleteFolderById(id: number) {
    try {
      await pool.query("DELETE FROM folders WHERE id = $1", [id]);
    } catch (e) {
      console.log(e);
    }
  }
  static async getFoldersByOwner(owner: string) {
    try {
      const folders = await pool.query(
        "SELECT * FROM folders WHERE owner = $1",
        [owner],
      );
      return folders.rows;
    } catch (e) {
      console.log(e);
    }
  }
  static async createFolder(name: string, owner: string) {
    try {
      return (
        await pool.query("INSERT INTO folders (name, owner) VALUES ($1, $2)", [
          name,
          owner,
        ])
      ).rows[0];
    } catch (e) {
      console.log(e);
    }
  }
}

export class WordPairController {
  static async createWordPair(
    locale1: string,
    locale2: string,
    text1: string,
    text2: string,
    folderId: number,
  ) {
    try {
      await pool.query(
        "INSERT INTO word_pairs (locale1, locale2, text1, text2, folder_id) VALUES ($1, $2, $3, $4, $5)",
        [locale1, locale2, text1, text2, folderId],
      );
    } catch (e) {
      console.log(e);
    }
  }
  static async getWordPairById(id: number) {
    try {
      const wordPair = await pool.query(
        "SELECT * FROM word_pairs WHERE id = $1",
        [id],
      );
      return wordPair.rows[0];
    } catch (e) {
      console.log(e);
    }
  }
  static async deleteWordPairById(id: number) {
    try {
      await pool.query("DELETE FROM word_pairs WHERE id = $1", [id]);
    } catch (e) {
      console.log(e);
    }
  }
  static async updateWordPairById(
    id: number,
    locale1: string,
    locale2: string,
    text1: string,
    text2: string,
  ) {
    try {
      await pool.query(
        "UPDATE word_pairs SET locale1 = $1, locale2 = $2, text1 = $3, text2 = $4 WHERE id = $5",
        [locale1, locale2, text1, text2, id],
      );
    } catch (e) {
      console.log(e);
    }
  }
  static async getWordPairsByFolderId(folderId: number) {
    try {
      const wordPairs = await pool.query(
        "SELECT * FROM word_pairs WHERE folder_id = $1",
        [folderId],
      );
      return wordPairs.rows;
    } catch (e) {
      console.log(e);
    }
  }
}
