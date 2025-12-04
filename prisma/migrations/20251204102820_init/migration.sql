/*
  Warnings:

  - You are about to drop the `folder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `text_pair` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "text_pair" DROP CONSTRAINT "fk_text_pairs_folder";

-- DropTable
DROP TABLE "folder";

-- DropTable
DROP TABLE "text_pair";

-- CreateTable
CREATE TABLE "pairs" (
    "id" SERIAL NOT NULL,
    "locale1" VARCHAR(10) NOT NULL,
    "locale2" VARCHAR(10) NOT NULL,
    "text1" TEXT NOT NULL,
    "text2" TEXT NOT NULL,
    "ipa1" TEXT,
    "ipa2" TEXT,
    "folder_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pairs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "folders" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pairs_folder_id_idx" ON "pairs"("folder_id");

-- CreateIndex
CREATE UNIQUE INDEX "pairs_folder_id_locale1_locale2_text1_key" ON "pairs"("folder_id", "locale1", "locale2", "text1");

-- CreateIndex
CREATE INDEX "folders_user_id_idx" ON "folders"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "pairs" ADD CONSTRAINT "pairs_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
