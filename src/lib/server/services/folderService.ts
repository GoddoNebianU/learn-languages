"use server";

import { CreateFolderInput, UpdateFolderInput } from "./types";
import prisma from "../../db";

export async function getFoldersByUserId(userId: string) {
  return prisma.folder.findMany({
    where: {
      userId: userId,
    },
  });
}

export async function renameFolderById(id: number, newName: string) {
  return prisma.folder.update({
    where: {
      id: id,
    },
    data: {
      name: newName,
    },
  });
}

export async function getFoldersWithTotalPairsByUserId(userId: string) {
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

export async function createFolder(folder: CreateFolderInput) {
  return prisma.folder.create({
    data: folder,
  });
}

export async function deleteFolderById(id: number) {
  return prisma.folder.delete({
    where: {
      id: id,
    },
  });
}

export async function updateFolderById(id: number, data: UpdateFolderInput) {
  return prisma.folder.update({
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
