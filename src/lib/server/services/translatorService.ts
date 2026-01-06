"use server";

import { CreateTranslationHistoryInput, TranslationHistoryQuery } from "./types";
import prisma from "../../db";

/**
 * 创建翻译历史记录
 */
export async function createTranslationHistory(data: CreateTranslationHistoryInput) {
  return prisma.translationHistory.create({
    data: data,
  });
}

/**
 * 查询最新的翻译记录
 * @param sourceText 源文本
 * @param targetLanguage 目标语言
 * @returns 最新的翻译记录，如果不存在则返回 null
 */
export async function selectLatestTranslation(query: TranslationHistoryQuery) {
  return prisma.translationHistory.findFirst({
    where: {
      sourceText: query.sourceText,
      targetLanguage: query.targetLanguage,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}
