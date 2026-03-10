import { NoteKind } from "../../../generated/prisma/enums";
import { NoteTypeField, NoteTypeTemplate } from "./note-type-repository-dto";

export type ServiceInputCreateNoteType = {
  name: string;
  kind?: NoteKind;
  css?: string;
  fields: NoteTypeField[];
  templates: NoteTypeTemplate[];
  userId: string;
};

export type ServiceInputUpdateNoteType = {
  id: number;
  name?: string;
  kind?: NoteKind;
  css?: string;
  fields?: NoteTypeField[];
  templates?: NoteTypeTemplate[];
  userId: string;
};

export type ServiceInputGetNoteTypeById = {
  id: number;
};

export type ServiceInputGetNoteTypesByUserId = {
  userId: string;
};

export type ServiceInputDeleteNoteType = {
  id: number;
  userId: string;
};

export type ServiceInputValidateFields = {
  fields: NoteTypeField[];
};

export type ServiceInputValidateTemplates = {
  templates: NoteTypeTemplate[];
  fields: NoteTypeField[];
};

export type ServiceOutputNoteType = {
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

export type ServiceOutputValidation = {
  success: boolean;
  errors: string[];
};
