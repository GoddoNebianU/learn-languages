import {
  RepoInputCreateCard,
  RepoInputUpdateCard,
  RepoInputDeleteCard,
  RepoInputGetCardsByDeckId,
  RepoInputGetRandomCard,
  RepoInputCheckCardOwnership,
  RepoInputCheckCardExistsByWord,
  RepoOutputCard,
  RepoOutputCardStats,
  CardMeaning,
  RepoInputReorderCards,
} from "./card-repository-dto";
import { prisma } from "@/lib/db";
import { createLogger } from "@/lib/logger";

const log = createLogger("card-repository");

export async function repoCreateCard(input: RepoInputCreateCard): Promise<number> {
  log.debug("Creating card", { deckId: input.deckId, word: input.word });
  const maxSortOrder = await prisma.card.count({ where: { deckId: input.deckId } });
  const card = await prisma.card.create({
    data: {
      deckId: input.deckId,
      word: input.word,
      ipa: input.ipa,
      queryLang: input.queryLang,
      cardType: input.cardType,
      sortOrder: maxSortOrder,
      meanings: {
        create: input.meanings.map((m: CardMeaning) => ({
          partOfSpeech: m.partOfSpeech,
          definition: m.definition,
          example: m.example,
        })),
      },
    },
  });
  log.info("Card created", { cardId: card.id });
  return card.id;
}

export async function repoUpdateCard(input: RepoInputUpdateCard): Promise<void> {
  log.debug("Updating card", { cardId: input.cardId });
  await prisma.$transaction(async (tx) => {
    if (input.word !== undefined) {
      await tx.card.update({
        where: { id: input.cardId },
        data: { word: input.word },
      });
    }
    if (input.ipa !== undefined) {
      await tx.card.update({
        where: { id: input.cardId },
        data: { ipa: input.ipa },
      });
    }
    if (input.meanings !== undefined) {
      await tx.cardMeaning.deleteMany({
        where: { cardId: input.cardId },
      });
      await tx.cardMeaning.createMany({
        data: input.meanings.map((m: CardMeaning) => ({
          cardId: input.cardId,
          partOfSpeech: m.partOfSpeech,
          definition: m.definition,
          example: m.example,
        })),
      });
    }
    if (input.hidden !== undefined) {
      await tx.card.update({
        where: { id: input.cardId },
        data: { hidden: input.hidden },
      });
    }
    await tx.card.update({
      where: { id: input.cardId },
      data: { updatedAt: new Date() },
    });
  });
  log.info("Card updated", { cardId: input.cardId });
}

export async function repoDeleteCard(input: RepoInputDeleteCard): Promise<void> {
  log.debug("Deleting card", { cardId: input.cardId });
  await prisma.card.delete({
    where: { id: input.cardId },
  });
  log.info("Card deleted", { cardId: input.cardId });
}

export async function repoGetCardById(cardId: number): Promise<RepoOutputCard | null> {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { meanings: { orderBy: { createdAt: "asc" } } },
  });
  return card as RepoOutputCard | null;
}

export async function repoGetCardsByDeckId(
  input: RepoInputGetCardsByDeckId
): Promise<RepoOutputCard[]> {
  const { deckId, limit, offset = 0, includeHidden = false } = input;
  const cards = await prisma.card.findMany({
    where: includeHidden ? { deckId } : { deckId, hidden: false },
    include: {
      meanings: {
        select: { partOfSpeech: true, definition: true, example: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    ...(limit !== undefined ? { take: limit } : {}),
    skip: offset,
  });
  log.debug("Fetched cards by deck", { deckId, count: cards.length });
  return cards as RepoOutputCard[];
}

export async function repoGetRandomCard(
  input: RepoInputGetRandomCard
): Promise<RepoOutputCard | null> {
  const { deckId, excludeIds = [] } = input;
  const whereClause = excludeIds.length > 0 ? { deckId, id: { notIn: excludeIds } } : { deckId };
  const count = await prisma.card.count({ where: whereClause });
  if (count === 0) {
    return null;
  }
  const skip = Math.floor(Math.random() * count);
  const cards = await prisma.card.findMany({
    where: whereClause,
    include: { meanings: { orderBy: { createdAt: "asc" } } },
    skip,
    take: 1,
  });
  const card = cards[0];
  if (!card) {
    return null;
  }
  log.debug("Got random card", { cardId: card.id, deckId });
  return card as RepoOutputCard;
}

export async function repoGetCardDeckOwnerId(cardId: number): Promise<string | null> {
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

export async function repoCheckCardOwnership(input: RepoInputCheckCardOwnership): Promise<boolean> {
  const ownerId = await repoGetCardDeckOwnerId(input.cardId);
  return ownerId === input.userId;
}

export async function repoGetCardStats(
  deckId: number,
  includeHidden: boolean = false
): Promise<RepoOutputCardStats> {
  const where = includeHidden ? { deckId } : { deckId, hidden: false };
  const total = await prisma.card.count({ where });
  return { total };
}

export async function repoGetCardHash(
  deckId: number,
  includeHidden: boolean = false
): Promise<{ total: number; lastModified: string }> {
  const where = includeHidden ? { deckId } : { deckId, hidden: false };
  const [total, latest] = await Promise.all([
    prisma.card.count({ where }),
    prisma.card.findFirst({
      where,
      select: { updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);
  return { total, lastModified: latest?.updatedAt?.toISOString() ?? "" };
}

export async function repoCheckCardExistsByWord(
  input: RepoInputCheckCardExistsByWord
): Promise<boolean> {
  const count = await prisma.card.count({
    where: { deckId: input.deckId, word: input.word },
  });
  return count > 0;
}

export async function repoGetCardByWord(
  input: RepoInputCheckCardExistsByWord
): Promise<RepoOutputCard | null> {
  const card = await prisma.card.findFirst({
    where: { deckId: input.deckId, word: input.word },
    include: { meanings: { orderBy: { createdAt: "asc" } } },
  });
  return card as RepoOutputCard | null;
}

export async function repoReorderCards(input: RepoInputReorderCards): Promise<void> {
  log.debug("Reordering cards", { deckId: input.deckId, count: input.cardIds.length });
  await prisma.$transaction(
    input.cardIds.map((cardId, index) =>
      prisma.card.update({
          where: { id: cardId, deckId: input.deckId },
          data: { sortOrder: index, updatedAt: new Date() },
        })
    )
  );
  log.info("Cards reordered", { deckId: input.deckId, count: input.cardIds.length });
}
