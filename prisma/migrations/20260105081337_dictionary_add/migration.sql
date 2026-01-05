/*
  Warnings:

  - You are about to drop the column `ipa1` on the `pairs` table. All the data in the column will be lost.
  - You are about to drop the column `ipa2` on the `pairs` table. All the data in the column will be lost.

*/
-- AlterTable
-- 重命名并修改类型为 TEXT
ALTER TABLE "pairs" 
RENAME COLUMN "locale1" TO "language1";

ALTER TABLE "pairs" 
ALTER COLUMN "language1" SET DATA TYPE VARCHAR(20);

ALTER TABLE "pairs" 
RENAME COLUMN "locale2" TO "language2";

ALTER TABLE "pairs" 
ALTER COLUMN "language2" SET DATA TYPE VARCHAR(20);

-- CreateTable
CREATE TABLE "dictionary_lookups" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT,
    "text" TEXT NOT NULL,
    "query_lang" TEXT NOT NULL,
    "definition_lang" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dictionary_word_id" INTEGER,
    "dictionary_phrase_id" INTEGER,

    CONSTRAINT "dictionary_lookups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dictionary_words" (
    "id" SERIAL NOT NULL,
    "standard_form" TEXT NOT NULL,
    "query_lang" TEXT NOT NULL,
    "definition_lang" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dictionary_words_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dictionary_phrases" (
    "id" SERIAL NOT NULL,
    "standard_form" TEXT NOT NULL,
    "query_lang" TEXT NOT NULL,
    "definition_lang" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dictionary_phrases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dictionary_word_entries" (
    "id" SERIAL NOT NULL,
    "word_id" INTEGER NOT NULL,
    "ipa" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "part_of_speech" TEXT NOT NULL,
    "example" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dictionary_word_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dictionary_phrase_entries" (
    "id" SERIAL NOT NULL,
    "phrase_id" INTEGER NOT NULL,
    "definition" TEXT NOT NULL,
    "example" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dictionary_phrase_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dictionary_lookups_user_id_idx" ON "dictionary_lookups"("user_id");

-- CreateIndex
CREATE INDEX "dictionary_lookups_created_at_idx" ON "dictionary_lookups"("created_at");

-- CreateIndex
CREATE INDEX "dictionary_lookups_text_query_lang_definition_lang_idx" ON "dictionary_lookups"("text", "query_lang", "definition_lang");

-- CreateIndex
CREATE INDEX "dictionary_words_standard_form_idx" ON "dictionary_words"("standard_form");

-- CreateIndex
CREATE INDEX "dictionary_words_query_lang_definition_lang_idx" ON "dictionary_words"("query_lang", "definition_lang");

-- CreateIndex
CREATE UNIQUE INDEX "dictionary_words_standard_form_query_lang_definition_lang_key" ON "dictionary_words"("standard_form", "query_lang", "definition_lang");

-- CreateIndex
CREATE INDEX "dictionary_phrases_standard_form_idx" ON "dictionary_phrases"("standard_form");

-- CreateIndex
CREATE INDEX "dictionary_phrases_query_lang_definition_lang_idx" ON "dictionary_phrases"("query_lang", "definition_lang");

-- CreateIndex
CREATE UNIQUE INDEX "dictionary_phrases_standard_form_query_lang_definition_lang_key" ON "dictionary_phrases"("standard_form", "query_lang", "definition_lang");

-- CreateIndex
CREATE INDEX "dictionary_word_entries_word_id_idx" ON "dictionary_word_entries"("word_id");

-- CreateIndex
CREATE INDEX "dictionary_word_entries_created_at_idx" ON "dictionary_word_entries"("created_at");

-- CreateIndex
CREATE INDEX "dictionary_phrase_entries_phrase_id_idx" ON "dictionary_phrase_entries"("phrase_id");

-- CreateIndex
CREATE INDEX "dictionary_phrase_entries_created_at_idx" ON "dictionary_phrase_entries"("created_at");

-- AddForeignKey
ALTER TABLE "dictionary_lookups" ADD CONSTRAINT "dictionary_lookups_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dictionary_lookups" ADD CONSTRAINT "dictionary_lookups_dictionary_word_id_fkey" FOREIGN KEY ("dictionary_word_id") REFERENCES "dictionary_words"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dictionary_lookups" ADD CONSTRAINT "dictionary_lookups_dictionary_phrase_id_fkey" FOREIGN KEY ("dictionary_phrase_id") REFERENCES "dictionary_phrases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dictionary_word_entries" ADD CONSTRAINT "dictionary_word_entries_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "dictionary_words"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dictionary_phrase_entries" ADD CONSTRAINT "dictionary_phrase_entries_phrase_id_fkey" FOREIGN KEY ("phrase_id") REFERENCES "dictionary_phrases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
