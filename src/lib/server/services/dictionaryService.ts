"use server";

import { DictionaryLookUpCreateInput, DictionaryLookUpWhereInput, DictionaryPhraseCreateInput, DictionaryPhraseEntryCreateInput, DictionaryWordCreateInput, DictionaryWordEntryCreateInput } from "../../../../generated/prisma/models";
import prisma from "../../db";

export async function selectLastLookUp(content: DictionaryLookUpWhereInput) {
    const lookUp = await prisma.dictionaryLookUp.findFirst({
        where: content,
        include: {
            dictionaryPhrase: {
                include: {
                    entries: true
                }
            },
            dictionaryWord: {
                include: {
                    entries: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    return lookUp;
}

export async function createPhraseEntry(content: DictionaryPhraseEntryCreateInput) {
    return await prisma.dictionaryPhraseEntry.create({
        data: content
    });
}

export async function createWordEntry(content: DictionaryWordEntryCreateInput) {
    return await prisma.dictionaryWordEntry.create({
        data: content
    });
}

export async function createPhrase(content: DictionaryPhraseCreateInput) {
    return await prisma.dictionaryPhrase.create({
        data: content
    });
}

export async function createWord(content: DictionaryWordCreateInput) {
    return await prisma.dictionaryWord.create({
        data: content
    });
}

export async function createLookUp(content: DictionaryLookUpCreateInput) {
    return await prisma.dictionaryLookUp.create({
        data: content
    });
}
