import { prisma } from "@/lib/db";
import { createLogger } from "@/lib/logger";
import {
  RepoInputCreateNoteType,
  RepoInputUpdateNoteType,
  RepoInputGetNoteTypeById,
  RepoInputGetNoteTypesByUserId,
  RepoInputDeleteNoteType,
  RepoInputCheckNotesExist,
  RepoOutputNoteType,
  RepoOutputNoteTypeOwnership,
  RepoOutputNotesExistCheck,
  NoteTypeField,
  NoteTypeTemplate,
} from "./note-type-repository-dto";
import { NoteKind } from "../../../generated/prisma/enums";

const log = createLogger("note-type-repository");

export async function repoCreateNoteType(
  input: RepoInputCreateNoteType,
): Promise<number> {
  const noteType = await prisma.noteType.create({
    data: {
      name: input.name,
      kind: input.kind ?? NoteKind.STANDARD,
      css: input.css ?? "",
      fields: input.fields as unknown as object,
      templates: input.templates as unknown as object,
      userId: input.userId,
    },
  });

  log.info("Created note type", { id: noteType.id, name: noteType.name });
  return noteType.id;
}

export async function repoUpdateNoteType(
  input: RepoInputUpdateNoteType,
): Promise<void> {
  const updateData: {
    name?: string;
    kind?: NoteKind;
    css?: string;
    fields?: object;
    templates?: object;
  } = {};

  if (input.name !== undefined) updateData.name = input.name;
  if (input.kind !== undefined) updateData.kind = input.kind;
  if (input.css !== undefined) updateData.css = input.css;
  if (input.fields !== undefined)
    updateData.fields = input.fields as unknown as object;
  if (input.templates !== undefined)
    updateData.templates = input.templates as unknown as object;

  await prisma.noteType.update({
    where: { id: input.id },
    data: updateData,
  });

  log.info("Updated note type", { id: input.id });
}

export async function repoGetNoteTypeById(
  input: RepoInputGetNoteTypeById,
): Promise<RepoOutputNoteType | null> {
  const noteType = await prisma.noteType.findUnique({
    where: { id: input.id },
  });

  if (!noteType) return null;

  return {
    id: noteType.id,
    name: noteType.name,
    kind: noteType.kind,
    css: noteType.css,
    fields: noteType.fields as unknown as NoteTypeField[],
    templates: noteType.templates as unknown as NoteTypeTemplate[],
    userId: noteType.userId,
    createdAt: noteType.createdAt,
    updatedAt: noteType.updatedAt,
  };
}

export async function repoGetNoteTypesByUserId(
  input: RepoInputGetNoteTypesByUserId,
): Promise<RepoOutputNoteType[]> {
  const noteTypes = await prisma.noteType.findMany({
    where: { userId: input.userId },
    orderBy: { createdAt: "desc" },
  });

  return noteTypes.map((nt) => ({
    id: nt.id,
    name: nt.name,
    kind: nt.kind,
    css: nt.css,
    fields: nt.fields as unknown as NoteTypeField[],
    templates: nt.templates as unknown as NoteTypeTemplate[],
    userId: nt.userId,
    createdAt: nt.createdAt,
    updatedAt: nt.updatedAt,
  }));
}

export async function repoGetNoteTypeOwnership(
  noteTypeId: number,
): Promise<RepoOutputNoteTypeOwnership | null> {
  const noteType = await prisma.noteType.findUnique({
    where: { id: noteTypeId },
    select: { userId: true },
  });

  return noteType;
}

export async function repoDeleteNoteType(
  input: RepoInputDeleteNoteType,
): Promise<void> {
  await prisma.noteType.delete({
    where: { id: input.id },
  });

  log.info("Deleted note type", { id: input.id });
}

export async function repoCheckNotesExist(
  input: RepoInputCheckNotesExist,
): Promise<RepoOutputNotesExistCheck> {
  const count = await prisma.note.count({
    where: { noteTypeId: input.noteTypeId },
  });

  return {
    exists: count > 0,
    count,
  };
}

export async function repoGetNoteTypeNameById(
  noteTypeId: number,
): Promise<string | null> {
  const noteType = await prisma.noteType.findUnique({
    where: { id: noteTypeId },
    select: { name: true },
  });

  return noteType?.name ?? null;
}
