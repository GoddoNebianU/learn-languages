-- AlterTable
ALTER TABLE "cards" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "decks" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- Populate initial deck sortOrder: most recent first (matching current createdAt desc order)
WITH ranked_decks AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "createdAt" DESC) - 1 as rn
  FROM "decks"
)
UPDATE "decks" SET "sortOrder" = ranked_decks.rn
FROM ranked_decks
WHERE "decks".id = ranked_decks.id;

-- Populate initial card sortOrder: most recent first (matching current createdAt desc order)
WITH ranked_cards AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY "deckId" ORDER BY "createdAt" DESC) - 1 as rn
  FROM "cards"
)
UPDATE "cards" SET "sortOrder" = ranked_cards.rn
FROM ranked_cards
WHERE "cards".id = ranked_cards.id;
