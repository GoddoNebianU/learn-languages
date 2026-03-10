"use server";

import { executeOCR } from "@/lib/bigmodel/ocr/orchestrator";
import { repoCreatePair, repoGetUserIdByFolderId } from "@/modules/folder/folder-repository";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { createLogger } from "@/lib/logger";
import type { ServiceInputProcessOCR, ServiceOutputProcessOCR } from "./ocr-service-dto";

const log = createLogger("ocr-service");

export async function serviceProcessOCR(
  input: ServiceInputProcessOCR
): Promise<ServiceOutputProcessOCR> {
  log.info("Processing OCR request", { folderId: input.folderId });

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    log.warn("Unauthorized OCR attempt");
    return { success: false, message: "Unauthorized" };
  }

  const folderOwner = await repoGetUserIdByFolderId(input.folderId);
  if (folderOwner !== session.user.id) {
    log.warn("Folder ownership mismatch", { 
      folderId: input.folderId, 
      userId: session.user.id 
    });
    return { 
      success: false, 
      message: "You don't have permission to modify this folder" 
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

  let pairsCreated = 0;
  for (const pair of ocrResult.pairs) {
    try {
      await repoCreatePair({
        folderId: input.folderId,
        language1: sourceLanguage,
        language2: targetLanguage,
        text1: pair.word,
        text2: pair.definition,
      });
      pairsCreated++;
    } catch (error) {
      log.error("Failed to create pair", { 
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
