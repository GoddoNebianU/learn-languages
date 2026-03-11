"use server";

import { auth } from "@/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { exportApkg, type ExportDeckData } from "@/lib/anki/apkg-exporter";
import { createLogger } from "@/lib/logger";

const log = createLogger("export-action");

export interface ActionOutputExportApkg {
  success: boolean;
  message: string;
  data?: ArrayBuffer;
  filename?: string;
}

export async function actionExportApkg(deckId: number): Promise<ActionOutputExportApkg> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const deck = await prisma.deck.findFirst({
      where: { id: deckId, userId: session.user.id },
      include: {
        cards: {
          include: {
            note: {
              include: {
                noteType: true,
              },
            },
          },
        },
      },
    });

    if (!deck) {
      return { success: false, message: "Deck not found or access denied" };
    }

    if (deck.cards.length === 0) {
      return { success: false, message: "Deck has no cards to export" };
    }

    const firstCard = deck.cards[0];
    if (!firstCard?.note?.noteType) {
      return { success: false, message: "Deck has invalid card data" };
    }

    const noteType = firstCard.note.noteType;

    const revlogs = await prisma.revlog.findMany({
      where: {
        cardId: { in: deck.cards.map(c => c.id) },
      },
    });

    const exportData: ExportDeckData = {
      deck: {
        id: deck.id,
        name: deck.name,
        desc: deck.desc,
        collapsed: deck.collapsed,
        conf: deck.conf as Record<string, unknown>,
      },
      noteType: {
        id: noteType.id,
        name: noteType.name,
        kind: noteType.kind,
        css: noteType.css,
        fields: (noteType.fields as { name: string; ord: number }[]) ?? [],
        templates: (noteType.templates as { name: string; ord: number; qfmt: string; afmt: string }[]) ?? [],
      },
      notes: deck.cards.map((card) => ({
        id: card.note.id,
        guid: card.note.guid,
        tags: card.note.tags,
        flds: card.note.flds,
        sfld: card.note.sfld,
        csum: card.note.csum,
      })),
      cards: deck.cards.map((card) => ({
        id: card.id,
        noteId: card.noteId,
        ord: card.ord,
        type: card.type,
        queue: card.queue,
        due: card.due,
        ivl: card.ivl,
        factor: card.factor,
        reps: card.reps,
        lapses: card.lapses,
        left: card.left,
      })),
      revlogs: revlogs.map((r) => ({
        id: r.id,
        cardId: r.cardId,
        ease: r.ease,
        ivl: r.ivl,
        lastIvl: r.lastIvl,
        factor: r.factor,
        time: r.time,
        type: r.type,
      })),
      media: new Map(),
    };

    const apkgBuffer = await exportApkg(exportData);

    log.info("APKG exported successfully", {
      userId: session.user.id,
      deckId: deck.id,
      cardCount: deck.cards.length,
    });

    const safeDeckName = deck.name.replace(/[^a-zA-Z0-9\u4e00-\u9fff_-]/g, "_");

    return {
      success: true,
      message: "Deck exported successfully",
      data: apkgBuffer.buffer.slice(apkgBuffer.byteOffset, apkgBuffer.byteOffset + apkgBuffer.byteLength) as ArrayBuffer,
      filename: `${safeDeckName}.apkg`,
    };
  } catch (error) {
    log.error("Failed to export APKG", { error, deckId });
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to export deck",
    };
  }
}
