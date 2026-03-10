export type ServiceInputCreateNote = {
  noteTypeId: number;
  fields: string[];
  tags?: string[];
  userId: string;
};

export type ServiceInputUpdateNote = {
  noteId: bigint;
  fields?: string[];
  tags?: string[];
  userId: string;
};

export type ServiceInputDeleteNote = {
  noteId: bigint;
  userId: string;
};

export type ServiceInputGetNoteById = {
  noteId: bigint;
};

export type ServiceInputGetNotesByNoteTypeId = {
  noteTypeId: number;
  limit?: number;
  offset?: number;
};

export type ServiceInputGetNotesByUserId = {
  userId: string;
  limit?: number;
  offset?: number;
};

export type ServiceOutputNote = {
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
};

export type ServiceOutputCreateNote = {
  id: bigint;
  guid: string;
};

export type ServiceOutputNoteCount = {
  count: number;
};
