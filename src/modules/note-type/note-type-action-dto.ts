import z from "zod";
import { generateValidator } from "@/utils/validate";
import { NoteKind } from "../../../generated/prisma/enums";
import {
  schemaNoteTypeField,
  schemaNoteTypeTemplate,
  NoteTypeField,
  NoteTypeTemplate,
} from "./note-type-repository-dto";

export const LENGTH_MIN_NOTE_TYPE_NAME = 1;
export const LENGTH_MAX_NOTE_TYPE_NAME = 100;
export const LENGTH_MAX_CSS = 50000;

const schemaNoteTypeFieldAction = z.object({
  name: z.string().min(1).max(schemaNoteTypeField.name.maxLength),
  ord: z.number().int(),
  sticky: z.boolean(),
  rtl: z.boolean(),
  font: z.string().max(schemaNoteTypeField.font.maxLength).optional(),
  size: z.number().int().min(schemaNoteTypeField.size.min).max(schemaNoteTypeField.size.max).optional(),
  media: z.array(z.string()).optional(),
});

const schemaNoteTypeTemplateAction = z.object({
  name: z.string().min(1).max(schemaNoteTypeTemplate.name.maxLength),
  ord: z.number().int(),
  qfmt: z.string().min(1).max(schemaNoteTypeTemplate.qfmt.maxLength),
  afmt: z.string().min(1).max(schemaNoteTypeTemplate.afmt.maxLength),
  bqfmt: z.string().max(schemaNoteTypeTemplate.bqfmt.maxLength).optional(),
  bafmt: z.string().max(schemaNoteTypeTemplate.bafmt.maxLength).optional(),
  did: z.number().int().optional(),
});

export const schemaActionInputCreateNoteType = z.object({
  name: z.string().min(LENGTH_MIN_NOTE_TYPE_NAME).max(LENGTH_MAX_NOTE_TYPE_NAME),
  kind: z.enum(["STANDARD", "CLOZE"]).optional(),
  css: z.string().max(LENGTH_MAX_CSS).optional(),
  fields: z.array(schemaNoteTypeFieldAction).min(1),
  templates: z.array(schemaNoteTypeTemplateAction).min(1),
});
export type ActionInputCreateNoteType = z.infer<typeof schemaActionInputCreateNoteType>;
export const validateActionInputCreateNoteType = generateValidator(schemaActionInputCreateNoteType);

export const schemaActionInputUpdateNoteType = z.object({
  id: z.number().int().positive(),
  name: z.string().min(LENGTH_MIN_NOTE_TYPE_NAME).max(LENGTH_MAX_NOTE_TYPE_NAME).optional(),
  kind: z.enum(["STANDARD", "CLOZE"]).optional(),
  css: z.string().max(LENGTH_MAX_CSS).optional(),
  fields: z.array(schemaNoteTypeFieldAction).min(1).optional(),
  templates: z.array(schemaNoteTypeTemplateAction).min(1).optional(),
});
export type ActionInputUpdateNoteType = z.infer<typeof schemaActionInputUpdateNoteType>;
export const validateActionInputUpdateNoteType = generateValidator(schemaActionInputUpdateNoteType);

export const schemaActionInputGetNoteTypeById = z.object({
  id: z.number().int().positive(),
});
export type ActionInputGetNoteTypeById = z.infer<typeof schemaActionInputGetNoteTypeById>;
export const validateActionInputGetNoteTypeById = generateValidator(schemaActionInputGetNoteTypeById);

export const schemaActionInputDeleteNoteType = z.object({
  id: z.number().int().positive(),
});
export type ActionInputDeleteNoteType = z.infer<typeof schemaActionInputDeleteNoteType>;
export const validateActionInputDeleteNoteType = generateValidator(schemaActionInputDeleteNoteType);

export type ActionOutputNoteType = {
  id: number;
  name: string;
  kind: NoteKind;
  css: string;
  fields: NoteTypeField[];
  templates: NoteTypeTemplate[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ActionOutputCreateNoteType = {
  success: boolean;
  message: string;
  data?: { id: number };
};

export type ActionOutputUpdateNoteType = {
  success: boolean;
  message: string;
};

export type ActionOutputGetNoteTypeById = {
  success: boolean;
  message: string;
  data?: ActionOutputNoteType;
};

export type ActionOutputGetNoteTypesByUserId = {
  success: boolean;
  message: string;
  data?: ActionOutputNoteType[];
};

export type ActionOutputDeleteNoteType = {
  success: boolean;
  message: string;
};
