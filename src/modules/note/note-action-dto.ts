import { generateValidator } from "@/utils/validate";
import z from "zod";

export const LENGTH_MAX_NOTE_FIELD = 65535;
export const LENGTH_MIN_NOTE_FIELD = 0;
export const LENGTH_MAX_TAG = 100;
export const MAX_FIELDS = 100;
export const MAX_TAGS = 100;

export const schemaActionInputCreateNote = z.object({
  noteTypeId: z.number().int().positive(),
  fields: z
    .array(z.string().max(LENGTH_MAX_NOTE_FIELD))
    .min(1)
    .max(MAX_FIELDS),
  tags: z.array(z.string().max(LENGTH_MAX_TAG)).max(MAX_TAGS).optional(),
});
export type ActionInputCreateNote = z.infer<typeof schemaActionInputCreateNote>;
export const validateActionInputCreateNote = generateValidator(
  schemaActionInputCreateNote,
);

export const schemaActionInputUpdateNote = z.object({
  noteId: z.bigint(),
  fields: z
    .array(z.string().max(LENGTH_MAX_NOTE_FIELD))
    .min(1)
    .max(MAX_FIELDS)
    .optional(),
  tags: z.array(z.string().max(LENGTH_MAX_TAG)).max(MAX_TAGS).optional(),
});
export type ActionInputUpdateNote = z.infer<typeof schemaActionInputUpdateNote>;
export const validateActionInputUpdateNote = generateValidator(
  schemaActionInputUpdateNote,
);

export const schemaActionInputDeleteNote = z.object({
  noteId: z.bigint(),
});
export type ActionInputDeleteNote = z.infer<typeof schemaActionInputDeleteNote>;
export const validateActionInputDeleteNote = generateValidator(
  schemaActionInputDeleteNote,
);

export const schemaActionInputGetNoteById = z.object({
  noteId: z.bigint(),
});
export type ActionInputGetNoteById = z.infer<typeof schemaActionInputGetNoteById>;
export const validateActionInputGetNoteById = generateValidator(
  schemaActionInputGetNoteById,
);

export const schemaActionInputGetNotesByNoteTypeId = z.object({
  noteTypeId: z.number().int().positive(),
  limit: z.number().int().positive().max(1000).optional(),
  offset: z.number().int().nonnegative().optional(),
});
export type ActionInputGetNotesByNoteTypeId = z.infer<
  typeof schemaActionInputGetNotesByNoteTypeId
>;
export const validateActionInputGetNotesByNoteTypeId = generateValidator(
  schemaActionInputGetNotesByNoteTypeId,
);

export const schemaActionInputGetNotesByUserId = z.object({
  userId: z.string().min(1),
  limit: z.number().int().positive().max(1000).optional(),
  offset: z.number().int().nonnegative().optional(),
});
export type ActionInputGetNotesByUserId = z.infer<
  typeof schemaActionInputGetNotesByUserId
>;
export const validateActionInputGetNotesByUserId = generateValidator(
  schemaActionInputGetNotesByUserId,
);

export type ActionOutputNote = {
  id: string;
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
};

export type ActionOutputCreateNote = {
  message: string;
  success: boolean;
  data?: {
    id: string;
    guid: string;
  };
};

export type ActionOutputUpdateNote = {
  message: string;
  success: boolean;
};

export type ActionOutputDeleteNote = {
  message: string;
  success: boolean;
};

export type ActionOutputGetNoteById = {
  message: string;
  success: boolean;
  data?: ActionOutputNote;
};

export type ActionOutputGetNotes = {
  message: string;
  success: boolean;
  data?: ActionOutputNote[];
};

export type ActionOutputNoteCount = {
  message: string;
  success: boolean;
  data?: {
    count: number;
  };
};
