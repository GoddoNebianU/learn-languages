import JSZip from "jszip";
import initSqlJs from "sql.js";
import type { Database } from "sql.js";
import type { 
  AnkiDeck, 
  AnkiNoteType, 
  AnkiDeckConfig, 
  AnkiNoteRow, 
  AnkiCardRow,
  AnkiRevlogRow,
} from "./types";

const FIELD_SEPARATOR = "\x1f";
const BASE91_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&()*+,-./:;<=>?@[]^_`{|}~";

function generateGuid(): string {
  let result = "";
  const id = Date.now() ^ (Math.random() * 0xffffffff);
  let num = BigInt(id);
  
  for (let i = 0; i < 10; i++) {
    result = BASE91_CHARS[Number(num % 91n)] + result;
    num = num / 91n;
  }
  
  return result;
}

function checksum(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash) % 100000000;
}

function createCollectionSql(): string {
  return `
    CREATE TABLE col (
      id INTEGER PRIMARY KEY,
      crt INTEGER NOT NULL,
      mod INTEGER NOT NULL,
      scm INTEGER NOT NULL,
      ver INTEGER NOT NULL DEFAULT 11,
      dty INTEGER NOT NULL DEFAULT 0,
      usn INTEGER NOT NULL DEFAULT 0,
      ls INTEGER NOT NULL DEFAULT 0,
      conf TEXT NOT NULL,
      models TEXT NOT NULL,
      decks TEXT NOT NULL,
      dconf TEXT NOT NULL,
      tags TEXT NOT NULL
    );

    CREATE TABLE notes (
      id INTEGER PRIMARY KEY,
      guid TEXT NOT NULL,
      mid INTEGER NOT NULL,
      mod INTEGER NOT NULL,
      usn INTEGER NOT NULL,
      tags TEXT NOT NULL,
      flds TEXT NOT NULL,
      sfld TEXT NOT NULL,
      csum INTEGER NOT NULL,
      flags INTEGER NOT NULL DEFAULT 0,
      data TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE cards (
      id INTEGER PRIMARY KEY,
      nid INTEGER NOT NULL,
      did INTEGER NOT NULL,
      ord INTEGER NOT NULL,
      mod INTEGER NOT NULL,
      usn INTEGER NOT NULL,
      type INTEGER NOT NULL,
      queue INTEGER NOT NULL,
      due INTEGER NOT NULL,
      ivl INTEGER NOT NULL,
      factor INTEGER NOT NULL,
      reps INTEGER NOT NULL,
      lapses INTEGER NOT NULL,
      left INTEGER NOT NULL,
      odue INTEGER NOT NULL DEFAULT 0,
      odid INTEGER NOT NULL DEFAULT 0,
      flags INTEGER NOT NULL DEFAULT 0,
      data TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE revlog (
      id INTEGER PRIMARY KEY,
      cid INTEGER NOT NULL,
      usn INTEGER NOT NULL,
      ease INTEGER NOT NULL,
      ivl INTEGER NOT NULL,
      lastIvl INTEGER NOT NULL,
      factor INTEGER NOT NULL,
      time INTEGER NOT NULL,
      type INTEGER NOT NULL
    );

    CREATE TABLE graves (
      usn INTEGER NOT NULL,
      oid INTEGER NOT NULL,
      type INTEGER NOT NULL
    );

    CREATE INDEX ix_cards_nid ON cards (nid);
    CREATE INDEX ix_cards_sched ON cards (did, queue, due);
    CREATE INDEX ix_cards_usn ON cards (usn);
    CREATE INDEX ix_notes_csum ON notes (csum);
    CREATE INDEX ix_notes_usn ON notes (usn);
    CREATE INDEX ix_revlog_cid ON revlog (cid);
    CREATE INDEX ix_revlog_usn ON revlog (usn);
  `;
}

function mapCardType(type: string): number {
  switch (type) {
    case "NEW": return 0;
    case "LEARNING": return 1;
    case "REVIEW": return 2;
    case "RELEARNING": return 3;
    default: return 0;
  }
}

function mapCardQueue(queue: string): number {
  switch (queue) {
    case "USER_BURIED": return -3;
    case "SCHED_BURIED": return -2;
    case "SUSPENDED": return -1;
    case "NEW": return 0;
    case "LEARNING": return 1;
    case "REVIEW": return 2;
    case "IN_LEARNING": return 3;
    case "PREVIEW": return 4;
    default: return 0;
  }
}

export interface ExportDeckData {
  deck: {
    id: number;
    name: string;
    desc: string;
    collapsed: boolean;
    conf: Record<string, unknown>;
  };
  noteType: {
    id: number;
    name: string;
    kind: "STANDARD" | "CLOZE";
    css: string;
    fields: { name: string; ord: number }[];
    templates: { name: string; ord: number; qfmt: string; afmt: string }[];
  };
  notes: {
    id: bigint;
    guid: string;
    tags: string;
    flds: string;
    sfld: string;
    csum: number;
  }[];
  cards: {
    id: bigint;
    noteId: bigint;
    ord: number;
    type: string;
    queue: string;
    due: number;
    ivl: number;
    factor: number;
    reps: number;
    lapses: number;
    left: number;
  }[];
  revlogs: {
    id: bigint;
    cardId: bigint;
    ease: number;
    ivl: number;
    lastIvl: number;
    factor: number;
    time: number;
    type: number;
  }[];
  media: Map<string, Buffer>;
}

async function createDatabase(data: ExportDeckData): Promise<Uint8Array> {
  const SQL = await initSqlJs({
    locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
  });
  
  const db = new SQL.Database();
  
  db.run(createCollectionSql());
  
  const now = Date.now();
  const nowSeconds = Math.floor(now / 1000);
  
  const defaultConfig = {
    dueCounts: true,
    estTimes: true,
    newSpread: 0,
    curDeck: data.deck.id,
    curModel: data.noteType.id,
  };
  
  const deckJson: Record<string, AnkiDeck> = {
    [data.deck.id.toString()]: {
      id: data.deck.id,
      mod: nowSeconds,
      name: data.deck.name,
      usn: -1,
      lrnToday: [0, 0],
      revToday: [0, 0],
      newToday: [0, 0],
      timeToday: [0, 0],
      collapsed: data.deck.collapsed,
      browserCollapsed: false,
      desc: data.deck.desc,
      dyn: 0,
      conf: 1,
      extendNew: 0,
      extendRev: 0,
    },
    "1": {
      id: 1,
      mod: nowSeconds,
      name: "Default",
      usn: -1,
      lrnToday: [0, 0],
      revToday: [0, 0],
      newToday: [0, 0],
      timeToday: [0, 0],
      collapsed: false,
      browserCollapsed: false,
      desc: "",
      dyn: 0,
      conf: 1,
      extendNew: 0,
      extendRev: 0,
    },
  };
  
  const noteTypeJson: Record<string, AnkiNoteType> = {
    [data.noteType.id.toString()]: {
      id: data.noteType.id,
      name: data.noteType.name,
      type: data.noteType.kind === "CLOZE" ? 1 : 0,
      mod: nowSeconds,
      usn: -1,
      sortf: 0,
      did: data.deck.id,
      flds: data.noteType.fields.map((f, i) => ({
        id: now + i,
        name: f.name,
        ord: f.ord,
        sticky: false,
        rtl: false,
        font: "Arial",
        size: 20,
        media: [],
      })),
      tmpls: data.noteType.templates.map((t, i) => ({
        id: now + i + 100,
        name: t.name,
        ord: t.ord,
        qfmt: t.qfmt,
        afmt: t.afmt,
        did: null,
      })),
      css: data.noteType.css,
      latexPre: "\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n",
      latexPost: "\\end{document}",
      latexsvg: false,
      req: [],
    },
  };
  
  const deckConfigJson: Record<string, AnkiDeckConfig> = {
    "1": {
      id: 1,
      mod: nowSeconds,
      name: "Default",
      usn: -1,
      maxTaken: 60,
      autoplay: true,
      timer: 0,
      replayq: true,
      new: {
        bury: true,
        delays: [1, 10],
        initialFactor: 2500,
        ints: [1, 4, 7],
        order: 1,
        perDay: 20,
      },
      rev: {
        bury: true,
        ease4: 1.3,
        ivlFct: 1,
        maxIvl: 36500,
        perDay: 200,
        hardFactor: 1.2,
      },
      lapse: {
        delays: [10],
        leechAction: 0,
        leechFails: 8,
        minInt: 1,
        mult: 0,
      },
      dyn: false,
    },
  };
  
  db.run(
    `INSERT INTO col (id, crt, mod, scm, ver, dty, usn, ls, conf, models, decks, dconf, tags)
     VALUES (1, ?, ?, ?, 11, 0, 0, 0, ?, ?, ?, ?, '{}')`,
    [
      nowSeconds,
      now,
      now,
      JSON.stringify(defaultConfig),
      JSON.stringify(noteTypeJson),
      JSON.stringify(deckJson),
      JSON.stringify(deckConfigJson),
    ]
  );
  
  for (const note of data.notes) {
    db.run(
      `INSERT INTO notes (id, guid, mid, mod, usn, tags, flds, sfld, csum, flags, data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, '')`,
      [
        Number(note.id),
        note.guid || generateGuid(),
        data.noteType.id,
        nowSeconds,
        -1,
        note.tags || " ",
        note.flds,
        note.sfld,
        note.csum || checksum(note.sfld),
      ]
    );
  }
  
  for (const card of data.cards) {
    db.run(
      `INSERT INTO cards (id, nid, did, ord, mod, usn, type, queue, due, ivl, factor, reps, lapses, left, odue, odid, flags, data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, '')`,
      [
        Number(card.id),
        Number(card.noteId),
        data.deck.id,
        card.ord,
        nowSeconds,
        -1,
        mapCardType(card.type),
        mapCardQueue(card.queue),
        card.due,
        card.ivl,
        card.factor,
        card.reps,
        card.lapses,
        card.left,
      ]
    );
  }
  
  for (const revlog of data.revlogs) {
    db.run(
      `INSERT INTO revlog (id, cid, usn, ease, ivl, lastIvl, factor, time, type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(revlog.id),
        Number(revlog.cardId),
        -1,
        revlog.ease,
        revlog.ivl,
        revlog.lastIvl,
        revlog.factor,
        revlog.time,
        revlog.type,
      ]
    );
  }
  
  const dbData = db.export();
  db.close();
  
  return dbData;
}

export async function exportApkg(data: ExportDeckData): Promise<Buffer> {
  const zip = new JSZip();
  
  const dbData = await createDatabase(data);
  zip.file("collection.anki21", dbData);
  
  const mediaMapping: Record<string, string> = {};
  const mediaEntries = Array.from(data.media.entries());
  
  mediaEntries.forEach(([filename, buffer], index) => {
    mediaMapping[index.toString()] = filename;
    zip.file(index.toString(), buffer);
  });
  
  zip.file("media", JSON.stringify(mediaMapping));
  
  return zip.generateAsync({ type: "nodebuffer" });
}
