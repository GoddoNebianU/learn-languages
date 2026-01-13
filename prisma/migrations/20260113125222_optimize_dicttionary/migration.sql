/*
  Warnings:

  - You are about to drop the column `dictionary_phrase_id` on the `dictionary_lookups` table. All the data in the column will be lost.
  - You are about to drop the column `dictionary_word_id` on the `dictionary_lookups` table. All the data in the column will be lost.
  - You are about to drop the `dictionary_phrase_entries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dictionary_phrases` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dictionary_word_entries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dictionary_words` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "dictionary_lookups" DROP CONSTRAINT "dictionary_lookups_dictionary_phrase_id_fkey";

-- DropForeignKey
ALTER TABLE "dictionary_lookups" DROP CONSTRAINT "dictionary_lookups_dictionary_word_id_fkey";

-- DropForeignKey
ALTER TABLE "dictionary_phrase_entries" DROP CONSTRAINT "dictionary_phrase_entries_phrase_id_fkey";

-- DropForeignKey
ALTER TABLE "dictionary_word_entries" DROP CONSTRAINT "dictionary_word_entries_word_id_fkey";

-- DropIndex
DROP INDEX "dictionary_lookups_text_query_lang_definition_lang_idx";

-- AlterTable
ALTER TABLE "dictionary_lookups" DROP COLUMN "dictionary_phrase_id",
DROP COLUMN "dictionary_word_id",
ADD COLUMN     "dictionary_item_id" INTEGER,
ADD COLUMN     "normalized_text" TEXT NOT NULL DEFAULT '';

-- DropTable
DROP TABLE "dictionary_phrase_entries";

-- DropTable
DROP TABLE "dictionary_phrases";

-- DropTable
DROP TABLE "dictionary_word_entries";

-- DropTable
DROP TABLE "dictionary_words";

-- CreateTable
CREATE TABLE "dictionary_items" (
    "id" SERIAL NOT NULL,
    "frequency" INTEGER NOT NULL DEFAULT 1,
    "standard_form" TEXT NOT NULL,
    "query_lang" TEXT NOT NULL,
    "definition_lang" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dictionary_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dictionary_entries" (
    "id" SERIAL NOT NULL,
    "item_id" INTEGER NOT NULL,
    "ipa" TEXT,
    "definition" TEXT NOT NULL,
    "part_of_speech" TEXT,
    "example" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dictionary_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dictionary_items_standard_form_idx" ON "dictionary_items"("standard_form");

-- CreateIndex
CREATE INDEX "dictionary_items_query_lang_definition_lang_idx" ON "dictionary_items"("query_lang", "definition_lang");

-- CreateIndex
CREATE UNIQUE INDEX "dictionary_items_standard_form_query_lang_definition_lang_key" ON "dictionary_items"("standard_form", "query_lang", "definition_lang");

-- CreateIndex
CREATE INDEX "dictionary_entries_item_id_idx" ON "dictionary_entries"("item_id");

-- CreateIndex
CREATE INDEX "dictionary_entries_created_at_idx" ON "dictionary_entries"("created_at");

-- CreateIndex
CREATE INDEX "dictionary_lookups_normalized_text_idx" ON "dictionary_lookups"("normalized_text");

-- AddForeignKey
ALTER TABLE "dictionary_lookups" ADD CONSTRAINT "dictionary_lookups_dictionary_item_id_fkey" FOREIGN KEY ("dictionary_item_id") REFERENCES "dictionary_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dictionary_entries" ADD CONSTRAINT "dictionary_entries_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "dictionary_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
