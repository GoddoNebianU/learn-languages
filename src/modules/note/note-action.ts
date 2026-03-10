"use server";

import { auth } from "@/auth";
import { headers } from "next/headers";
import { createLogger } from "@/lib/logger";
import { ValidateError } from "@/lib/errors";
import {
  ActionInputCreateNote,
  ActionInputUpdateNote,
  ActionInputDeleteNote,
  ActionInputGetNoteById,
  ActionInputGetNotesByNoteTypeId,
  ActionInputGetNotesByUserId,
  ActionOutputCreateNote,
  ActionOutputUpdateNote,
  ActionOutputDeleteNote,
  ActionOutputGetNoteById,
  ActionOutputGetNotes,
  ActionOutputNoteCount,
  ActionOutputNote,
  validateActionInputCreateNote,
  validateActionInputUpdateNote,
  validateActionInputDeleteNote,
  validateActionInputGetNoteById,
  validateActionInputGetNotesByNoteTypeId,
  validateActionInputGetNotesByUserId,
} from "./note-action-dto";
import {
  serviceCreateNote,
  serviceUpdateNote,
  serviceDeleteNote,
  serviceGetNoteById,
  serviceGetNotesByNoteTypeId,
  serviceGetNotesByUserId,
  serviceCountNotesByUserId,
  serviceCountNotesByNoteTypeId,
  NoteNotFoundError,
  NoteOwnershipError,
} from "./note-service";

const log = createLogger("note-action");

function mapNoteToOutput(note: {
  id: bigint;
  guid: string;
  noteTypeId: number;
  mod: number;
  usn: number;
  tags: string[];
  fields: string[];
  sfld: string;
  csum: number;
  flags: number;
  data: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}): ActionOutputNote {
  return {
    id: note.id.toString(),
    guid: note.guid,
    noteTypeId: note.noteTypeId,
    mod: note.mod,
    usn: note.usn,
    tags: note.tags,
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

async function requireAuth(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

export async function actionCreateNote(
  input: unknown,
): Promise<ActionOutputCreateNote> {
  try {
    const userId = await requireAuth();
    const validated = validateActionInputCreateNote(input);

    log.debug("Creating note", { userId, noteTypeId: validated.noteTypeId });

    const result = await serviceCreateNote({
      ...validated,
      userId,
    });

    log.info("Note created", { id: result.id.toString(), guid: result.guid });

    return {
      success: true,
      message: "Note created successfully",
      data: {
        id: result.id.toString(),
        guid: result.guid,
      },
    };
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    if (e instanceof Error && e.message === "Unauthorized") {
      return { success: false, message: "Unauthorized" };
    }
    log.error("Failed to create note", { error: e });
    return { success: false, message: "An unknown error occurred" };
  }
}

export async function actionUpdateNote(
  input: unknown,
): Promise<ActionOutputUpdateNote> {
  try {
    const userId = await requireAuth();
    const validated = validateActionInputUpdateNote(input);

    log.debug("Updating note", { noteId: validated.noteId.toString() });

    await serviceUpdateNote({
      ...validated,
      userId,
    });

    log.info("Note updated", { noteId: validated.noteId.toString() });

    return {
      success: true,
      message: "Note updated successfully",
    };
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    if (e instanceof NoteNotFoundError) {
      return { success: false, message: "Note not found" };
    }
    if (e instanceof NoteOwnershipError) {
      return { success: false, message: "You do not have permission to update this note" };
    }
    if (e instanceof Error && e.message === "Unauthorized") {
      return { success: false, message: "Unauthorized" };
    }
    log.error("Failed to update note", { error: e });
    return { success: false, message: "An unknown error occurred" };
  }
}

export async function actionDeleteNote(
  input: unknown,
): Promise<ActionOutputDeleteNote> {
  try {
    const userId = await requireAuth();
    const validated = validateActionInputDeleteNote(input);

    log.debug("Deleting note", { noteId: validated.noteId.toString() });

    await serviceDeleteNote({
      ...validated,
      userId,
    });

    log.info("Note deleted", { noteId: validated.noteId.toString() });

    return {
      success: true,
      message: "Note deleted successfully",
    };
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    if (e instanceof NoteNotFoundError) {
      return { success: false, message: "Note not found" };
    }
    if (e instanceof NoteOwnershipError) {
      return { success: false, message: "You do not have permission to delete this note" };
    }
    if (e instanceof Error && e.message === "Unauthorized") {
      return { success: false, message: "Unauthorized" };
    }
    log.error("Failed to delete note", { error: e });
    return { success: false, message: "An unknown error occurred" };
  }
}

export async function actionGetNoteById(
  input: unknown,
): Promise<ActionOutputGetNoteById> {
  try {
    const validated = validateActionInputGetNoteById(input);

    log.debug("Fetching note", { noteId: validated.noteId.toString() });

    const note = await serviceGetNoteById(validated);

    if (!note) {
      return {
        success: false,
        message: "Note not found",
      };
    }

    return {
      success: true,
      message: "Note retrieved successfully",
      data: mapNoteToOutput(note),
    };
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to get note", { error: e });
    return { success: false, message: "An unknown error occurred" };
  }
}

export async function actionGetNotesByNoteTypeId(
  input: unknown,
): Promise<ActionOutputGetNotes> {
  try {
    const validated = validateActionInputGetNotesByNoteTypeId(input);

    log.debug("Fetching notes by note type", { noteTypeId: validated.noteTypeId });

    const notes = await serviceGetNotesByNoteTypeId(validated);

    return {
      success: true,
      message: "Notes retrieved successfully",
      data: notes.map(mapNoteToOutput),
    };
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to get notes by note type", { error: e });
    return { success: false, message: "An unknown error occurred" };
  }
}

export async function actionGetNotesByUserId(
  input: unknown,
): Promise<ActionOutputGetNotes> {
  try {
    const validated = validateActionInputGetNotesByUserId(input);

    log.debug("Fetching notes by user", { userId: validated.userId });

    const notes = await serviceGetNotesByUserId(validated);

    return {
      success: true,
      message: "Notes retrieved successfully",
      data: notes.map(mapNoteToOutput),
    };
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to get notes by user", { error: e });
    return { success: false, message: "An unknown error occurred" };
  }
}

export async function actionGetMyNotes(
  limit?: number,
  offset?: number,
): Promise<ActionOutputGetNotes> {
  try {
    const userId = await requireAuth();

    log.debug("Fetching current user's notes", { userId, limit, offset });

    const notes = await serviceGetNotesByUserId({
      userId,
      limit,
      offset,
    });

    return {
      success: true,
      message: "Notes retrieved successfully",
      data: notes.map(mapNoteToOutput),
    };
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return { success: false, message: "Unauthorized" };
    }
    log.error("Failed to get user's notes", { error: e });
    return { success: false, message: "An unknown error occurred" };
  }
}

export async function actionGetMyNoteCount(): Promise<ActionOutputNoteCount> {
  try {
    const userId = await requireAuth();

    log.debug("Counting current user's notes", { userId });

    const result = await serviceCountNotesByUserId(userId);

    return {
      success: true,
      message: "Note count retrieved successfully",
      data: { count: result.count },
    };
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return { success: false, message: "Unauthorized" };
    }
    log.error("Failed to count user's notes", { error: e });
    return { success: false, message: "An unknown error occurred" };
  }
}

export async function actionGetNoteCountByNoteType(
  noteTypeId: number,
): Promise<ActionOutputNoteCount> {
  try {
    log.debug("Counting notes by note type", { noteTypeId });

    const result = await serviceCountNotesByNoteTypeId(noteTypeId);

    return {
      success: true,
      message: "Note count retrieved successfully",
      data: { count: result.count },
    };
  } catch (e) {
    log.error("Failed to count notes by note type", { error: e });
    return { success: false, message: "An unknown error occurred" };
  }
}
