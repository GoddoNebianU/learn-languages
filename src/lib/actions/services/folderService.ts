"use server";

import { FolderCreateInput, FolderUpdateInput } from "../../../../generated/prisma/models";
import prisma from "../../db";

export async function getFoldersByUserId(userId: number) {
  const folders = await prisma.folder.findMany({
    where: {
      userId: userId,
    },
  });
  return folders;
}

export async function renameFolderById(id: number, newName: string) {
  await prisma.folder.update({
    where: {
      id: id,
    },
    data: {
      name: newName,
    },
  });
}

export async function getFoldersWithTotalPairsByUserId(userId: number) {
  const folders = await prisma.folder.findMany({
    where: { userId },
    include: {
      _count: {
        select: { pairs: true },
      },
    },
  });

  return folders.map(folder => ({
    ...folder,
    total: folder._count?.pairs ?? 0,
  }));
}

export async function createFolder(folder: FolderCreateInput) {
  await prisma.folder.create({
    data: folder,
  });
}

export async function deleteFolderById(id: number) {
  await prisma.folder.delete({
    where: {
      id: id,
    },
  });
}

export async function updateFolderById(id: number, data: FolderUpdateInput) {
  await prisma.folder.update({
    where: {
      id: id,
    },
    data: data,
  });
}

export async function getUserIdByFolderId(id: number) {
  const folder = await prisma.folder.findUnique({
    where: {
      id: id,
    },
  });
  return folder?.userId;
}
