import JSZip from "jszip";
import initSqlJs from "sql.js";
import type { Database, SqlValue } from "sql.js";
import {
  type AnkiDeck,
  type AnkiNoteType,
  type AnkiDeckConfig,
  type AnkiNoteRow,
  type AnkiCardRow,
  type AnkiRevlogRow,
  type ParsedApkg,
} from "./types";

async function openDatabase(zip: JSZip): Promise<Database | null> {
  const SQL = await initSqlJs({
    locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
  });
  
  const anki21b = zip.file("collection.anki21b");
  const anki21 = zip.file("collection.anki21");
  const anki2 = zip.file("collection.anki2");
  
  const dbFile = anki21b || anki21 || anki2;
  if (!dbFile) return null;
  
  const dbData = await dbFile.async("uint8array");
  return new SQL.Database(dbData);
}

function parseJsonField<T>(jsonStr: string): T {
  try {
    return JSON.parse(jsonStr);
  } catch {
    return {} as T;
  }
}

function queryAll<T>(db: Database, sql: string, params: SqlValue[] = []): T[] {
  const stmt = db.prepare(sql);
  try {
    stmt.bind(params);
    const results: T[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as T);
    }
    return results;
  } finally {
    stmt.free();
  }
}

function queryOne<T>(db: Database, sql: string, params: SqlValue[] = []): T | null {
  const results = queryAll<T>(db, sql, params);
  return results[0] ?? null;
}

export async function parseApkg(buffer: Buffer): Promise<ParsedApkg> {
  const zip = await JSZip.loadAsync(buffer);
  const db = await openDatabase(zip);
  
  if (!db) {
    throw new Error("No valid Anki database found in APKG file");
  }
  
  try {
    const col = queryOne<{ 
      crt: number; 
      mod: number; 
      ver: number;
      conf: string;
      models: string;
      decks: string;
      dconf: string;
      tags: string;
    }>(db, "SELECT crt, mod, ver, conf, models, decks, dconf, tags FROM col WHERE id = 1");
    
    if (!col) {
      throw new Error("Invalid APKG: no collection row found");
    }
    
    const decksMap = new Map<number, AnkiDeck>();
    const decksJson = parseJsonField<Record<string, AnkiDeck>>(col.decks);
    for (const [id, deck] of Object.entries(decksJson)) {
      decksMap.set(parseInt(id, 10), deck);
    }
    
    const noteTypesMap = new Map<number, AnkiNoteType>();
    const modelsJson = parseJsonField<Record<string, AnkiNoteType>>(col.models);
    for (const [id, model] of Object.entries(modelsJson)) {
      noteTypesMap.set(parseInt(id, 10), model);
    }
    
    const deckConfigsMap = new Map<number, AnkiDeckConfig>();
    const dconfJson = parseJsonField<Record<string, AnkiDeckConfig>>(col.dconf);
    for (const [id, config] of Object.entries(dconfJson)) {
      deckConfigsMap.set(parseInt(id, 10), config);
    }
    
    const notes = queryAll<AnkiNoteRow>(
      db, 
      "SELECT id, guid, mid, mod, usn, tags, flds, sfld, csum, flags, data FROM notes"
    );
    
    const cards = queryAll<AnkiCardRow>(
      db,
      "SELECT id, nid, did, ord, mod, usn, type, queue, due, ivl, factor, reps, lapses, left, odue, odid, flags, data FROM cards"
    );
    
    const revlogs = queryAll<AnkiRevlogRow>(
      db,
      "SELECT id, cid, usn, ease, ivl, lastIvl, factor, time, type FROM revlog"
    );
    
    const mediaMap = new Map<string, Buffer>();
    const mediaFile = zip.file("media");
    if (mediaFile) {
      const mediaJson = parseJsonField<Record<string, string>>(await mediaFile.async("text"));
      for (const [num, filename] of Object.entries(mediaJson)) {
        const mediaData = zip.file(num);
        if (mediaData) {
          const data = await mediaData.async("nodebuffer");
          mediaMap.set(filename, data);
        }
      }
    }
    
    return {
      decks: decksMap,
      noteTypes: noteTypesMap,
      deckConfigs: deckConfigsMap,
      notes,
      cards,
      revlogs,
      media: mediaMap,
      collectionMeta: {
        crt: col.crt,
        mod: col.mod,
        ver: col.ver,
      },
    };
  } finally {
    db.close();
  }
}

export function getDeckNotesAndCards(
  parsed: ParsedApkg,
  deckId: number
): { notes: AnkiNoteRow[]; cards: AnkiCardRow[] } {
  const deckCards = parsed.cards.filter(c => c.did === deckId);
  const noteIds = new Set(deckCards.map(c => c.nid));
  const deckNotes = parsed.notes.filter(n => noteIds.has(n.id));
  
  return { notes: deckNotes, cards: deckCards };
}

export function getDeckNames(parsed: ParsedApkg): { id: number; name: string; cardCount: number }[] {
  const cardCounts = new Map<number, number>();
  for (const card of parsed.cards) {
    cardCounts.set(card.did, (cardCounts.get(card.did) ?? 0) + 1);
  }
  
  const result: { id: number; name: string; cardCount: number }[] = [];
  for (const [id, deck] of parsed.decks) {
    if (deck.dyn === 0) {
      result.push({
        id,
        name: deck.name,
        cardCount: cardCounts.get(id) ?? 0,
      });
    }
  }
  
  return result.sort((a, b) => a.name.localeCompare(b.name));
}
