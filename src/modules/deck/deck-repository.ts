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

export async function repoCreateDeck(data: RepoInputCreateDeck): Promise<number> {
  const deck = await prisma.deck.create({
    data: {
      name: data.name,
      desc: data.desc ?? "",
      userId: data.userId,
      visibility: data.visibility ?? Visibility.PRIVATE,
    },
  });
  return deck.id;
}

export async function repoUpdateDeck(input: RepoInputUpdateDeck): Promise<void> {
  const { id, ...updateData } = input;
  await prisma.deck.update({
    where: { id },
    data: updateData,
  });
}

export async function repoGetDeckById(input: RepoInputGetDeckById): Promise<RepoOutputDeck | null> {
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
    collapsed: deck.collapsed,
    conf: deck.conf,
    createdAt: deck.createdAt,
    updatedAt: deck.updatedAt,
    cardCount: deck._count?.cards ?? 0,
  };
}

export async function repoGetDecksByUserId(input: RepoInputGetDecksByUserId): Promise<RepoOutputDeck[]> {
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
    collapsed: deck.collapsed,
    conf: deck.conf,
    createdAt: deck.createdAt,
    updatedAt: deck.updatedAt,
    cardCount: deck._count?.cards ?? 0,
  }));
}

export async function repoGetPublicDecks(input: RepoInputGetPublicDecks = {}): Promise<RepoOutputPublicDeck[]> {
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

  return decks.map((deck) => ({
    id: deck.id,
    name: deck.name,
    desc: deck.desc,
    userId: deck.userId,
    visibility: deck.visibility,
    collapsed: deck.collapsed,
    conf: deck.conf,
    createdAt: deck.createdAt,
    updatedAt: deck.updatedAt,
    cardCount: deck._count?.cards ?? 0,
    userName: deck.user?.name ?? null,
    userUsername: deck.user?.username ?? null,
    favoriteCount: deck._count?.favorites ?? 0,
  }));
}

export async function repoDeleteDeck(input: RepoInputDeleteDeck): Promise<void> {
  await prisma.deck.delete({
    where: { id: input.id },
  });
}

export async function repoGetUserIdByDeckId(deckId: number): Promise<string | null> {
  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
    select: { userId: true },
  });
  return deck?.userId ?? null;
}

export async function repoGetDeckOwnership(deckId: number): Promise<RepoOutputDeckOwnership | null> {
  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
    select: { userId: true },
  });
  return deck;
}

export async function repoGetPublicDeckById(input: RepoInputGetPublicDeckById): Promise<RepoOutputPublicDeck | null> {
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

  return {
    id: deck.id,
    name: deck.name,
    desc: deck.desc,
    userId: deck.userId,
    visibility: deck.visibility,
    collapsed: deck.collapsed,
    conf: deck.conf,
    createdAt: deck.createdAt,
    updatedAt: deck.updatedAt,
    cardCount: deck._count?.cards ?? 0,
    userName: deck.user?.name ?? null,
    userUsername: deck.user?.username ?? null,
    favoriteCount: deck._count?.favorites ?? 0,
  };
}

export async function repoToggleDeckFavorite(input: RepoInputToggleDeckFavorite): Promise<RepoOutputDeckFavorite> {
  const existing = await prisma.deckFavorite.findUnique({
    where: {
      userId_deckId: {
        userId: input.userId,
        deckId: input.deckId,
      },
    },
  });

  if (existing) {
    await prisma.deckFavorite.delete({
      where: { id: existing.id },
    });
  } else {
    await prisma.deckFavorite.create({
      data: {
        userId: input.userId,
        deckId: input.deckId,
      },
    });
  }

  const deck = await prisma.deck.findUnique({
    where: { id: input.deckId },
    include: {
      _count: {
        select: { favorites: true },
      },
    },
  });

  return {
    isFavorited: !existing,
    favoriteCount: deck?._count?.favorites ?? 0,
  };
}

export async function repoCheckDeckFavorite(input: RepoInputCheckDeckFavorite): Promise<RepoOutputDeckFavorite> {
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

export async function repoSearchPublicDecks(input: RepoInputSearchPublicDecks): Promise<RepoOutputPublicDeck[]> {
  const { query, limit = 50, offset = 0 } = input;

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

  return decks.map((deck) => ({
    id: deck.id,
    name: deck.name,
    desc: deck.desc,
    userId: deck.userId,
    visibility: deck.visibility,
    collapsed: deck.collapsed,
    conf: deck.conf,
    createdAt: deck.createdAt,
    updatedAt: deck.updatedAt,
    cardCount: deck._count?.cards ?? 0,
    userName: deck.user?.name ?? null,
    userUsername: deck.user?.username ?? null,
    favoriteCount: deck._count?.favorites ?? 0,
  }));
}

export async function repoGetUserFavoriteDecks(
  input: RepoInputGetUserFavoriteDecks,
): Promise<RepoOutputUserFavoriteDeck[]> {
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

  return favorites.map((fav) => ({
    id: fav.deck.id,
    name: fav.deck.name,
    desc: fav.deck.desc,
    userId: fav.deck.userId,
    visibility: fav.deck.visibility,
    collapsed: fav.deck.collapsed,
    conf: fav.deck.conf,
    createdAt: fav.deck.createdAt,
    updatedAt: fav.deck.updatedAt,
    cardCount: fav.deck._count?.cards ?? 0,
    userName: fav.deck.user?.name ?? null,
    userUsername: fav.deck.user?.username ?? null,
    favoriteCount: fav.deck._count?.favorites ?? 0,
    favoritedAt: fav.createdAt,
  }));
}
