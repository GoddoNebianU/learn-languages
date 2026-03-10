/*
  Warnings:

  - You are about to drop the `folder_favorites` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `folders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pairs` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('NEW', 'LEARNING', 'REVIEW', 'RELEARNING');

-- CreateEnum
CREATE TYPE "CardQueue" AS ENUM ('USER_BURIED', 'SCHED_BURIED', 'SUSPENDED', 'NEW', 'LEARNING', 'REVIEW', 'IN_LEARNING', 'PREVIEW');

-- CreateEnum
CREATE TYPE "NoteKind" AS ENUM ('STANDARD', 'CLOZE');

-- DropForeignKey
ALTER TABLE "folder_favorites" DROP CONSTRAINT "folder_favorites_folder_id_fkey";

-- DropForeignKey
ALTER TABLE "folder_favorites" DROP CONSTRAINT "folder_favorites_user_id_fkey";

-- DropForeignKey
ALTER TABLE "folders" DROP CONSTRAINT "folders_user_id_fkey";

-- DropForeignKey
ALTER TABLE "pairs" DROP CONSTRAINT "pairs_folder_id_fkey";

-- DropTable
DROP TABLE "folder_favorites";

-- DropTable
DROP TABLE "folders";

-- DropTable
DROP TABLE "pairs";

-- CreateTable
CREATE TABLE "note_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "NoteKind" NOT NULL DEFAULT 'STANDARD',
    "css" TEXT NOT NULL DEFAULT '',
    "fields" JSONB NOT NULL DEFAULT '[]',
    "templates" JSONB NOT NULL DEFAULT '[]',
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "note_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decks" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT NOT NULL DEFAULT '',
    "user_id" TEXT NOT NULL,
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "collapsed" BOOLEAN NOT NULL DEFAULT false,
    "conf" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "decks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deck_favorites" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "deck_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deck_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" BIGINT NOT NULL,
    "guid" TEXT NOT NULL,
    "note_type_id" INTEGER NOT NULL,
    "mod" INTEGER NOT NULL,
    "usn" INTEGER NOT NULL DEFAULT -1,
    "tags" TEXT NOT NULL DEFAULT ' ',
    "flds" TEXT NOT NULL,
    "sfld" TEXT NOT NULL,
    "csum" INTEGER NOT NULL,
    "flags" INTEGER NOT NULL DEFAULT 0,
    "data" TEXT NOT NULL DEFAULT '',
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cards" (
    "id" BIGINT NOT NULL,
    "note_id" BIGINT NOT NULL,
    "deck_id" INTEGER NOT NULL,
    "ord" INTEGER NOT NULL,
    "mod" INTEGER NOT NULL,
    "usn" INTEGER NOT NULL DEFAULT -1,
    "type" "CardType" NOT NULL DEFAULT 'NEW',
    "queue" "CardQueue" NOT NULL DEFAULT 'NEW',
    "due" INTEGER NOT NULL,
    "ivl" INTEGER NOT NULL DEFAULT 0,
    "factor" INTEGER NOT NULL DEFAULT 2500,
    "reps" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "left" INTEGER NOT NULL DEFAULT 0,
    "odue" INTEGER NOT NULL DEFAULT 0,
    "odid" INTEGER NOT NULL DEFAULT 0,
    "flags" INTEGER NOT NULL DEFAULT 0,
    "data" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revlogs" (
    "id" BIGINT NOT NULL,
    "card_id" BIGINT NOT NULL,
    "usn" INTEGER NOT NULL DEFAULT -1,
    "ease" INTEGER NOT NULL,
    "ivl" INTEGER NOT NULL,
    "lastIvl" INTEGER NOT NULL,
    "factor" INTEGER NOT NULL,
    "time" INTEGER NOT NULL,
    "type" INTEGER NOT NULL,

    CONSTRAINT "revlogs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "note_types_user_id_idx" ON "note_types"("user_id");

-- CreateIndex
CREATE INDEX "decks_user_id_idx" ON "decks"("user_id");

-- CreateIndex
CREATE INDEX "decks_visibility_idx" ON "decks"("visibility");

-- CreateIndex
CREATE INDEX "deck_favorites_user_id_idx" ON "deck_favorites"("user_id");

-- CreateIndex
CREATE INDEX "deck_favorites_deck_id_idx" ON "deck_favorites"("deck_id");

-- CreateIndex
CREATE UNIQUE INDEX "deck_favorites_user_id_deck_id_key" ON "deck_favorites"("user_id", "deck_id");

-- CreateIndex
CREATE UNIQUE INDEX "notes_guid_key" ON "notes"("guid");

-- CreateIndex
CREATE INDEX "notes_user_id_idx" ON "notes"("user_id");

-- CreateIndex
CREATE INDEX "notes_note_type_id_idx" ON "notes"("note_type_id");

-- CreateIndex
CREATE INDEX "notes_csum_idx" ON "notes"("csum");

-- CreateIndex
CREATE INDEX "cards_note_id_idx" ON "cards"("note_id");

-- CreateIndex
CREATE INDEX "cards_deck_id_idx" ON "cards"("deck_id");

-- CreateIndex
CREATE INDEX "cards_deck_id_queue_due_idx" ON "cards"("deck_id", "queue", "due");

-- CreateIndex
CREATE INDEX "revlogs_card_id_idx" ON "revlogs"("card_id");

-- AddForeignKey
ALTER TABLE "note_types" ADD CONSTRAINT "note_types_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decks" ADD CONSTRAINT "decks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deck_favorites" ADD CONSTRAINT "deck_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deck_favorites" ADD CONSTRAINT "deck_favorites_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_note_type_id_fkey" FOREIGN KEY ("note_type_id") REFERENCES "note_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revlogs" ADD CONSTRAINT "revlogs_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
