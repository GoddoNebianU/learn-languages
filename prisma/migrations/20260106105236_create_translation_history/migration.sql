-- CreateTable
CREATE TABLE "translation_history" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT,
    "source_text" TEXT NOT NULL,
    "source_language" VARCHAR(20) NOT NULL,
    "target_language" VARCHAR(20) NOT NULL,
    "translated_text" TEXT NOT NULL,
    "source_ipa" TEXT,
    "target_ipa" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "translation_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "translation_history_user_id_idx" ON "translation_history"("user_id");

-- CreateIndex
CREATE INDEX "translation_history_created_at_idx" ON "translation_history"("created_at");

-- CreateIndex
CREATE INDEX "translation_history_source_text_target_language_idx" ON "translation_history"("source_text", "target_language");

-- CreateIndex
CREATE INDEX "translation_history_translated_text_source_language_target__idx" ON "translation_history"("translated_text", "source_language", "target_language");

-- AddForeignKey
ALTER TABLE "translation_history" ADD CONSTRAINT "translation_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
