import { NoteKind } from "../../../generated/prisma/enums";

// ============================================
// Field Schema (Anki flds structure)
// ============================================

export interface NoteTypeField {
  name: string;
  ord: number;
  sticky: boolean;
  rtl: boolean;
  font?: string;
  size?: number;
  media?: string[];
}

export const schemaNoteTypeField = {
  name: { minLength: 1, maxLength: 50 },
  font: { maxLength: 100 },
  size: { min: 8, max: 72 },
};

// ============================================
// Template Schema (Anki tmpls structure)
// ============================================

export interface NoteTypeTemplate {
  name: string;
  ord: number;
  qfmt: string;
  afmt: string;
  bqfmt?: string;
  bafmt?: string;
  did?: number;
}

export const schemaNoteTypeTemplate = {
  name: { minLength: 1, maxLength: 100 },
  qfmt: { maxLength: 10000 },
  afmt: { maxLength: 10000 },
  bqfmt: { maxLength: 10000 },
  bafmt: { maxLength: 10000 },
};

// ============================================
// Repository Input Types
// ============================================

export interface RepoInputCreateNoteType {
  name: string;
  kind?: NoteKind;
  css?: string;
  fields: NoteTypeField[];
  templates: NoteTypeTemplate[];
  userId: string;
}

export interface RepoInputUpdateNoteType {
  id: number;
  name?: string;
  kind?: NoteKind;
  css?: string;
  fields?: NoteTypeField[];
  templates?: NoteTypeTemplate[];
}

export interface RepoInputGetNoteTypeById {
  id: number;
}

export interface RepoInputGetNoteTypesByUserId {
  userId: string;
}

export interface RepoInputDeleteNoteType {
  id: number;
}

export interface RepoInputCheckNotesExist {
  noteTypeId: number;
}

// ============================================
// Repository Output Types
// ============================================

export type RepoOutputNoteType = {
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

export type RepoOutputNoteTypeOwnership = {
  userId: string;
};

export type RepoOutputNotesExistCheck = {
  exists: boolean;
  count: number;
};

// ============================================
// Default Note Types
// ============================================

export const DEFAULT_BASIC_NOTE_TYPE_FIELDS: NoteTypeField[] = [
  { name: "Word", ord: 0, sticky: false, rtl: false, font: "Arial", size: 20 },
  { name: "Definition", ord: 1, sticky: false, rtl: false, font: "Arial", size: 20 },
  { name: "IPA", ord: 2, sticky: false, rtl: false, font: "Arial", size: 20 },
  { name: "Example", ord: 3, sticky: false, rtl: false, font: "Arial", size: 20 },
];

export const DEFAULT_BASIC_NOTE_TYPE_TEMPLATES: NoteTypeTemplate[] = [
  {
    name: "Word → Definition",
    ord: 0,
    qfmt: "{{Word}}<br>{{IPA}}",
    afmt: "{{FrontSide}}<hr id=answer>{{Definition}}<br><br>{{Example}}",
  },
  {
    name: "Definition → Word",
    ord: 1,
    qfmt: "{{Definition}}",
    afmt: "{{FrontSide}}<hr id=answer>{{Word}}<br>{{IPA}}",
  },
];

export const DEFAULT_BASIC_NOTE_TYPE_CSS = `.card {
  font-family: Arial, sans-serif;
  font-size: 20px;
  text-align: center;
  color: #333;
  background-color: #fff;
}

.card1 {
  background-color: #e8f4f8;
}

.card2 {
  background-color: #f8f4e8;
}

hr {
  border: none;
  border-top: 1px solid #ccc;
  margin: 20px 0;
}`;

export const DEFAULT_CLOZE_NOTE_TYPE_FIELDS: NoteTypeField[] = [
  { name: "Text", ord: 0, sticky: false, rtl: false, font: "Arial", size: 20 },
  { name: "Extra", ord: 1, sticky: false, rtl: false, font: "Arial", size: 20 },
];

export const DEFAULT_CLOZE_NOTE_TYPE_TEMPLATES: NoteTypeTemplate[] = [
  {
    name: "Cloze",
    ord: 0,
    qfmt: "{{cloze:Text}}",
    afmt: "{{cloze:Text}}<br><br>{{Extra}}",
  },
];

export const DEFAULT_CLOZE_NOTE_TYPE_CSS = `.card {
  font-family: Arial, sans-serif;
  font-size: 20px;
  text-align: center;
  color: #333;
  background-color: #fff;
}

.cloze {
  font-weight: bold;
  color: #0066cc;
}`;
