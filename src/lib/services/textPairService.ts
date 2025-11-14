"use server";

import {
  text_pairCreateInput,
  text_pairUpdateInput,
} from "../../../generated/prisma/models";
import prisma from "../db";

export async function createTextPair(data: text_pairCreateInput) {
  await prisma.text_pair.create({
    data: data,
  });
}

export async function deleteTextPairById(id: number) {
  await prisma.text_pair.delete({
    where: {
      id: id,
    },
  });
}

export async function updateTextPairById(
  id: number,
  data: text_pairUpdateInput,
) {
  await prisma.text_pair.update({
    where: {
      id: id,
    },
    data: data,
  });
}

export async function getTextPairCountByFolderId(folderId: number) {
  const count = await prisma.text_pair.count({
    where: {
      folder_id: folderId,
    },
  });
  return count;
}

export async function getTextPairsByFolderId(folderId: number) {
  const textPairs = await prisma.text_pair.findMany({
    where: {
      folder_id: folderId,
    },
  });
  return textPairs;
}
