// Repository layer DTOs for Note module
// Follows Anki-compatible note structure with BigInt IDs

export interface RepoInputCreateNote {
  noteTypeId: number;
  fields: string[];
  tags?: string[];
  userId: string;
}

export interface RepoInputUpdateNote {
  id: bigint;
  fields?: string[];
  tags?: string[];
}

export interface RepoInputGetNoteById {
  id: bigint;
}

export interface RepoInputGetNotesByNoteTypeId {
  noteTypeId: number;
  limit?: number;
  offset?: number;
}

export interface RepoInputGetNotesByUserId {
  userId: string;
  limit?: number;
  offset?: number;
}

export interface RepoInputDeleteNote {
  id: bigint;
}

export interface RepoInputCheckNoteOwnership {
  noteId: bigint;
  userId: string;
}

export type RepoOutputNote = {
  id: bigint;
  guid: string;
  noteTypeId: number;
  mod: number;
  usn: number;
  tags: string;
  flds: string;
  sfld: string;
  csum: number;
  flags: number;
  data: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type RepoOutputNoteWithFields = Omit<RepoOutputNote, "flds" | "tags"> & {
  fields: string[];
  tagsArray: string[];
};

export type RepoOutputNoteOwnership = {
  userId: string;
};

// Helper function types
export type RepoHelperGenerateGuid = () => string;
export type RepoHelperCalculateCsum = (text: string) => number;
export type RepoHelperJoinFields = (fields: string[]) => string;
export type RepoHelperSplitFields = (flds: string) => string[];
