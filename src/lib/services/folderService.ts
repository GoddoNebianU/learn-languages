"use server";

import {
  folderCreateInput,
  folderUpdateInput,
} from "../../../generated/prisma/models";
import prisma from "../db";

export async function getFoldersByOwner(owner: string) {
  const folders = await prisma.folder.findMany({
    where: {
      owner: owner,
    },
  });
  return folders;
}

export async function getFoldersWithTotalPairsByOwner(owner: string) {
  const folders = await prisma.folder.findMany({
    where: {
      owner: owner
    },
    include: {
      text_pair: {
        select: {
          id: true
        }
      }
    }
  });

  return folders.map(folder => ({
    ...folder,
    total_pairs: folder.text_pair.length
  }));
}

export async function createFolder(folder: folderCreateInput) {
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

export async function updateFolderById(id: number, data: folderUpdateInput) {
  await prisma.folder.update({
    where: {
      id: id,
    },
    data: data,
  });
}

export async function getOwnerByFolderId(id: number) {
  const folder = await prisma.folder.findUnique({
    where: {
      id: id,
    },
  });
  return folder?.owner;
}
