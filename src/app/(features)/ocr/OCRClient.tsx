"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { PageLayout } from "@/components/ui/PageLayout";
import { PrimaryButton, LightButton } from "@/design-system/base/button";
import { Input } from "@/design-system/base/input";
import { Select } from "@/design-system/base/select";
import { Card } from "@/design-system/base/card";
import { toast } from "sonner";
import { Upload, FileImage, Loader2 } from "lucide-react";
import { actionProcessOCR } from "@/modules/ocr/ocr-action";
import type { ActionOutputDeck } from "@/modules/deck/deck-action-dto";

interface ActionOutputProcessOCR {
  success: boolean;
  message: string;
  data?: {
    pairsCreated: number;
    sourceLanguage?: string;
    targetLanguage?: string;
  };
}

interface OCRClientProps {
  initialDecks: ActionOutputDeck[];
}

export function OCRClient({ initialDecks }: OCRClientProps) {
  const t = useTranslations("ocr");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [decks, setDecks] = useState<ActionOutputDeck[]>(initialDecks);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(
    initialDecks.length > 0 ? initialDecks[0].id : null
  );
  const [sourceLanguage, setSourceLanguage] = useState<string>("");
  const [targetLanguage, setTargetLanguage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<ActionOutputProcessOCR | null>(null);

  const handleFileChange = useCallback((file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("invalidFileType"));
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFile(file);
    setOcrResult(null);
  }, [t]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  }, [handleFileChange]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const fileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleProcess = async () => {
    if (!selectedFile) {
      toast.error(t("noImage"));
      return;
    }

    if (!selectedDeckId) {
      toast.error(t("noDeck"));
      return;
    }

    setIsProcessing(true);
    setOcrResult(null);

    try {
      const base64 = await fileToBase64(selectedFile);

      const result = await actionProcessOCR({
        imageBase64: base64,
        deckId: selectedDeckId,
        sourceLanguage: sourceLanguage || undefined,
        targetLanguage: targetLanguage || undefined,
      });

      if (result.success && result.data) {
        setOcrResult(result);
        const deckName = decks.find(d => d.id === selectedDeckId)?.name || "";
        toast.success(t("ocrSuccess", { count: result.data.pairsCreated, deck: deckName }));
      } else {
        toast.error(result.message || t("ocrFailed"));
      }
    } catch {
      toast.error(t("processingFailed"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!ocrResult || !selectedDeckId) {
      toast.error(t("noResultsToSave"));
      return;
    }

    try {
      const deckName = decks.find(d => d.id === selectedDeckId)?.name || "Unknown";
      toast.success(t("savedToDeck", { deckName }));
    } catch (error) {
      toast.error(t("saveFailed"));
    }
  };

  const clearImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    setOcrResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <PageLayout variant="centered-card">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          {t("title")}
        </h1>
        <p className="text-gray-700 text-lg">
          {t("description")}
        </p>
      </div>

      <Card variant="bordered" padding="lg">
        <div className="space-y-6">
          {/* Upload Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {t("uploadSection")}
            </h2>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              {previewUrl ? (
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="mx-auto max-w-full h-64 object-contain rounded-lg"
                  />
                  <p className="text-gray-600">{t("changeImage")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="text-gray-600">{t("dropOrClick")}</p>
                  <p className="text-sm text-gray-500">{t("supportedFormats")}</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              className="hidden"
            />
          </div>

          {/* Deck Selection */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {t("deckSelection")}
            </h2>
            <Select
              value={selectedDeckId?.toString() || ""}
              onChange={(e) => setSelectedDeckId(Number(e.target.value))}
              className="w-full"
            >
              <option value="">{t("selectDeck")}</option>
              {decks.map((deck) => (
                <option key={deck.id} value={deck.id}>
                  {deck.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Language Hints */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {t("languageHints")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                placeholder={t("sourceLanguagePlaceholder")}
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                className="w-full"
              />
              <Input
                type="text"
                placeholder={t("targetLanguagePlaceholder")}
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Process Button */}
          <div className="flex justify-center">
            <PrimaryButton
              onClick={handleProcess}
              disabled={!selectedFile || !selectedDeckId || isProcessing}
              loading={isProcessing}
              className="px-8 py-3 text-lg"
            >
              {t("processButton")}
            </PrimaryButton>
          </div>

          {/* Results Preview */}
          {ocrResult && ocrResult.data && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {t("resultsPreview")}
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="text-center py-4">
                    <p className="text-gray-800">{t("extractedPairs", { count: ocrResult.data.pairsCreated })}</p>
                  </div>
                </div>
                {ocrResult.data.sourceLanguage && (
                  <div className="mt-4 text-sm text-gray-500">
                    {t("detectedSourceLanguage")}: {ocrResult.data.sourceLanguage}
                  </div>
                )}
                {ocrResult.data.targetLanguage && (
                  <div className="mt-1 text-sm text-gray-500">
                    {t("detectedTargetLanguage")}: {ocrResult.data.targetLanguage}
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex justify-center">
                <LightButton
                  onClick={handleSave}
                  disabled={!selectedDeckId}
                  className="px-6 py-2"
                >
                  {t("saveButton")}
                </LightButton>
              </div>
            </div>
          )}
        </div>
      </Card>
    </PageLayout>
  );
}
