import { executeOCR } from "@/lib/bigmodel/ocr/orchestrator";
import { serviceCheckOwnership } from "@/modules/deck/deck-service";
import { serviceCreateNote } from "@/modules/note/note-service";
import { serviceCreateCard } from "@/modules/card/card-service";
import { serviceGetNoteTypesByUserId, serviceCreateNoteType } from "@/modules/note-type/note-type-service";
import { createLogger } from "@/lib/logger";
import type { ServiceInputProcessOCR, ServiceOutputProcessOCR } from "./ocr-service-dto";
import { NoteKind } from "../../../generated/prisma/enums";

const log = createLogger("ocr-service");

const VOCABULARY_NOTE_TYPE_NAME = "Vocabulary (OCR)";

async function getOrCreateVocabularyNoteType(userId: string): Promise<number> {
  const existingTypes = await serviceGetNoteTypesByUserId({ userId });
  const existing = existingTypes.find((nt) => nt.name === VOCABULARY_NOTE_TYPE_NAME);
  
  if (existing) {
    return existing.id;
  }

  const fields = [
    { name: "Word", ord: 0, sticky: false, rtl: false, font: "Arial", size: 20, media: [] },
    { name: "Definition", ord: 1, sticky: false, rtl: false, font: "Arial", size: 20, media: [] },
    { name: "Source Language", ord: 2, sticky: false, rtl: false, font: "Arial", size: 16, media: [] },
    { name: "Target Language", ord: 3, sticky: false, rtl: false, font: "Arial", size: 16, media: [] },
  ];

  const templates = [
    {
      name: "Word → Definition",
      ord: 0,
      qfmt: "{{Word}}",
      afmt: "{{FrontSide}}<hr id=answer>{{Definition}}",
    },
    {
      name: "Definition → Word",
      ord: 1,
      qfmt: "{{Definition}}",
      afmt: "{{FrontSide}}<hr id=answer>{{Word}}",
    },
  ];

  const css = ".card { font-family: Arial; font-size: 20px; text-align: center; color: black; background-color: white; }";

  const noteTypeId = await serviceCreateNoteType({
    name: VOCABULARY_NOTE_TYPE_NAME,
    kind: NoteKind.STANDARD,
    css,
    fields,
    templates,
    userId,
  });

  log.info("Created vocabulary note type", { noteTypeId, userId });
  return noteTypeId;
}

export async function serviceProcessOCR(
  input: ServiceInputProcessOCR
): Promise<ServiceOutputProcessOCR> {
  log.info("Processing OCR request", { deckId: input.deckId, userId: input.userId });

  const isOwner = await serviceCheckOwnership({ 
    deckId: input.deckId, 
    userId: input.userId 
  });
  
  if (!isOwner) {
    log.warn("Deck ownership mismatch", { 
      deckId: input.deckId, 
      userId: input.userId 
    });
    return { 
      success: false, 
      message: "You don't have permission to modify this deck" 
    };
  }

  let ocrResult;
  try {
    log.debug("Calling OCR pipeline");
    ocrResult = await executeOCR({
      imageBase64: input.imageBase64,
      sourceLanguage: input.sourceLanguage,
      targetLanguage: input.targetLanguage,
    });
  } catch (error) {
    log.error("OCR pipeline failed", { error });
    return { 
      success: false, 
      message: "Failed to process image. Please try again." 
    };
  }

  if (!ocrResult.pairs || ocrResult.pairs.length === 0) {
    log.info("No vocabulary pairs extracted from image");
    return { 
      success: false, 
      message: "No vocabulary pairs could be extracted from the image" 
    };
  }

  const sourceLanguage = ocrResult.detectedSourceLanguage || input.sourceLanguage || "Unknown";
  const targetLanguage = ocrResult.detectedTargetLanguage || input.targetLanguage || "Unknown";

  const noteTypeId = await getOrCreateVocabularyNoteType(input.userId);

  let pairsCreated = 0;
  for (const pair of ocrResult.pairs) {
    try {
      const { id: noteId } = await serviceCreateNote({
        noteTypeId,
        userId: input.userId,
        fields: [pair.word, pair.definition, sourceLanguage, targetLanguage],
        tags: ["ocr"],
      });

      await serviceCreateCard({
        noteId,
        deckId: input.deckId,
        ord: 0,
      });

      await serviceCreateCard({
        noteId,
        deckId: input.deckId,
        ord: 1,
      });

      pairsCreated++;
    } catch (error) {
      log.error("Failed to create note/card", { 
        word: pair.word, 
        error 
      });
    }
  }

  log.info("OCR processing complete", { 
    pairsCreated, 
    sourceLanguage, 
    targetLanguage 
  });

  return {
    success: true,
    message: `Successfully created ${pairsCreated} vocabulary pairs`,
    data: {
      pairsCreated,
      sourceLanguage,
      targetLanguage,
    },
  };
}
