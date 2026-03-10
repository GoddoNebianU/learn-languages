import { prisma } from "@/lib/db";
import { createLogger } from "@/lib/logger";
import { createHash } from "crypto";
import {
  RepoInputCreateNote,
  RepoInputUpdateNote,
  RepoInputGetNoteById,
  RepoInputGetNotesByNoteTypeId,
  RepoInputGetNotesByUserId,
  RepoInputDeleteNote,
  RepoInputCheckNoteOwnership,
  RepoOutputNote,
  RepoOutputNoteWithFields,
  RepoOutputNoteOwnership,
} from "./note-repository-dto";

const log = createLogger("note-repository");

const FIELD_SEPARATOR = "\x1f";
const BASE91_CHARS =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&()*+,-./:;<=>?@[]^_`{|}~";

export function repoGenerateGuid(): string {
  let guid = "";
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < 10; i++) {
    guid += BASE91_CHARS[bytes[i] % BASE91_CHARS.length];
  }
  return guid;
}

export function repoCalculateCsum(text: string): number {
  const hash = createHash("sha1").update(text.normalize("NFC")).digest("hex");
  return parseInt(hash.substring(0, 8), 16);
}

export function repoJoinFields(fields: string[]): string {
  return fields.join(FIELD_SEPARATOR);
}

export function repoSplitFields(flds: string): string[] {
  return flds.split(FIELD_SEPARATOR);
}

export async function repoCreateNote(
  input: RepoInputCreateNote,
): Promise<bigint> {
  const now = Date.now();
  const id = BigInt(now);
  const guid = repoGenerateGuid();
  const flds = repoJoinFields(input.fields);
  const sfld = input.fields[0] ?? "";
  const csum = repoCalculateCsum(sfld);
  const tags = input.tags?.join(" ") ?? " ";

  log.debug("Creating note", { id: id.toString(), guid, noteTypeId: input.noteTypeId });

  await prisma.note.create({
    data: {
      id,
      guid,
      noteTypeId: input.noteTypeId,
      mod: Math.floor(now / 1000),
      usn: -1,
      tags,
      flds,
      sfld,
      csum,
      flags: 0,
      data: "",
      userId: input.userId,
    },
  });

  log.info("Note created", { id: id.toString(), guid });
  return id;
}

export async function repoUpdateNote(input: RepoInputUpdateNote): Promise<void> {
  const now = Date.now();
  const updateData: {
    mod?: number;
    usn?: number;
    flds?: string;
    sfld?: string;
    csum?: number;
    tags?: string;
  } = {
    mod: Math.floor(now / 1000),
    usn: -1,
  };

  if (input.fields) {
    updateData.flds = repoJoinFields(input.fields);
    updateData.sfld = input.fields[0] ?? "";
    updateData.csum = repoCalculateCsum(updateData.sfld);
  }

  if (input.tags) {
    updateData.tags = input.tags.join(" ");
  }

  log.debug("Updating note", { id: input.id.toString() });

  await prisma.note.update({
    where: { id: input.id },
    data: updateData,
  });

  log.info("Note updated", { id: input.id.toString() });
}

export async function repoGetNoteById(
  input: RepoInputGetNoteById,
): Promise<RepoOutputNote | null> {
  const note = await prisma.note.findUnique({
    where: { id: input.id },
  });

  if (!note) {
    log.debug("Note not found", { id: input.id.toString() });
    return null;
  }

  return {
    id: note.id,
    guid: note.guid,
    noteTypeId: note.noteTypeId,
    mod: note.mod,
    usn: note.usn,
    tags: note.tags,
    flds: note.flds,
    sfld: note.sfld,
    csum: note.csum,
    flags: note.flags,
    data: note.data,
    userId: note.userId,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

export async function repoGetNoteByIdWithFields(
  input: RepoInputGetNoteById,
): Promise<RepoOutputNoteWithFields | null> {
  const note = await repoGetNoteById(input);
  if (!note) return null;

  return {
    ...note,
    fields: repoSplitFields(note.flds),
    tagsArray: note.tags.trim() === "" ? [] : note.tags.trim().split(" "),
  };
}

export async function repoGetNotesByNoteTypeId(
  input: RepoInputGetNotesByNoteTypeId,
): Promise<RepoOutputNote[]> {
  const { noteTypeId, limit = 50, offset = 0 } = input;

  log.debug("Fetching notes by note type", { noteTypeId, limit, offset });

  const notes = await prisma.note.findMany({
    where: { noteTypeId },
    orderBy: { id: "desc" },
    take: limit,
    skip: offset,
  });

  log.info("Fetched notes by note type", { noteTypeId, count: notes.length });

  return notes.map((note) => ({
    id: note.id,
    guid: note.guid,
    noteTypeId: note.noteTypeId,
    mod: note.mod,
    usn: note.usn,
    tags: note.tags,
    flds: note.flds,
    sfld: note.sfld,
    csum: note.csum,
    flags: note.flags,
    data: note.data,
    userId: note.userId,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  }));
}

export async function repoGetNotesByUserId(
  input: RepoInputGetNotesByUserId,
): Promise<RepoOutputNote[]> {
  const { userId, limit = 50, offset = 0 } = input;

  log.debug("Fetching notes by user", { userId, limit, offset });

  const notes = await prisma.note.findMany({
    where: { userId },
    orderBy: { id: "desc" },
    take: limit,
    skip: offset,
  });

  log.info("Fetched notes by user", { userId, count: notes.length });

  return notes.map((note) => ({
    id: note.id,
    guid: note.guid,
    noteTypeId: note.noteTypeId,
    mod: note.mod,
    usn: note.usn,
    tags: note.tags,
    flds: note.flds,
    sfld: note.sfld,
    csum: note.csum,
    flags: note.flags,
    data: note.data,
    userId: note.userId,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  }));
}

export async function repoGetNotesByUserIdWithFields(
  input: RepoInputGetNotesByUserId,
): Promise<RepoOutputNoteWithFields[]> {
  const notes = await repoGetNotesByUserId(input);

  return notes.map((note) => ({
    ...note,
    fields: repoSplitFields(note.flds),
    tagsArray: note.tags.trim() === "" ? [] : note.tags.trim().split(" "),
  }));
}

export async function repoDeleteNote(input: RepoInputDeleteNote): Promise<void> {
  log.debug("Deleting note", { id: input.id.toString() });

  await prisma.note.delete({
    where: { id: input.id },
  });

  log.info("Note deleted", { id: input.id.toString() });
}

export async function repoCheckNoteOwnership(
  input: RepoInputCheckNoteOwnership,
): Promise<boolean> {
  const note = await prisma.note.findUnique({
    where: { id: input.noteId },
    select: { userId: true },
  });

  return note?.userId === input.userId;
}

export async function repoGetNoteOwnership(
  input: RepoInputGetNoteById,
): Promise<RepoOutputNoteOwnership | null> {
  const note = await prisma.note.findUnique({
    where: { id: input.id },
    select: { userId: true },
  });

  if (!note) return null;

  return { userId: note.userId };
}

export async function repoCountNotesByUserId(userId: string): Promise<number> {
  return prisma.note.count({
    where: { userId },
  });
}

export async function repoCountNotesByNoteTypeId(
  noteTypeId: number,
): Promise<number> {
  return prisma.note.count({
    where: { noteTypeId },
  });
}
