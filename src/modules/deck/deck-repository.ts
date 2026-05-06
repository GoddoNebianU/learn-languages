import { prisma } from "@/lib/db";
import {
  RepoInputCreateDeck,
  RepoInputUpdateDeck,
  RepoInputGetDeckById,
  RepoInputGetDecksByUserId,
  RepoInputGetPublicDecks,
  RepoInputDeleteDeck,
  RepoOutputDeck,
  RepoOutputPublicDeck,
  RepoOutputDeckOwnership,
  RepoInputToggleDeckFavorite,
  RepoInputCheckDeckFavorite,
  RepoInputSearchPublicDecks,
  RepoInputGetPublicDeckById,
  RepoOutputDeckFavorite,
  RepoInputGetUserFavoriteDecks,
  RepoOutputUserFavoriteDeck,
} from "./deck-repository-dto";
import { Visibility } from "../../../generated/prisma/enums";
import { createLogger } from "@/lib/logger";

const log = createLogger("deck-repository");

type DeckWithPublicIncludes = {
  id: number;
  name: string;
  desc: string;
  userId: string;
  visibility: Visibility;
  createdAt: Date;
  updatedAt: Date;
  _count?: { cards?: number; favorites?: number };
  user?: { name: string; username: string } | null;
};

function mapDeckToPublicOutput(deck: DeckWithPublicIncludes): RepoOutputPublicDeck {
  return {
    id: deck.id,
    name: deck.name,
    desc: deck.desc,
    userId: deck.userId,
    visibility: deck.visibility,
    createdAt: deck.createdAt,
    updatedAt: deck.updatedAt,
    cardCount: deck._count?.cards ?? 0,
    userName: deck.user?.name ?? null,
    userUsername: deck.user?.username ?? null,
    favoriteCount: deck._count?.favorites ?? 0,
  };
}

export async function repoCreateDeck(data: RepoInputCreateDeck): Promise<number> {
  log.debug("Creating deck", { name: data.name, userId: data.userId });
  const deck = await prisma.deck.create({
    data: {
      name: data.name,
      desc: data.desc ?? "",
      userId: data.userId,
      visibility: data.visibility ?? Visibility.PRIVATE,
    },
  });
  log.info("Deck created", { deckId: deck.id });
  return deck.id;
}

export async function repoUpdateDeck(input: RepoInputUpdateDeck): Promise<void> {
  log.debug("Updating deck", { deckId: input.id });
  const { id, ...updateData } = input;
  await prisma.deck.update({
    where: { id },
    data: updateData,
  });
  log.info("Deck updated", { deckId: id });
}

export async function repoGetDeckById(input: RepoInputGetDeckById): Promise<RepoOutputDeck | null> {
  log.debug("Getting deck by id", { deckId: input.id });
  const deck = await prisma.deck.findUnique({
    where: { id: input.id },
    include: {
      _count: {
        select: { cards: true },
      },
    },
  });

  if (!deck) return null;

  return {
    id: deck.id,
    name: deck.name,
    desc: deck.desc,
    userId: deck.userId,
    visibility: deck.visibility,
    createdAt: deck.createdAt,
    updatedAt: deck.updatedAt,
    cardCount: deck._count?.cards ?? 0,
  };
}

export async function repoGetDecksByUserId(
  input: RepoInputGetDecksByUserId
): Promise<RepoOutputDeck[]> {
  log.debug("Getting decks by userId", { userId: input.userId });
  const decks = await prisma.deck.findMany({
    where: { userId: input.userId },
    include: {
      _count: {
        select: { cards: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return decks.map((deck) => ({
    id: deck.id,
    name: deck.name,
    desc: deck.desc,
    userId: deck.userId,
    visibility: deck.visibility,
    createdAt: deck.createdAt,
    updatedAt: deck.updatedAt,
    cardCount: deck._count?.cards ?? 0,
  }));
}

export async function repoGetPublicDecks(
  input: RepoInputGetPublicDecks = {}
): Promise<RepoOutputPublicDeck[]> {
  const { limit = 50, offset = 0, orderBy = "createdAt" } = input;

  const decks = await prisma.deck.findMany({
    where: { visibility: Visibility.PUBLIC },
    include: {
      _count: {
        select: { cards: true, favorites: true },
      },
      user: {
        select: { name: true, username: true },
      },
    },
    orderBy: { [orderBy]: "desc" },
    take: limit,
    skip: offset,
  });

  log.debug("Fetched public decks", { count: decks.length });
  return decks.map(mapDeckToPublicOutput);
}

export async function repoDeleteDeck(input: RepoInputDeleteDeck): Promise<void> {
  log.debug("Deleting deck", { deckId: input.id });
  await prisma.deck.delete({
    where: { id: input.id },
  });
  log.info("Deck deleted", { deckId: input.id });
}

export async function repoGetUserIdByDeckId(deckId: number): Promise<string | null> {
  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
    select: { userId: true },
  });
  return deck?.userId ?? null;
}

export async function repoGetDeckOwnership(
  deckId: number
): Promise<RepoOutputDeckOwnership | null> {
  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
    select: { userId: true },
  });
  return deck;
}

export async function repoGetPublicDeckById(
  input: RepoInputGetPublicDeckById
): Promise<RepoOutputPublicDeck | null> {
  log.debug("Getting public deck by id", { deckId: input.deckId });
  const deck = await prisma.deck.findFirst({
    where: {
      id: input.deckId,
      visibility: Visibility.PUBLIC,
    },
    include: {
      _count: {
        select: { cards: true, favorites: true },
      },
      user: {
        select: { name: true, username: true },
      },
    },
  });

  if (!deck) return null;

  return mapDeckToPublicOutput(deck);
}

export async function repoToggleDeckFavorite(
  input: RepoInputToggleDeckFavorite
): Promise<RepoOutputDeckFavorite> {
  log.debug("Toggling deck favorite", { userId: input.userId, deckId: input.deckId });
  const isFavorited = await prisma.$transaction(async (tx) => {
    const deleted = await tx.deckFavorite.deleteMany({
      where: {
        userId: input.userId,
        deckId: input.deckId,
      },
    });

    if (deleted.count > 0) {
      return false;
    }

    await tx.deckFavorite.create({
      data: {
        userId: input.userId,
        deckId: input.deckId,
      },
    });
    return true;
  });

  const deck = await prisma.deck.findUnique({
    where: { id: input.deckId },
    include: {
      _count: {
        select: { favorites: true },
      },
    },
  });

  const result = {
    isFavorited,
    favoriteCount: deck?._count?.favorites ?? 0,
  };
  log.info("Deck favorite toggled", { isFavorited, favoriteCount: result.favoriteCount, deckId: input.deckId });
  return result;
}

export async function repoCheckDeckFavorite(
  input: RepoInputCheckDeckFavorite
): Promise<RepoOutputDeckFavorite> {
  const favorite = await prisma.deckFavorite.findUnique({
    where: {
      userId_deckId: {
        userId: input.userId,
        deckId: input.deckId,
      },
    },
  });

  const deck = await prisma.deck.findUnique({
    where: { id: input.deckId },
    include: {
      _count: {
        select: { favorites: true },
      },
    },
  });

  return {
    isFavorited: !!favorite,
    favoriteCount: deck?._count?.favorites ?? 0,
  };
}

export async function repoSearchPublicDecks(
  input: RepoInputSearchPublicDecks
): Promise<RepoOutputPublicDeck[]> {
  const { query, limit = 50, offset = 0 } = input;
  log.debug("Searching public decks", { query, limit, offset });

  const decks = await prisma.deck.findMany({
    where: {
      visibility: Visibility.PUBLIC,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { desc: { contains: query, mode: "insensitive" } },
      ],
    },
    include: {
      _count: {
        select: { cards: true, favorites: true },
      },
      user: {
        select: { name: true, username: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });

  log.debug("Searched public decks", { query, count: decks.length });
  return decks.map(mapDeckToPublicOutput);
}

export async function repoGetUserFavoriteDecks(
  input: RepoInputGetUserFavoriteDecks
): Promise<RepoOutputUserFavoriteDeck[]> {
  log.debug("Getting user favorite decks", { userId: input.userId });
  const favorites = await prisma.deckFavorite.findMany({
    where: { userId: input.userId },
    include: {
      deck: {
        include: {
          _count: {
            select: { cards: true, favorites: true },
          },
          user: {
            select: { name: true, username: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  log.debug("Fetched user favorite decks", { userId: input.userId, count: favorites.length });
  return favorites.map((fav) => ({
    ...mapDeckToPublicOutput(fav.deck),
    favoritedAt: fav.createdAt,
  }));
}
