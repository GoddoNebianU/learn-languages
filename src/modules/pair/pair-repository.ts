import { CreatePairInput, UpdatePairInput } from "../translator/translator-dto";
import prisma from "@/lib/db";

export async function createPair(data: CreatePairInput) {
    return (await prisma.pair.create({
        data: data,
    })).id;
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
    data: UpdatePairInput,
) {
    await prisma.pair.update({
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
