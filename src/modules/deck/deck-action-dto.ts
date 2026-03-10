import { generateValidator } from "@/utils/validate";
import z from "zod";

export const schemaActionInputCreateDeck = z.object({
  name: z.string().min(1).max(100),
  desc: z.string().max(500).optional(),
  visibility: z.enum(["PRIVATE", "PUBLIC"]).optional(),
});
export type ActionInputCreateDeck = z.infer<typeof schemaActionInputCreateDeck>;
export const validateActionInputCreateDeck = generateValidator(schemaActionInputCreateDeck);

export const schemaActionInputUpdateDeck = z.object({
  deckId: z.number().int().positive(),
  name: z.string().min(1).max(100).optional(),
  desc: z.string().max(500).optional(),
  visibility: z.enum(["PRIVATE", "PUBLIC"]).optional(),
  collapsed: z.boolean().optional(),
});
export type ActionInputUpdateDeck = z.infer<typeof schemaActionInputUpdateDeck>;
export const validateActionInputUpdateDeck = generateValidator(schemaActionInputUpdateDeck);

export const schemaActionInputDeleteDeck = z.object({
  deckId: z.number().int().positive(),
});
export type ActionInputDeleteDeck = z.infer<typeof schemaActionInputDeleteDeck>;
export const validateActionInputDeleteDeck = generateValidator(schemaActionInputDeleteDeck);

export const schemaActionInputGetDeckById = z.object({
  deckId: z.number().int().positive(),
});
export type ActionInputGetDeckById = z.infer<typeof schemaActionInputGetDeckById>;
export const validateActionInputGetDeckById = generateValidator(schemaActionInputGetDeckById);

export const schemaActionInputGetPublicDecks = z.object({
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional(),
});
export type ActionInputGetPublicDecks = z.infer<typeof schemaActionInputGetPublicDecks>;
export const validateActionInputGetPublicDecks = generateValidator(schemaActionInputGetPublicDecks);

export type ActionOutputDeck = {
  id: number;
  name: string;
  desc: string;
  userId: string;
  visibility: "PRIVATE" | "PUBLIC";
  collapsed: boolean;
  conf: unknown;
  createdAt: Date;
  updatedAt: Date;
  cardCount?: number;
};

export type ActionOutputPublicDeck = ActionOutputDeck & {
  userName: string | null;
  userUsername: string | null;
  favoriteCount: number;
};

export type ActionOutputCreateDeck = {
  message: string;
  success: boolean;
  deckId?: number;
};

export type ActionOutputUpdateDeck = {
  message: string;
  success: boolean;
};

export type ActionOutputDeleteDeck = {
  message: string;
  success: boolean;
};

export type ActionOutputGetDeckById = {
  message: string;
  success: boolean;
  data?: ActionOutputDeck;
};

export type ActionOutputGetDecksByUserId = {
  message: string;
  success: boolean;
  data?: ActionOutputDeck[];
};

export type ActionOutputGetPublicDecks = {
  message: string;
  success: boolean;
  data?: ActionOutputPublicDeck[];
};

export const schemaActionInputSearchPublicDecks = z.object({
  query: z.string().min(1),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional(),
});
export type ActionInputSearchPublicDecks = z.infer<typeof schemaActionInputSearchPublicDecks>;
export const validateActionInputSearchPublicDecks = generateValidator(schemaActionInputSearchPublicDecks);

export const schemaActionInputGetPublicDeckById = z.object({
  deckId: z.number().int().positive(),
});
export type ActionInputGetPublicDeckById = z.infer<typeof schemaActionInputGetPublicDeckById>;
export const validateActionInputGetPublicDeckById = generateValidator(schemaActionInputGetPublicDeckById);

export const schemaActionInputToggleDeckFavorite = z.object({
  deckId: z.number().int().positive(),
});
export type ActionInputToggleDeckFavorite = z.infer<typeof schemaActionInputToggleDeckFavorite>;
export const validateActionInputToggleDeckFavorite = generateValidator(schemaActionInputToggleDeckFavorite);

export const schemaActionInputCheckDeckFavorite = z.object({
  deckId: z.number().int().positive(),
});
export type ActionInputCheckDeckFavorite = z.infer<typeof schemaActionInputCheckDeckFavorite>;
export const validateActionInputCheckDeckFavorite = generateValidator(schemaActionInputCheckDeckFavorite);

export type ActionOutputDeckFavorite = {
  isFavorited: boolean;
  favoriteCount: number;
};

export type ActionOutputSearchPublicDecks = {
  message: string;
  success: boolean;
  data?: ActionOutputPublicDeck[];
};

export type ActionOutputGetPublicDeckById = {
  message: string;
  success: boolean;
  data?: ActionOutputPublicDeck;
};

export type ActionOutputToggleDeckFavorite = {
  message: string;
  success: boolean;
  data?: ActionOutputDeckFavorite;
};

export type ActionOutputCheckDeckFavorite = {
  message: string;
  success: boolean;
  data?: ActionOutputDeckFavorite;
};

export type ActionOutputUserFavoriteDeck = ActionOutputPublicDeck & {
  favoritedAt: Date;
};

export type ActionOutputGetUserFavoriteDecks = {
  message: string;
  success: boolean;
  data?: ActionOutputUserFavoriteDeck[];
};
