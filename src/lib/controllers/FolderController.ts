"use server";

import { pool } from "../db";

export async function deleteFolderById(id: number) {
  try {
    await pool.query("DELETE FROM folders WHERE id = $1", [id]);
  } catch (e) {
    console.log(e);
  }
}

export async function getFoldersByOwner(owner: string) {
  try {
    const folders = await pool.query("SELECT * FROM folders WHERE owner = $1", [
      owner,
    ]);
    return folders.rows;
  } catch (e) {
    console.log(e);
  }
}

export async function getOwnerByFolderId(id: number) {
  try {
    const owner = await pool.query("SELECT owner FROM folders WHERE id = $1", [
      id,
    ]);
    return owner.rows[0].owner;
  } catch (e) {
    console.log(e);
  }
}

export async function getFoldersWithTextPairsCountByOwner(owner: string) {
  try {
    const folders = await pool.query(
      `select f.id, f.name, f.owner, count(tp.id) as text_pairs_count from folders f
    left join text_pairs tp on tp.folder_id = f.id
    where f.owner = $1
    group by f.id, f.name, f.owner`,
      [owner],
    );
    return folders.rows;
  } catch (e) {
    console.log(e);
  }
}

export async function createFolder(name: string, owner: string) {
  try {
    return (
      await pool.query("INSERT INTO folders (name, owner) VALUES ($1, $2)", [
        name.trim(),
        owner,
      ])
    ).rows[0];
  } catch (e) {
    console.log(e);
  }
}
