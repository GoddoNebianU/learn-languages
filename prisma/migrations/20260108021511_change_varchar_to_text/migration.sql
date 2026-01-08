-- AlterTable
ALTER TABLE "pairs" ALTER COLUMN "language1" SET DATA TYPE TEXT,
ALTER COLUMN "language2" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "translation_history" ALTER COLUMN "source_language" SET DATA TYPE TEXT,
ALTER COLUMN "target_language" SET DATA TYPE TEXT;
