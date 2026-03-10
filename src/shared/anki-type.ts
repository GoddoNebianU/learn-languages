/**
 * Shared types for Anki-compatible data structures
 * Based on Anki's official database schema
 */

import type { CardType, CardQueue, NoteKind, Visibility } from "../../generated/prisma/enums";

// ============================================
// NoteType (Anki: models)
// ============================================

export interface NoteTypeField {
  name: string;
  ord: number;
  sticky: boolean;
  rtl: boolean;
  font: string;
  size: number;
  media: string[];
}

export interface NoteTypeTemplate {
  name: string;
  ord: number;
  qfmt: string;  // Question format (Mustache template)
  afmt: string;  // Answer format (Mustache template)
  bqfmt?: string; // Browser question format
  bafmt?: string; // Browser answer format
  did?: number;   // Deck override
}

export interface TSharedNoteType {
  id: number;
  name: string;
  kind: NoteKind;
  css: string;
  fields: NoteTypeField[];
  templates: NoteTypeTemplate[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Deck (Anki: decks) - replaces Folder
// ============================================

export interface TSharedDeck {
  id: number;
  name: string;
  desc: string;
  userId: string;
  visibility: Visibility;
  collapsed: boolean;
  conf: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  cardCount?: number;
}

// ============================================
// Note (Anki: notes)
// ============================================

export interface TSharedNote {
  id: bigint;
  guid: string;
  noteTypeId: number;
  mod: number;
  usn: number;
  tags: string;  // Space-separated
  flds: string;  // Field values separated by 0x1f
  sfld: string;  // Sort field
  csum: number;  // Checksum of first field
  flags: number;
  data: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Helper to get fields as array
export function getNoteFields(note: TSharedNote): string[] {
  return note.flds.split('\x1f');
}

// Helper to set fields from array
export function setNoteFields(fields: string[]): string {
  return fields.join('\x1f');
}

// Helper to get tags as array
export function getNoteTags(note: TSharedNote): string[] {
  return note.tags.trim().split(' ').filter(Boolean);
}

// Helper to set tags from array
export function setNoteTags(tags: string[]): string {
  return ` ${tags.join(' ')} `;
}

// ============================================
// Card (Anki: cards)
// ============================================

export interface TSharedCard {
  id: bigint;
  noteId: bigint;
  deckId: number;
  ord: number;
  mod: number;
  usn: number;
  type: CardType;
  queue: CardQueue;
  due: number;
  ivl: number;
  factor: number;
  reps: number;
  lapses: number;
  left: number;
  odue: number;
  odid: number;
  flags: number;
  data: string;
  createdAt: Date;
  updatedAt: Date;
}

// Card for review (with note data)
export interface TCardForReview extends TSharedCard {
  note: TSharedNote & {
    noteType: TSharedNoteType;
  };
  deck: TSharedDeck;
}

// ============================================
// Review
// ============================================

export type ReviewEase = 1 | 2 | 3 | 4; // Again, Hard, Good, Easy

export interface TSharedRevlog {
  id: bigint;
  cardId: bigint;
  usn: number;
  ease: number;
  ivl: number;
  lastIvl: number;
  factor: number;
  time: number;  // Review time in ms
  type: number;
}

// ============================================
// Deck Favorites
// ============================================

export interface TSharedDeckFavorite {
  id: number;
  userId: string;
  deckId: number;
  createdAt: Date;
  deck?: TSharedDeck;
}
