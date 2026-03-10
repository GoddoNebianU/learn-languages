-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "displayUsername" TEXT,
    "username" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pairs" (
    "id" SERIAL NOT NULL,
    "language1" TEXT NOT NULL,
    "language2" TEXT NOT NULL,
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
    "user_id" TEXT NOT NULL,
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "folder_favorites" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "folder_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "folder_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dictionary_lookups" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT,
    "text" TEXT NOT NULL,
    "query_lang" TEXT NOT NULL,
    "definition_lang" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dictionary_item_id" INTEGER,
    "normalized_text" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "dictionary_lookups_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "translation_history" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT,
    "source_text" TEXT NOT NULL,
    "source_language" TEXT NOT NULL,
    "target_language" TEXT NOT NULL,
    "translated_text" TEXT NOT NULL,
    "source_ipa" TEXT,
    "target_ipa" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "translation_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE INDEX "pairs_folder_id_idx" ON "pairs"("folder_id");

-- CreateIndex
CREATE UNIQUE INDEX "pairs_folder_id_language1_language2_text1_text2_key" ON "pairs"("folder_id", "language1", "language2", "text1", "text2");

-- CreateIndex
CREATE INDEX "folders_user_id_idx" ON "folders"("user_id");

-- CreateIndex
CREATE INDEX "folders_visibility_idx" ON "folders"("visibility");

-- CreateIndex
CREATE INDEX "folder_favorites_user_id_idx" ON "folder_favorites"("user_id");

-- CreateIndex
CREATE INDEX "folder_favorites_folder_id_idx" ON "folder_favorites"("folder_id");

-- CreateIndex
CREATE UNIQUE INDEX "folder_favorites_user_id_folder_id_key" ON "folder_favorites"("user_id", "folder_id");

-- CreateIndex
CREATE INDEX "dictionary_lookups_user_id_idx" ON "dictionary_lookups"("user_id");

-- CreateIndex
CREATE INDEX "dictionary_lookups_created_at_idx" ON "dictionary_lookups"("created_at");

-- CreateIndex
CREATE INDEX "dictionary_lookups_normalized_text_idx" ON "dictionary_lookups"("normalized_text");

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
CREATE INDEX "translation_history_user_id_idx" ON "translation_history"("user_id");

-- CreateIndex
CREATE INDEX "translation_history_created_at_idx" ON "translation_history"("created_at");

-- CreateIndex
CREATE INDEX "translation_history_source_text_target_language_idx" ON "translation_history"("source_text", "target_language");

-- CreateIndex
CREATE INDEX "translation_history_translated_text_source_language_target__idx" ON "translation_history"("translated_text", "source_language", "target_language");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pairs" ADD CONSTRAINT "pairs_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folder_favorites" ADD CONSTRAINT "folder_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folder_favorites" ADD CONSTRAINT "folder_favorites_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dictionary_lookups" ADD CONSTRAINT "dictionary_lookups_dictionary_item_id_fkey" FOREIGN KEY ("dictionary_item_id") REFERENCES "dictionary_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dictionary_lookups" ADD CONSTRAINT "dictionary_lookups_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dictionary_entries" ADD CONSTRAINT "dictionary_entries_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "dictionary_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "translation_history" ADD CONSTRAINT "translation_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
