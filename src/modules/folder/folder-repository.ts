import prisma from "@/lib/db";
import { RepoInputCreateFolder, RepoInputCreatePair, RepoInputUpdatePair } from "./folder-repository-dto";

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
      userId: v.userId
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
  });
  return folders.map(folder => ({
    id: folder.id,
    name: folder.name,
    userId: folder.userId,
    total: folder._count?.pairs ?? 0,
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
