import { prisma } from "@/lib/db";
import { createLogger } from "@/lib/logger";
import {
  RepoInputCreateCard,
  RepoInputUpdateCard,
  RepoInputGetCardsByDeckId,
  RepoInputGetCardsForReview,
  RepoInputGetNewCards,
  RepoInputBulkUpdateCards,
  RepoInputResetDeckCards,
  RepoOutputCard,
  RepoOutputCardWithNote,
  RepoOutputCardStats,
  RepoOutputResetDeckCards,
} from "./card-repository-dto";
import { CardType, CardQueue } from "../../../generated/prisma/enums";

const log = createLogger("card-repository");

export async function repoCreateCard(
  input: RepoInputCreateCard,
): Promise<bigint> {
  log.debug("Creating card", { noteId: input.noteId.toString(), deckId: input.deckId });
  const card = await prisma.card.create({
    data: {
      id: input.id,
      noteId: input.noteId,
      deckId: input.deckId,
      ord: input.ord,
      due: input.due,
      mod: Math.floor(Date.now() / 1000),
      type: input.type ?? CardType.NEW,
      queue: input.queue ?? CardQueue.NEW,
      ivl: input.ivl ?? 0,
      factor: input.factor ?? 2500,
      reps: input.reps ?? 0,
      lapses: input.lapses ?? 0,
      left: input.left ?? 0,
      odue: input.odue ?? 0,
      odid: input.odid ?? 0,
      flags: input.flags ?? 0,
      data: input.data ?? "",
    },
  });
  log.info("Card created", { cardId: card.id.toString() });
  return card.id;
}

export async function repoUpdateCard(
  id: bigint,
  input: RepoInputUpdateCard,
): Promise<void> {
  log.debug("Updating card", { cardId: id.toString() });
  await prisma.card.update({
    where: { id },
    data: {
      ...input,
      updatedAt: new Date(),
    },
  });
  log.info("Card updated", { cardId: id.toString() });
}

export async function repoGetCardById(id: bigint): Promise<RepoOutputCard | null> {
  const card = await prisma.card.findUnique({
    where: { id },
  });
  return card;
}

export async function repoGetCardByIdWithNote(
  id: bigint,
): Promise<RepoOutputCardWithNote | null> {
  const card = await prisma.card.findUnique({
    where: { id },
    include: {
      note: {
        select: {
          id: true,
          flds: true,
          sfld: true,
          tags: true,
        },
      },
    },
  });
  return card;
}

export async function repoGetCardsByDeckId(
  input: RepoInputGetCardsByDeckId,
): Promise<RepoOutputCard[]> {
  const { deckId, limit = 50, offset = 0, queue } = input;

  const queueFilter = queue
    ? Array.isArray(queue)
      ? { in: queue }
      : queue
    : undefined;

  const cards = await prisma.card.findMany({
    where: {
      deckId,
      queue: queueFilter,
    },
    orderBy: { due: "asc" },
    take: limit,
    skip: offset,
  });

  log.debug("Fetched cards by deck", { deckId, count: cards.length });
  return cards;
}

export async function repoGetCardsByDeckIdWithNotes(
  input: RepoInputGetCardsByDeckId,
): Promise<RepoOutputCardWithNote[]> {
  const { deckId, limit = 100, offset = 0, queue } = input;

  const queueFilter = queue
    ? Array.isArray(queue)
      ? { in: queue }
      : queue
    : undefined;

  const cards = await prisma.card.findMany({
    where: {
      deckId,
      queue: queueFilter,
    },
    include: {
      note: {
        select: {
          id: true,
          flds: true,
          sfld: true,
          tags: true,
        },
      },
    },
    orderBy: { id: "asc" },
    take: limit,
    skip: offset,
  });

  log.debug("Fetched cards by deck with notes", { deckId, count: cards.length });
  return cards;
}

export async function repoGetCardsForReview(
  input: RepoInputGetCardsForReview,
): Promise<RepoOutputCardWithNote[]> {
  const { deckId, limit = 20 } = input;
  const now = Math.floor(Date.now() / 1000);
  const todayDays = Math.floor(now / 86400);

  const cards = await prisma.card.findMany({
    where: {
      deckId,
      queue: { in: [CardQueue.NEW, CardQueue.LEARNING, CardQueue.REVIEW] },
      OR: [
        { type: CardType.NEW },
        {
          type: { in: [CardType.LEARNING, CardType.REVIEW] },
          due: { lte: todayDays },
        },
      ],
    },
    include: {
      note: {
        select: {
          id: true,
          flds: true,
          sfld: true,
          tags: true,
        },
      },
    },
    orderBy: [
      { type: "asc" },
      { due: "asc" },
    ],
    take: limit,
  });

  log.debug("Fetched cards for review", { deckId, count: cards.length });
  return cards;
}

export async function repoGetNewCards(
  input: RepoInputGetNewCards,
): Promise<RepoOutputCardWithNote[]> {
  const { deckId, limit = 20 } = input;

  const cards = await prisma.card.findMany({
    where: {
      deckId,
      type: CardType.NEW,
      queue: CardQueue.NEW,
    },
    include: {
      note: {
        select: {
          id: true,
          flds: true,
          sfld: true,
          tags: true,
        },
      },
    },
    orderBy: { due: "asc" },
    take: limit,
  });

  log.debug("Fetched new cards", { deckId, count: cards.length });
  return cards;
}

export async function repoDeleteCard(id: bigint): Promise<void> {
  log.debug("Deleting card", { cardId: id.toString() });
  await prisma.card.delete({
    where: { id },
  });
  log.info("Card deleted", { cardId: id.toString() });
}

export async function repoBulkUpdateCards(
  input: RepoInputBulkUpdateCards,
): Promise<void> {
  log.debug("Bulk updating cards", { count: input.cards.length });

  await prisma.$transaction(
    input.cards.map((item) =>
      prisma.card.update({
        where: { id: item.id },
        data: {
          ...item.data,
          updatedAt: new Date(),
        },
      }),
    ),
  );

  log.info("Bulk update completed", { count: input.cards.length });
}

export async function repoGetCardStats(deckId: number): Promise<RepoOutputCardStats> {
  const now = Math.floor(Date.now() / 1000);
  const todayDays = Math.floor(now / 86400);

  const [total, newCards, learning, review, due] = await Promise.all([
    prisma.card.count({ where: { deckId } }),
    prisma.card.count({ where: { deckId, type: CardType.NEW } }),
    prisma.card.count({ where: { deckId, type: CardType.LEARNING } }),
    prisma.card.count({ where: { deckId, type: CardType.REVIEW } }),
    prisma.card.count({
      where: {
        deckId,
        type: { in: [CardType.LEARNING, CardType.REVIEW] },
        due: { lte: todayDays },
      },
    }),
  ]);

  return { total, new: newCards, learning, review, due };
}

export async function repoGetCardDeckOwnerId(cardId: bigint): Promise<string | null> {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: {
      deck: {
        select: { userId: true },
      },
    },
  });
  return card?.deck.userId ?? null;
}

export async function repoGetNextDueCard(deckId: number): Promise<RepoOutputCard | null> {
  const now = Math.floor(Date.now() / 1000);
  const todayDays = Math.floor(now / 86400);

  const card = await prisma.card.findFirst({
    where: {
      deckId,
      queue: { in: [CardQueue.NEW, CardQueue.LEARNING, CardQueue.REVIEW] },
      OR: [
        { type: CardType.NEW },
        {
          type: { in: [CardType.LEARNING, CardType.REVIEW] },
          due: { lte: todayDays },
        },
      ],
    },
    orderBy: [
      { type: "asc" },
      { due: "asc" },
    ],
  });

  return card;
}

export async function repoGetCardsByNoteId(noteId: bigint): Promise<RepoOutputCard[]> {
  const cards = await prisma.card.findMany({
    where: { noteId },
    orderBy: { ord: "asc" },
  });
  return cards;
}

export async function repoResetDeckCards(
  input: RepoInputResetDeckCards,
): Promise<RepoOutputResetDeckCards> {
  log.debug("Resetting deck cards", { deckId: input.deckId });

  const result = await prisma.card.updateMany({
    where: { deckId: input.deckId },
    data: {
      type: CardType.NEW,
      queue: CardQueue.NEW,
      due: 0,
      ivl: 0,
      factor: 2500,
      reps: 0,
      lapses: 0,
      left: 0,
      odue: 0,
      odid: 0,
      mod: Math.floor(Date.now() / 1000),
    },
  });

  log.info("Deck cards reset", { deckId: input.deckId, count: result.count });
  return { count: result.count };
}
