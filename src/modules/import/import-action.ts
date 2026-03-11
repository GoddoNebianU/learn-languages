"use server";

import { auth } from "@/auth";
import { headers } from "next/headers";
import { validate } from "@/utils/validate";
import { z } from "zod";
import { parseApkg, getDeckNames, getDeckNotesAndCards } from "@/lib/anki/apkg-parser";
import { prisma } from "@/lib/db";
import { CardType, CardQueue, NoteKind } from "../../../generated/prisma/enums";
import { createLogger } from "@/lib/logger";
import type { ParsedApkg } from "@/lib/anki/types";

const log = createLogger("import-action");

const schemaImportApkg = z.object({
  deckName: z.string().min(1).optional(),
});

export type ActionInputImportApkg = z.infer<typeof schemaImportApkg>;

export interface ActionOutputImportApkg {
  success: boolean;
  message: string;
  deckId?: number;
  noteCount?: number;
  cardCount?: number;
}

export interface ActionOutputPreviewApkg {
  success: boolean;
  message: string;
  decks?: { id: number; name: string; cardCount: number }[];
}

async function importNoteType(
  parsed: ParsedApkg,
  ankiNoteTypeId: number,
  userId: string
): Promise<number> {
  const ankiNoteType = parsed.noteTypes.get(ankiNoteTypeId);
  if (!ankiNoteType) {
    throw new Error(`Note type ${ankiNoteTypeId} not found in APKG`);
  }

  const existing = await prisma.noteType.findFirst({
    where: { name: ankiNoteType.name, userId },
  });

  if (existing) {
    return existing.id;
  }

  const fields = ankiNoteType.flds.map((f) => ({
    name: f.name,
    ord: f.ord,
    sticky: f.sticky,
    rtl: f.rtl,
    font: f.font,
    size: f.size,
    media: f.media,
  }));

  const templates = ankiNoteType.tmpls.map((t) => ({
    name: t.name,
    ord: t.ord,
    qfmt: t.qfmt,
    afmt: t.afmt,
    bqfmt: t.bqfmt,
    bafmt: t.bafmt,
    did: t.did,
  }));

  const noteType = await prisma.noteType.create({
    data: {
      name: ankiNoteType.name,
      kind: ankiNoteType.type === 1 ? NoteKind.CLOZE : NoteKind.STANDARD,
      css: ankiNoteType.css,
      fields: fields as unknown as object,
      templates: templates as unknown as object,
      userId,
    },
  });

  return noteType.id;
}

function mapAnkiCardType(type: number): CardType {
  switch (type) {
    case 0: return CardType.NEW;
    case 1: return CardType.LEARNING;
    case 2: return CardType.REVIEW;
    case 3: return CardType.RELEARNING;
    default: return CardType.NEW;
  }
}

function mapAnkiCardQueue(queue: number): CardQueue {
  switch (queue) {
    case -3: return CardQueue.USER_BURIED;
    case -2: return CardQueue.SCHED_BURIED;
    case -1: return CardQueue.SUSPENDED;
    case 0: return CardQueue.NEW;
    case 1: return CardQueue.LEARNING;
    case 2: return CardQueue.REVIEW;
    case 3: return CardQueue.IN_LEARNING;
    case 4: return CardQueue.PREVIEW;
    default: return CardQueue.NEW;
  }
}

async function importDeck(
  parsed: ParsedApkg,
  deckId: number,
  userId: string,
  deckNameOverride?: string
): Promise<{ deckId: number; noteCount: number; cardCount: number }> {
  const ankiDeck = parsed.decks.get(deckId);
  if (!ankiDeck) {
    throw new Error(`Deck ${deckId} not found in APKG`);
  }

  const deck = await prisma.deck.create({
    data: {
      name: deckNameOverride || ankiDeck.name,
      desc: ankiDeck.desc || "",
      visibility: "PRIVATE",
      collapsed: ankiDeck.collapsed,
      conf: JSON.parse(JSON.stringify(ankiDeck)),
      userId,
    },
  });

  const { notes: ankiNotes, cards: ankiCards } = getDeckNotesAndCards(parsed, deckId);

  if (ankiNotes.length === 0) {
    return { deckId: deck.id, noteCount: 0, cardCount: 0 };
  }

  const noteTypeIdMap = new Map<number, number>();
  const firstNote = ankiNotes[0];
  if (firstNote) {
    const importedNoteTypeId = await importNoteType(parsed, firstNote.mid, userId);
    noteTypeIdMap.set(firstNote.mid, importedNoteTypeId);
  }

  const noteIdMap = new Map<number, bigint>();

  for (const ankiNote of ankiNotes) {
    let noteTypeId = noteTypeIdMap.get(ankiNote.mid);
    if (!noteTypeId) {
      noteTypeId = await importNoteType(parsed, ankiNote.mid, userId);
      noteTypeIdMap.set(ankiNote.mid, noteTypeId);
    }

    const noteId = BigInt(Date.now() + Math.floor(Math.random() * 1000));
    noteIdMap.set(ankiNote.id, noteId);

    await prisma.note.create({
      data: {
        id: noteId,
        guid: ankiNote.guid,
        noteTypeId,
        mod: ankiNote.mod,
        usn: ankiNote.usn,
        tags: ankiNote.tags,
        flds: ankiNote.flds,
        sfld: ankiNote.sfld,
        csum: ankiNote.csum,
        flags: ankiNote.flags,
        data: ankiNote.data,
        userId,
      },
    });
  }

  for (const ankiCard of ankiCards) {
    const noteId = noteIdMap.get(ankiCard.nid);
    if (!noteId) {
      log.warn("Card references non-existent note", { cardId: ankiCard.id, noteId: ankiCard.nid });
      continue;
    }

    await prisma.card.create({
      data: {
        id: BigInt(ankiCard.id),
        noteId,
        deckId: deck.id,
        ord: ankiCard.ord,
        mod: ankiCard.mod,
        usn: ankiCard.usn,
        type: mapAnkiCardType(ankiCard.type),
        queue: mapAnkiCardQueue(ankiCard.queue),
        due: ankiCard.due,
        ivl: ankiCard.ivl,
        factor: ankiCard.factor,
        reps: ankiCard.reps,
        lapses: ankiCard.lapses,
        left: ankiCard.left,
        odue: ankiCard.odue,
        odid: ankiCard.odid,
        flags: ankiCard.flags,
        data: ankiCard.data,
      },
    });
  }

  return { deckId: deck.id, noteCount: ankiNotes.length, cardCount: ankiCards.length };
}

export async function actionPreviewApkg(formData: FormData): Promise<ActionOutputPreviewApkg> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return { success: false, message: "No file provided" };
  }

  if (!file.name.endsWith(".apkg")) {
    return { success: false, message: "Invalid file type. Please upload an .apkg file" };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await parseApkg(buffer);
    const decks = getDeckNames(parsed);

    return { 
      success: true, 
      message: "APKG parsed successfully", 
      decks: decks.filter(d => d.cardCount > 0)
    };
  } catch (error) {
    log.error("Failed to parse APKG", { error });
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to parse APKG file" 
    };
  }
}

export async function actionImportApkg(
  formData: FormData
): Promise<ActionOutputImportApkg> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  const file = formData.get("file") as File | null;
  const deckIdStr = formData.get("deckId") as string | null;
  const deckName = formData.get("deckName") as string | null;

  if (!file) {
    return { success: false, message: "No file provided" };
  }

  if (!deckIdStr) {
    return { success: false, message: "No deck selected" };
  }

  const deckId = parseInt(deckIdStr, 10);
  if (isNaN(deckId)) {
    return { success: false, message: "Invalid deck ID" };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await parseApkg(buffer);
    
    const result = await importDeck(parsed, deckId, session.user.id, deckName || undefined);

    log.info("APKG imported successfully", { 
      userId: session.user.id, 
      deckId: result.deckId,
      noteCount: result.noteCount,
      cardCount: result.cardCount
    });

    return {
      success: true,
      message: `Imported ${result.cardCount} cards from ${result.noteCount} notes`,
      deckId: result.deckId,
      noteCount: result.noteCount,
      cardCount: result.cardCount,
    };
  } catch (error) {
    log.error("Failed to import APKG", { error });
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to import APKG file" 
    };
  }
}
