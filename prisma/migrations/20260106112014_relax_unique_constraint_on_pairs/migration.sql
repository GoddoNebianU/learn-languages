/*
  Warnings:

  - A unique constraint covering the columns `[folder_id,language1,language2,text1,text2]` on the table `pairs` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "pairs_folder_id_language1_language2_text1_key";

-- CreateIndex
CREATE UNIQUE INDEX "pairs_folder_id_language1_language2_text1_text2_key" ON "pairs"("folder_id", "language1", "language2", "text1", "text2");
