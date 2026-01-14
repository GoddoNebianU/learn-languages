import { stringNormalize } from "@/utils/string";
import {
    RepoInputCreateDictionaryEntry,
    RepoInputCreateDictionaryEntryWithoutItemId,
    RepoInputCreateDictionaryItem,
    RepoInputCreateDictionaryLookUp,
    RepoInputSelectLastLookUpResult,
    RepoOutputSelectLastLookUpResult,
} from "./dictionary-repository-dto";
import prisma from "@/lib/db";

export async function repoSelectLastLookUpResult(dto: RepoInputSelectLastLookUpResult): Promise<RepoOutputSelectLastLookUpResult> {
    const result = await prisma.dictionaryLookUp.findFirst({
        where: {
            normalizedText: stringNormalize(dto.text),
            queryLang: dto.queryLang,
            definitionLang: dto.definitionLang,
            dictionaryItemId: {
                not: null
            }
        },
        include: {
            dictionaryItem: {
                include: {
                    entries: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    if (result && result.dictionaryItem) {
        const item = result.dictionaryItem;
        return {
            id: item.id,
            standardForm: item.standardForm,
            entries: item.entries.filter(v => !!v).map(v => {
                return {
                    ipa: v.ipa || undefined,
                    definition: v.definition,
                    partOfSpeech: v.partOfSpeech || undefined,
                    example: v.example
                };
            })
        };
    }
    return null;
}

export async function repoCreateLookUp(content: RepoInputCreateDictionaryLookUp) {
    return (await prisma.dictionaryLookUp.create({
        data: { ...content, normalizedText: stringNormalize(content.text) }
    })).id;
}

export async function repoCreateLookUpWithItemAndEntries(
    itemData: RepoInputCreateDictionaryItem,
    lookUpData: RepoInputCreateDictionaryLookUp,
    entries: RepoInputCreateDictionaryEntryWithoutItemId[]
) {
    return await prisma.$transaction(async (tx) => {
        const item = await tx.dictionaryItem.create({
            data: itemData
        });

        await tx.dictionaryLookUp.create({
            data: {
                ...lookUpData,
                normalizedText: stringNormalize(lookUpData.text),
                dictionaryItemId: item.id
            }
        });

        for (const entry of entries) {
            await tx.dictionaryEntry.create({
                data: {
                    ...entry,
                    itemId: item.id
                }
            });
        }

        return item.id;
    });
}
