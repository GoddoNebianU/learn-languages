import { createLogger } from "@/lib/logger";
import {
  repoCreateNote,
  repoUpdateNote,
  repoGetNoteByIdWithFields,
  repoGetNotesByNoteTypeId,
  repoGetNotesByUserIdWithFields,
  repoDeleteNote,
  repoCheckNoteOwnership,
  repoCountNotesByUserId,
  repoCountNotesByNoteTypeId,
} from "./note-repository";
import {
  ServiceInputCreateNote,
  ServiceInputUpdateNote,
  ServiceInputDeleteNote,
  ServiceInputGetNoteById,
  ServiceInputGetNotesByNoteTypeId,
  ServiceInputGetNotesByUserId,
  ServiceOutputNote,
  ServiceOutputCreateNote,
  ServiceOutputNoteCount,
} from "./note-service-dto";

const log = createLogger("note-service");

export class NoteNotFoundError extends Error {
  constructor(noteId: bigint) {
    super(`Note not found: ${noteId.toString()}`);
    this.name = "NoteNotFoundError";
  }
}

export class NoteOwnershipError extends Error {
  constructor() {
    super("You do not have permission to access this note");
    this.name = "NoteOwnershipError";
  }
}

export async function serviceCreateNote(
  input: ServiceInputCreateNote,
): Promise<ServiceOutputCreateNote> {
  log.debug("Creating note", { userId: input.userId, noteTypeId: input.noteTypeId });

  const id = await repoCreateNote({
    noteTypeId: input.noteTypeId,
    fields: input.fields,
    tags: input.tags,
    userId: input.userId,
  });

  const note = await repoGetNoteByIdWithFields({ id });
  if (!note) {
    throw new NoteNotFoundError(id);
  }

  log.info("Note created successfully", { id: id.toString(), guid: note.guid });

  return {
    id,
    guid: note.guid,
  };
}

export async function serviceUpdateNote(
  input: ServiceInputUpdateNote,
): Promise<void> {
  log.debug("Updating note", { noteId: input.noteId.toString() });

  const isOwner = await repoCheckNoteOwnership({
    noteId: input.noteId,
    userId: input.userId,
  });

  if (!isOwner) {
    throw new NoteOwnershipError();
  }

  await repoUpdateNote({
    id: input.noteId,
    fields: input.fields,
    tags: input.tags,
  });

  log.info("Note updated successfully", { noteId: input.noteId.toString() });
}

export async function serviceDeleteNote(
  input: ServiceInputDeleteNote,
): Promise<void> {
  log.debug("Deleting note", { noteId: input.noteId.toString() });

  const isOwner = await repoCheckNoteOwnership({
    noteId: input.noteId,
    userId: input.userId,
  });

  if (!isOwner) {
    throw new NoteOwnershipError();
  }

  await repoDeleteNote({ id: input.noteId });

  log.info("Note deleted successfully", { noteId: input.noteId.toString() });
}

export async function serviceGetNoteById(
  input: ServiceInputGetNoteById,
): Promise<ServiceOutputNote | null> {
  log.debug("Fetching note by id", { noteId: input.noteId.toString() });

  const note = await repoGetNoteByIdWithFields({ id: input.noteId });

  if (!note) {
    log.debug("Note not found", { noteId: input.noteId.toString() });
    return null;
  }

  return {
    id: note.id,
    guid: note.guid,
    noteTypeId: note.noteTypeId,
    mod: note.mod,
    usn: note.usn,
    tags: note.tagsArray,
    fields: note.fields,
    sfld: note.sfld,
    csum: note.csum,
    flags: note.flags,
    data: note.data,
    userId: note.userId,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

export async function serviceGetNotesByNoteTypeId(
  input: ServiceInputGetNotesByNoteTypeId,
): Promise<ServiceOutputNote[]> {
  log.debug("Fetching notes by note type", { noteTypeId: input.noteTypeId });

  const notes = await repoGetNotesByNoteTypeId(input);

  return notes.map((note) => ({
    id: note.id,
    guid: note.guid,
    noteTypeId: note.noteTypeId,
    mod: note.mod,
    usn: note.usn,
    tags: note.tags.trim() === "" ? [] : note.tags.trim().split(" "),
    fields: note.flds.split("\x1f"),
    sfld: note.sfld,
    csum: note.csum,
    flags: note.flags,
    data: note.data,
    userId: note.userId,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  }));
}

export async function serviceGetNotesByUserId(
  input: ServiceInputGetNotesByUserId,
): Promise<ServiceOutputNote[]> {
  log.debug("Fetching notes by user", { userId: input.userId });

  const notes = await repoGetNotesByUserIdWithFields(input);

  return notes.map((note) => ({
    id: note.id,
    guid: note.guid,
    noteTypeId: note.noteTypeId,
    mod: note.mod,
    usn: note.usn,
    tags: note.tagsArray,
    fields: note.fields,
    sfld: note.sfld,
    csum: note.csum,
    flags: note.flags,
    data: note.data,
    userId: note.userId,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  }));
}

export async function serviceCountNotesByUserId(
  userId: string,
): Promise<ServiceOutputNoteCount> {
  const count = await repoCountNotesByUserId(userId);
  return { count };
}

export async function serviceCountNotesByNoteTypeId(
  noteTypeId: number,
): Promise<ServiceOutputNoteCount> {
  const count = await repoCountNotesByNoteTypeId(noteTypeId);
  return { count };
}
