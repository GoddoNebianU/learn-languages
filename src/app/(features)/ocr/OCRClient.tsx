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
import { TSharedFolder } from "@/shared/folder-type";
import { OCROutput } from "@/lib/bigmodel/ocr/types";

interface OCRClientProps {
  initialFolders: TSharedFolder[];
}

export function OCRClient({ initialFolders }: OCRClientProps) {
  const t = useTranslations("ocr");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(
    initialFolders.length > 0 ? initialFolders[0].id : null
  );
  const [sourceLanguage, setSourceLanguage] = useState<string>("");
  const [targetLanguage, setTargetLanguage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCROutput | null>(null);

  const handleFileChange = useCallback((file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("processingFailed"));
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

    if (!selectedFolderId) {
      toast.error(t("noFolder"));
      return;
    }

    setIsProcessing(true);
    setOcrResult(null);

    try {
      const base64 = await fileToBase64(selectedFile);

      const result = await actionProcessOCR({
        imageBase64: base64,
        folderId: selectedFolderId,
        sourceLanguage: sourceLanguage || undefined,
        targetLanguage: targetLanguage || undefined,
      });

      if (result.success) {
        const folderName = initialFolders.find(f => f.id === selectedFolderId)?.name || "";
        toast.success(t("saved", { count: result.data?.pairsCreated ?? 0, folder: folderName }));
      } else {
        toast.error(result.message || t("processingFailed"));
      }
    } catch {
      toast.error(t("processingFailed"));
    } finally {
      setIsProcessing(false);
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
    <PageLayout>
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{t("title")}</h1>
        <p className="text-gray-600">{t("description")}</p>
      </div>

      <div className="space-y-6">
        <Card variant="bordered" padding="lg">
          <div className="space-y-4">
            <div className="font-semibold text-gray-800 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              {t("uploadImage")}
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                previewUrl
                  ? "border-primary-300 bg-primary-50"
                  : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <div className="space-y-3">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg shadow-md"
                  />
                  <div className="flex justify-center gap-2">
                    <LightButton
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearImage();
                      }}
                    >
                      {t("uploadImage")}
                    </LightButton>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-gray-500">
                  <FileImage className="w-12 h-12 mx-auto text-gray-400" />
                  <p>{t("dragDropHint")}</p>
                  <p className="text-sm">{t("supportedFormats")}</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              />
            </div>
          </div>
        </Card>

        <Card variant="bordered" padding="lg">
          <div className="space-y-4">
            <div className="font-semibold text-gray-800">{t("selectFolder")}</div>

            {initialFolders.length > 0 ? (
              <Select
                value={selectedFolderId?.toString() || ""}
                onChange={(e) => setSelectedFolderId(Number(e.target.value))}
                className="w-full"
              >
                {initialFolders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </Select>
            ) : (
              <p className="text-gray-500 text-sm">{t("noFolders")}</p>
            )}
          </div>
        </Card>

        <Card variant="bordered" padding="lg">
          <div className="space-y-4">
            <div className="font-semibold text-gray-800">{t("languageHints")}</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  {t("sourceLanguageHint")}
                </label>
                <Input
                  value={sourceLanguage}
                  onChange={(e) => setSourceLanguage(e.target.value)}
                  placeholder="English"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  {t("targetLanguageHint")}
                </label>
                <Input
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  placeholder="Chinese"
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-center">
          <PrimaryButton
            onClick={handleProcess}
            disabled={isProcessing || !selectedFile || !selectedFolderId}
            size="lg"
            className="px-8"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t("processing")}
              </>
            ) : (
              t("process")
            )}
          </PrimaryButton>
        </div>
      </div>
    </PageLayout>
  );
}
