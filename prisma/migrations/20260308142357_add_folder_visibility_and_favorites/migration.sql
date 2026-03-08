-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- AlterTable
ALTER TABLE "folders" ADD COLUMN "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE';

-- CreateTable
CREATE TABLE "folder_favorites" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "folder_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "folder_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "folder_favorites_folder_id_idx" ON "folder_favorites"("folder_id");

-- CreateIndex
CREATE UNIQUE INDEX "folder_favorites_user_id_folder_id_key" ON "folder_favorites"("user_id", "folder_id");

-- CreateIndex
CREATE INDEX "folder_favorites_user_id_idx" ON "folder_favorites"("user_id");

-- CreateIndex
CREATE INDEX "folders_visibility_idx" ON "folders"("visibility");

-- AddForeignKey
ALTER TABLE "folder_favorites" ADD CONSTRAINT "folder_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folder_favorites" ADD CONSTRAINT "folder_favorites_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
