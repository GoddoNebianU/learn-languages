"use server";

import { PairCreateInput, PairUpdateInput } from "../../../../generated/prisma/models";
import prisma from "../../db";

export async function createPair(data: PairCreateInput) {
  await prisma.pair.create({
    data: data,
  });
}

export async function deletePairById(id: number) {
  await prisma.pair.delete({
    where: {
      id: id,
    },
  });
}

export async function updatePairById(
  id: number,
  data: PairUpdateInput,
) {
  await prisma.pair.update({
    where: {
      id: id,
    },
    data: data,
  });
}

export async function getPairCountByFolderId(folderId: number) {
  const count = await prisma.pair.count({
    where: {
      folderId: folderId,
    },
  });
  return count;
}

export async function getPairsByFolderId(folderId: number) {
  const textPairs = await prisma.pair.findMany({
    where: {
      folderId: folderId,
    },
  });
  return textPairs;
}
