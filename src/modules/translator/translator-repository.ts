import {
    RepoInputCreateTranslationHistory,
    RepoInputSelectLatestTranslation,
    RepoOutputSelectLatestTranslation,
} from "./translator-repository-dto";
import { prisma } from "@/lib/db";

export async function repoSelectLatestTranslation(
    dto: RepoInputSelectLatestTranslation
): Promise<RepoOutputSelectLatestTranslation> {
    const result = await prisma.translationHistory.findFirst({
        where: {
            sourceText: dto.sourceText,
            targetLanguage: dto.targetLanguage,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    if (!result) {
        return null;
    }

    return {
        id: result.id,
        translatedText: result.translatedText,
        sourceLanguage: result.sourceLanguage,
        targetLanguage: result.targetLanguage,
        sourceIpa: result.sourceIpa,
        targetIpa: result.targetIpa,
    };
}

export async function repoCreateTranslationHistory(
    data: RepoInputCreateTranslationHistory
) {
    return await prisma.translationHistory.create({
        data: data,
    });
}
