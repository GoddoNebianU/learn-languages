/**
 * Anki APKG format types
 * Based on Anki's official database schema
 */

// ============================================
// APKG JSON Configuration Types
// ============================================

export interface AnkiField {
  id: number;
  name: string;
  ord: number;
  sticky: boolean;
  rtl: boolean;
  font: string;
  size: number;
  media: string[];
  description?: string;
  plainText?: boolean;
  collapsed?: boolean;
  excludeFromSearch?: boolean;
  tag?: number;
  preventDeletion?: boolean;
}

export interface AnkiTemplate {
  id: number | null;
  name: string;
  ord: number;
  qfmt: string;
  afmt: string;
  bqfmt?: string;
  bafmt?: string;
  did?: number | null;
  bfont?: string;
  bsize?: number;
}

export interface AnkiNoteType {
  id: number;
  name: string;
  type: 0 | 1; // 0=standard, 1=cloze
  mod: number;
  usn: number;
  sortf: number;
  did: number | null;
  tmpls: AnkiTemplate[];
  flds: AnkiField[];
  css: string;
  latexPre: string;
  latexPost: string;
  latexsvg: boolean | null;
  req: [number, string, number[]][];
  originalStockKind?: number;
}

export interface AnkiDeckConfig {
  id: number;
  mod: number;
  name: string;
  usn: number;
  maxTaken: number;
  autoplay: boolean;
  timer: 0 | 1;
  replayq: boolean;
  new: {
    bury: boolean;
    delays: number[];
    initialFactor: number;
    ints: [number, number, number];
    order: number;
    perDay: number;
  };
  rev: {
    bury: boolean;
    ease4: number;
    ivlFct: number;
    maxIvl: number;
    perDay: number;
    hardFactor: number;
  };
  lapse: {
    delays: number[];
    leechAction: 0 | 1;
    leechFails: number;
    minInt: number;
    mult: number;
  };
  dyn: boolean;
}

export interface AnkiDeck {
  id: number;
  mod: number;
  name: string;
  usn: number;
  lrnToday: [number, number];
  revToday: [number, number];
  newToday: [number, number];
  timeToday: [number, number];
  collapsed: boolean;
  browserCollapsed: boolean;
  desc: string;
  dyn: 0 | 1;
  conf: number;
  extendNew: number;
  extendRev: number;
  reviewLimit?: number | null;
  newLimit?: number | null;
  reviewLimitToday?: number | null;
  newLimitToday?: number | null;
  md?: boolean;
}

// ============================================
// APKG Database Row Types
// ============================================

export interface AnkiNoteRow {
  id: number;
  guid: string;
  mid: number;
  mod: number;
  usn: number;
  tags: string;
  flds: string;
  sfld: string;
  csum: number;
  flags: number;
  data: string;
}

export interface AnkiCardRow {
  id: number;
  nid: number;
  did: number;
  ord: number;
  mod: number;
  usn: number;
  type: number; // 0=new, 1=learning, 2=review, 3=relearning
  queue: number; // -3=buried(user), -2=buried(sched), -1=suspended, 0=new, 1=learning, 2=review, 3=day learning, 4=preview
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
}

export interface AnkiRevlogRow {
  id: number;
  cid: number;
  usn: number;
  ease: number;
  ivl: number;
  lastIvl: number;
  factor: number;
  time: number;
  type: number;
}

// ============================================
// Parsed APKG Types
// ============================================

export interface ParsedApkg {
  decks: Map<number, AnkiDeck>;
  noteTypes: Map<number, AnkiNoteType>;
  deckConfigs: Map<number, AnkiDeckConfig>;
  notes: AnkiNoteRow[];
  cards: AnkiCardRow[];
  revlogs: AnkiRevlogRow[];
  media: Map<string, Buffer>;
  collectionMeta: {
    crt: number;
    mod: number;
    ver: number;
  };
}

export interface ApkgImportResult {
  success: boolean;
  deckName: string;
  noteCount: number;
  cardCount: number;
  mediaCount: number;
  errors: string[];
}
