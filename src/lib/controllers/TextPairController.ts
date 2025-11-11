"use server";

import { pool } from "../db";

export async function createTextPair(
  locale1: string,
  locale2: string,
  text1: string,
  text2: string,
  folderId: number,
) {
  try {
    await pool.query(
      "INSERT INTO text_pairs (locale1, locale2, text1, text2, folder_id) VALUES ($1, $2, $3, $4, $5)",
      [locale1.trim(), locale2.trim(), text1.trim(), text2.trim(), folderId],
    );
  } catch (e) {
    console.log(e);
  }
}

export async function deleteTextPairById(id: number) {
  try {
    await pool.query("DELETE FROM text_pairs WHERE id = $1", [id]);
  } catch (e) {
    console.log(e);
  }
}

export async function updateWordPairById(
  id: number,
  locale1: string,
  locale2: string,
  text1: string,
  text2: string,
) {
  try {
    await pool.query(
      "UPDATE text_pairs SET locale1 = $1, locale2 = $2, text1 = $3, text2 = $4 WHERE id = $5",
      [locale1.trim(), locale2.trim(), text1.trim(), text2.trim(), id],
    );
  } catch (e) {
    console.log(e);
  }
}

export async function getTextPairsByFolderId(folderId: number) {
  try {
    const textPairs = await pool.query(
      "SELECT * FROM text_pairs WHERE folder_id = $1",
      [folderId],
    );
    return textPairs.rows;
  } catch (e) {
    console.log(e);
  }
}

export async function getTextPairsCountByFolderId(folderId: number) {
  try {
    const count = await pool.query(
      "SELECT COUNT(*) FROM text_pairs WHERE folder_id = $1",
      [folderId],
    );
    return count.rows[0].count;
  } catch (e) {
    console.log(e);
  }
}
