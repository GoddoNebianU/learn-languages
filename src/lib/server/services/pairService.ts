"use server";

import { CreatePairInput, UpdatePairInput } from "./types";
import prisma from "../../db";

export async function createPair(data: CreatePairInput) {
  return prisma.pair.create({
    data: data,
  });
}

export async function deletePairById(id: number) {
  return prisma.pair.delete({
    where: {
      id: id,
    },
  });
}

export async function updatePairById(
  id: number,
  data: UpdatePairInput,
) {
  return prisma.pair.update({
    where: {
      id: id,
    },
    data: data,
  });
}

export async function getPairCountByFolderId(folderId: number) {
  return prisma.pair.count({
    where: {
      folderId: folderId,
    },
  });
}

export async function getPairsByFolderId(folderId: number) {
  return prisma.pair.findMany({
    where: {
      folderId: folderId,
    },
  });
}
