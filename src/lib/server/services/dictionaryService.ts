"use server";

import {
    CreateDictionaryLookUpInput,
    DictionaryLookUpQuery,
    CreateDictionaryPhraseInput,
    CreateDictionaryPhraseEntryInput,
    CreateDictionaryWordInput,
    CreateDictionaryWordEntryInput
} from "./types";
import prisma from "../../db";

export async function selectLastLookUp(content: DictionaryLookUpQuery) {
    return prisma.dictionaryLookUp.findFirst({
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
}

export async function createPhraseEntry(content: CreateDictionaryPhraseEntryInput) {
    return prisma.dictionaryPhraseEntry.create({
        data: content
    });
}

export async function createWordEntry(content: CreateDictionaryWordEntryInput) {
    return prisma.dictionaryWordEntry.create({
        data: content
    });
}

export async function createPhrase(content: CreateDictionaryPhraseInput) {
    return prisma.dictionaryPhrase.create({
        data: content
    });
}

export async function createWord(content: CreateDictionaryWordInput) {
    return prisma.dictionaryWord.create({
        data: content
    });
}

export async function createLookUp(content: CreateDictionaryLookUpInput) {
    return prisma.dictionaryLookUp.create({
        data: content
    });
}
