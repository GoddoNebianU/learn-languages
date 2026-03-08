import { prisma } from "@/lib/db";
import {
  RepoInputCreateFolder,
  RepoInputCreatePair,
  RepoInputUpdatePair,
  RepoInputUpdateFolderVisibility,
  RepoInputSearchPublicFolders,
  RepoInputGetPublicFolders,
  RepoOutputPublicFolder,
  RepoOutputFolderVisibility,
  RepoInputToggleFavorite,
  RepoInputCheckFavorite,
  RepoOutputFavoriteStatus,
  RepoInputGetUserFavorites,
  RepoOutputUserFavorite,
} from "./folder-repository-dto";
import { Visibility } from "../../../generated/prisma/enums";

export async function repoCreatePair(data: RepoInputCreatePair) {
    return (await prisma.pair.create({
        data: data,
    })).id;
}

export async function repoDeletePairById(id: number) {
    await prisma.pair.delete({
        where: {
            id: id,
        },
    });
}

export async function repoUpdatePairById(
    id: number,
    data: RepoInputUpdatePair,
) {
    await prisma.pair.update({
        where: {
            id: id,
        },
        data: data,
    });
}

export async function repoGetPairCountByFolderId(folderId: number) {
    return prisma.pair.count({
        where: {
            folderId: folderId,
        },
    });
}

export async function repoGetPairsByFolderId(folderId: number) {
    return (await prisma.pair.findMany({
        where: {
            folderId: folderId,
        },
    })).map(pair => {
        return {
            text1:pair.text1,
            text2: pair.text2,
            language1: pair.language1,
            language2: pair.language2,
            ipa1: pair.ipa1,
            ipa2: pair.ipa2,
            id: pair.id,
            folderId: pair.folderId
        }
    });
}

export async function repoGetFoldersByUserId(userId: string) {
  return (await prisma.folder.findMany({
    where: {
      userId: userId,
    },
  }))?.map(v => {
    return {
      id: v.id,
      name: v.name,
      userId: v.userId,
      visibility: v.visibility,
    };
  });
}

export async function repoRenameFolderById(id: number, newName: string) {
  await prisma.folder.update({
    where: {
      id: id,
    },
    data: {
      name: newName,
    },
  });
}

export async function repoGetFoldersWithTotalPairsByUserId(userId: string) {
  const folders = await prisma.folder.findMany({
    where: { userId },
    include: {
      _count: {
        select: { pairs: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return folders.map(folder => ({
    id: folder.id,
    name: folder.name,
    userId: folder.userId,
    visibility: folder.visibility,
    total: folder._count?.pairs ?? 0,
    createdAt: folder.createdAt,
  }));
}

export async function repoCreateFolder(folder: RepoInputCreateFolder) {
  await prisma.folder.create({
    data: folder,
  });
}

export async function repoDeleteFolderById(id: number) {
  await prisma.folder.delete({
    where: {
      id: id,
    },
  });
}

export async function repoGetUserIdByFolderId(id: number) {
  const folder = await prisma.folder.findUnique({
    where: {
      id: id,
    },
  });
  return folder?.userId;
}

export async function repoGetFolderIdByPairId(pairId: number) {
  const pair = await prisma.pair.findUnique({
    where: {
      id: pairId,
    },
    select: {
      folderId: true,
    },
  });
  return pair?.folderId;
}

export async function repoUpdateFolderVisibility(
  input: RepoInputUpdateFolderVisibility,
): Promise<void> {
  await prisma.folder.update({
    where: { id: input.folderId },
    data: { visibility: input.visibility },
  });
}

export async function repoGetFolderVisibility(
  folderId: number,
): Promise<RepoOutputFolderVisibility | null> {
  const folder = await prisma.folder.findUnique({
    where: { id: folderId },
    select: { visibility: true, userId: true },
  });
  return folder;
}

export async function repoGetPublicFolders(
  input: RepoInputGetPublicFolders = {},
): Promise<RepoOutputPublicFolder[]> {
  const { limit = 50, offset = 0, orderBy = "createdAt" } = input;

  const folders = await prisma.folder.findMany({
    where: { visibility: Visibility.PUBLIC },
    include: {
      _count: { select: { pairs: true, favorites: true } },
      user: { select: { name: true, username: true } },
    },
    orderBy: { [orderBy]: "desc" },
    take: limit,
    skip: offset,
  });
  return folders.map((folder) => ({
    id: folder.id,
    name: folder.name,
    visibility: folder.visibility,
    createdAt: folder.createdAt,
    userId: folder.userId,
    userName: folder.user.name,
    userUsername: folder.user.username,
    totalPairs: folder._count.pairs,
    favoriteCount: folder._count.favorites,
  }));
}

export async function repoSearchPublicFolders(
  input: RepoInputSearchPublicFolders,
): Promise<RepoOutputPublicFolder[]> {
  const { query, limit = 50 } = input;
  const folders = await prisma.folder.findMany({
    where: {
      visibility: Visibility.PUBLIC,
      name: { contains: query, mode: "insensitive" },
    },
    include: {
      _count: { select: { pairs: true, favorites: true } },
      user: { select: { name: true, username: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return folders.map((folder) => ({
    id: folder.id,
    name: folder.name,
    visibility: folder.visibility,
    createdAt: folder.createdAt,
    userId: folder.userId,
    userName: folder.user.name,
    userUsername: folder.user.username,
    totalPairs: folder._count.pairs,
    favoriteCount: folder._count.favorites,
  }));
}

export async function repoToggleFavorite(
  input: RepoInputToggleFavorite,
): Promise<boolean> {
  const existing = await prisma.folderFavorite.findUnique({
    where: {
      userId_folderId: {
        userId: input.userId,
        folderId: input.folderId,
      },
    },
  });
  if (existing) {
    await prisma.folderFavorite.delete({
      where: { id: existing.id },
    });
    return false;
  } else {
    await prisma.folderFavorite.create({
      data: {
        userId: input.userId,
        folderId: input.folderId,
      },
    });
    return true;
  }
}

export async function repoCheckFavorite(
  input: RepoInputCheckFavorite,
): Promise<RepoOutputFavoriteStatus> {
  const favorite = await prisma.folderFavorite.findUnique({
    where: {
      userId_folderId: {
        userId: input.userId,
        folderId: input.folderId,
      },
    },
  });
  const count = await prisma.folderFavorite.count({
    where: { folderId: input.folderId },
  });
  return {
    isFavorited: !!favorite,
    favoriteCount: count,
  };
}

export async function repoGetUserFavorites(input: RepoInputGetUserFavorites) {
  const { userId, limit = 50, offset = 0 } = input;

  const favorites = await prisma.folderFavorite.findMany({
    where: { userId },
    include: {
      folder: {
        include: {
          _count: { select: { pairs: true } },
          user: { select: { name: true, username: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });

  return favorites.map((fav) => ({
    id: fav.id,
    folderId: fav.folderId,
    folderName: fav.folder.name,
    folderCreatedAt: fav.folder.createdAt,
    folderTotalPairs: fav.folder._count.pairs,
    folderOwnerId: fav.folder.userId,
    folderOwnerName: fav.folder.user.name,
    folderOwnerUsername: fav.folder.user.username,
    favoritedAt: fav.createdAt,
  }));
}
