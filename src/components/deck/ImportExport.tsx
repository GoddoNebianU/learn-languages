"use client";

import { useState, useRef } from "react";
import { Upload, Download, FileUp, X, Check, Loader2 } from "lucide-react";
import { LightButton, PrimaryButton } from "@/design-system/base/button";
import { Modal } from "@/design-system/overlay/modal";
import { actionPreviewApkg, actionImportApkg } from "@/modules/import/import-action";
import { actionExportApkg } from "@/modules/export/export-action";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface ImportExportProps {
  deckId?: number;
  deckName?: string;
  onImportComplete?: () => void;
}

interface PreviewDeck {
  id: number;
  name: string;
  cardCount: number;
}

export function ImportButton({ onImportComplete }: ImportExportProps) {
  const t = useTranslations("decks");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<"upload" | "select" | "importing">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [decks, setDecks] = useState<PreviewDeck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  const [deckName, setDeckName] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".apkg")) {
      toast.error("Please select an .apkg file");
      return;
    }

    setFile(selectedFile);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    const result = await actionPreviewApkg(formData);
    
    setLoading(false);
    
    if (result.success && result.decks) {
      setDecks(result.decks);
      setStep("select");
      if (result.decks.length === 1) {
        setSelectedDeckId(result.decks[0].id);
        setDeckName(result.decks[0].name);
      }
    } else {
      toast.error(result.message);
    }
  };

  const handleImport = async () => {
    if (!file || selectedDeckId === null) {
      toast.error("Please select a deck to import");
      return;
    }

    setStep("importing");
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("deckId", selectedDeckId.toString());
    if (deckName) {
      formData.append("deckName", deckName);
    }

    const result = await actionImportApkg(formData);

    if (result.success) {
      toast.success(result.message);
      setIsModalOpen(false);
      resetState();
      onImportComplete?.();
    } else {
      toast.error(result.message);
      setStep("select");
    }
  };

  const resetState = () => {
    setStep("upload");
    setFile(null);
    setDecks([]);
    setSelectedDeckId(null);
    setDeckName("");
    setLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    resetState();
  };

  return (
    <>
      <LightButton onClick={() => setIsModalOpen(true)}>
        <Upload size={18} />
        {t("importApkg")}
      </LightButton>

          <Modal open={isModalOpen} onClose={handleClose}>
        <div className="p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{t("importApkg")}</h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          {step === "upload" && (
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp size={40} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">{t("clickToUpload")}</p>
                <p className="text-sm text-gray-400">{t("apkgFilesOnly")}</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".apkg"
                className="hidden"
                onChange={handleFileSelect}
              />
              {loading && (
                <div className="flex items-center justify-center gap-2 text-gray-500">
                  <Loader2 size={20} className="animate-spin" />
                  <span>{t("parsing")}</span>
                </div>
              )}
            </div>
          )}

          {step === "select" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">{t("foundDecks", { count: decks.length })}</p>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {decks.map((deck) => (
                  <div
                    key={deck.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedDeckId === deck.id
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => {
                      setSelectedDeckId(deck.id);
                      setDeckName(deck.name);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{deck.name}</span>
                      <span className="text-sm text-gray-500">{deck.cardCount} cards</span>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("deckName")}
                </label>
                <input
                  type="text"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={t("enterDeckName")}
                />
              </div>

              <div className="flex gap-2">
                <LightButton onClick={() => setStep("upload")} className="flex-1">
                  {t("back")}
                </LightButton>
                <PrimaryButton
                  onClick={handleImport}
                  disabled={selectedDeckId === null}
                  className="flex-1"
                >
                  {t("import")}
                </PrimaryButton>
              </div>
            </div>
          )}

          {step === "importing" && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 size={40} className="animate-spin text-primary-500 mb-4" />
              <p className="text-gray-600">{t("importing")}</p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

export function ExportButton({ deckId, deckName }: ImportExportProps) {
  const t = useTranslations("decks");
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!deckId) return;

    setLoading(true);
    
    const result = await actionExportApkg(deckId);
    
    setLoading(false);

    if (result.success && result.data && result.filename) {
      const blob = new Blob([result.data], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t("exportSuccess"));
    } else {
      toast.error(result.message);
    }
  };

  return (
    <LightButton onClick={handleExport} disabled={loading}>
      {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
      {t("exportApkg")}
    </LightButton>
  );
}
