-- DropIndex
DROP INDEX "dictionary_phrases_standard_form_query_lang_definition_lang_key";

-- DropIndex
DROP INDEX "dictionary_words_standard_form_query_lang_definition_lang_key";

-- RenameIndex
ALTER INDEX "pairs_folder_id_locale1_locale2_text1_key" RENAME TO "pairs_folder_id_language1_language2_text1_key";
