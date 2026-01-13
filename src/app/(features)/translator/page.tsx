"use client";

import { LightButton } from "@/components/ui/buttons";
import { IconClick } from "@/components/ui/buttons";
import IMAGES from "@/config/images";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { TranslationHistorySchema } from "@/lib/interfaces";
import { tlsoPush, tlso } from "@/lib/browser/localStorageOperators";
import { logger } from "@/lib/logger";
import { Plus, Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import z from "zod";
import AddToFolder from "./AddToFolder";
import { translateText } from "@/modules/translator/translator-action";
import type { TranslateTextOutput } from "@/lib/server/services/types";
import { toast } from "sonner";
import FolderSelector from "./FolderSelector";
import { createPair } from "@/lib/server/services/pairService";
import { shallowEqual } from "@/utils/random";
import { authClient } from "@/lib/auth-client";
import { getTTSUrl, TTS_SUPPORTED_LANGUAGES } from "@/lib/bigmodel/tts";

export default function TranslatorPage() {
  const t = useTranslations("translator");

  const taref = useRef<HTMLTextAreaElement>(null);
  const [targetLanguage, setTargetLanguage] = useState<string>("Chinese");
  const [translationResult, setTranslationResult] = useState<TranslateTextOutput | null>(null);
  const [needIpa, setNeedIpa] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [lastTranslation, setLastTranslation] = useState<{
    sourceText: string;
    targetLanguage: string;
  } | null>(null);
  const { load, play } = useAudioPlayer();
  const [history, setHistory] = useState<z.infer<typeof TranslationHistorySchema>[]>(() => tlso.get());
  const [showAddToFolder, setShowAddToFolder] = useState(false);
  const [addToFolderItem, setAddToFolderItem] = useState<z.infer<
    typeof TranslationHistorySchema
  > | null>(null);
  const lastTTS = useRef({
    text: "",
    url: "",
  });
  const [autoSave, setAutoSave] = useState(false);
  const [autoSaveFolderId, setAutoSaveFolderId] = useState<number | null>(null);
  const { data: session } = authClient.useSession();

  const tts = async (text: string, locale: string) => {
    if (lastTTS.current.text !== text) {
      try {
        // Map language name to TTS format
        let theLanguage = locale.toLowerCase().replace(/[^a-z]/g, '').replace(/^./, match => match.toUpperCase());

        // Check if language is in TTS supported list
        const supportedLanguages: TTS_SUPPORTED_LANGUAGES[] = [
          "Auto", "Chinese", "English", "German", "Italian", "Portuguese",
          "Spanish", "Japanese", "Korean", "French", "Russian"
        ];

        if (!supportedLanguages.includes(theLanguage as TTS_SUPPORTED_LANGUAGES)) {
          theLanguage = "Auto";
        }

        const url = await getTTSUrl(text, theLanguage as TTS_SUPPORTED_LANGUAGES);
        await load(url);
        lastTTS.current.text = text;
        lastTTS.current.url = url;
      } catch (error) {
        toast.error("Failed to generate audio");
        logger.error("生成音频失败", error);
      }
    }
    await play();
  };

  const translate = async () => {
    if (!taref.current || processing) return;

    setProcessing(true);

    const sourceText = taref.current.value;

    // 判断是否需要强制重新翻译
    // 只有当源文本和目标语言都与上次相同时，才强制重新翻译
    const forceRetranslate =
      lastTranslation?.sourceText === sourceText &&
      lastTranslation?.targetLanguage === targetLanguage;

    try {
      const result = await translateText({
        sourceText,
        targetLanguage,
        forceRetranslate,
        needIpa,
        userId: session?.user?.id,
      });

      setTranslationResult(result);
      setLastTranslation({
        sourceText,
        targetLanguage,
      });

      // 更新本地历史记录
      const historyItem = {
        text1: result.sourceText,
        text2: result.translatedText,
        language1: result.sourceLanguage,
        language2: result.targetLanguage,
      };
      setHistory(tlsoPush(historyItem));

      // 自动保存到文件夹
      if (autoSave && autoSaveFolderId) {
        createPair({
          text1: result.sourceText,
          text2: result.translatedText,
          language1: result.sourceLanguage,
          language2: result.targetLanguage,
          ipa1: result.sourceIpa || undefined,
          ipa2: result.targetIpa || undefined,
          folderId: autoSaveFolderId,
        })
          .then(() => {
            toast.success(`${sourceText} 保存到文件夹 ${autoSaveFolderId} 成功`);
          })
          .catch((error) => {
            toast.error(`保存失败: ${error.message}`);
          });
      }
    } catch (error) {
      toast.error("翻译失败，请重试");
      console.error("翻译错误:", error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      {/* TCard Component */}
      <div className="w-screen flex flex-col md:flex-row md:justify-between gap-2 p-2">
        {/* Card Component - Left Side */}
        <div className="w-full md:w-1/2 flex flex-col-reverse gap-2">
          {/* ICard1 Component */}
          <div className="border border-gray-200 rounded-2xl w-full h-64 p-2">
            <textarea
              className="resize-none h-8/12 w-full focus:outline-0"
              ref={taref}
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key === "Enter") translate();
              }}
            ></textarea>
            <div className="ipa w-full h-2/12 overflow-auto text-gray-600">
              {translationResult?.sourceIpa || ""}
            </div>
            <div className="h-2/12 w-full flex justify-end items-center">
              <IconClick
                src={IMAGES.copy_all}
                alt="copy"
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    taref.current?.value || "",
                  );
                }}
              ></IconClick>
              <IconClick
                src={IMAGES.play_arrow}
                alt="play"
                onClick={() => {
                  const t = taref.current?.value;
                  if (!t) return;
                  tts(t, translationResult?.sourceLanguage || "");
                }}
              ></IconClick>
            </div>
          </div>
          <div className="option1 w-full flex flex-row justify-between items-center">
            <span>{t("detectLanguage")}</span>
            <LightButton
              selected={needIpa}
              onClick={() => setNeedIpa((prev) => !prev)}
            >
              {t("generateIPA")}
            </LightButton>
          </div>
        </div>

        {/* Card Component - Right Side */}
        <div className="w-full md:w-1/2 flex flex-col-reverse gap-2">
          {/* ICard2 Component */}
          <div className="bg-gray-100 rounded-2xl w-full h-64 p-2">
            <div className="h-2/3 w-full overflow-y-auto">{translationResult?.translatedText || ""}</div>
            <div className="ipa w-full h-1/6 overflow-y-auto text-gray-600">
              {translationResult?.targetIpa || ""}
            </div>
            <div className="h-1/6 w-full flex justify-end items-center">
              <IconClick
                src={IMAGES.copy_all}
                alt="copy"
                onClick={async () => {
                  await navigator.clipboard.writeText(translationResult?.translatedText || "");
                }}
              ></IconClick>
              <IconClick
                src={IMAGES.play_arrow}
                alt="play"
                onClick={() => {
                  if (!translationResult) return;
                  tts(
                    translationResult.translatedText,
                    translationResult.targetLanguage,
                  );
                }}
              ></IconClick>
            </div>
          </div>
          <div className="option2 w-full flex gap-1 items-center flex-wrap">
            <span>{t("translateInto")}</span>
            <LightButton
              selected={targetLanguage === "Chinese"}
              onClick={() => setTargetLanguage("Chinese")}
            >
              {t("chinese")}
            </LightButton>
            <LightButton
              selected={targetLanguage === "English"}
              onClick={() => setTargetLanguage("English")}
            >
              {t("english")}
            </LightButton>
            <LightButton
              selected={targetLanguage === "Italian"}
              onClick={() => setTargetLanguage("Italian")}
            >
              {t("italian")}
            </LightButton>
            <LightButton
              selected={!["Chinese", "English", "Italian"].includes(targetLanguage)}
              onClick={() => {
                const newLang = prompt(t("enterLanguage"));
                if (newLang) {
                  setTargetLanguage(newLang);
                }
              }}
            >
              {t("other")}
            </LightButton>
          </div>
        </div>
      </div>

      {/* TranslateButton Component */}
      <div className="w-screen flex justify-center items-center">
        <button
          className={`duration-150 ease-in text-xl font-extrabold border rounded-4xl p-3 border-gray-200 h-16 ${processing ? "bg-gray-200" : "bg-white hover:bg-gray-200 hover:cursor-pointer"}`}
          onClick={translate}
        >
          {t("translate")}
        </button>
      </div>

      {/* AutoSave Component */}
      <div className="w-screen flex justify-center items-center">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={autoSave}
            onChange={(e) => {
              const checked = e.target.checked;
              if (checked === true && !session) {
                toast.warning("Please login to enable auto-save");
                return;
              }
              if (checked === false) setAutoSaveFolderId(null);
              setAutoSave(checked);
            }}
            className="mr-2"
          />
          {t("autoSave")}
          {autoSaveFolderId ? ` (${autoSaveFolderId})` : ""}
        </label>
      </div>

      {history.length > 0 && (
        <div className="m-6 flex flex-col items-center">
          <h1 className="text-2xl font-light">{t("history")}</h1>
          <div className="border border-gray-200 rounded-2xl m-4">
            {history.toReversed().map((item, index) => (
              <div
                key={index}
                className="border-b border-gray-200 p-2 group hover:bg-gray-50 flex gap-2 flex-row justify-between items-start"
              >
                <div className="flex-1 flex flex-col">
                  <p className="text-sm font-light">{item.text1}</p>
                  <p className="text-sm font-light">{item.text2}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (!session?.user) {
                        toast.info("请先登录后再保存到文件夹");
                        return;
                      }
                      setShowAddToFolder(true);
                      setAddToFolderItem(item);
                    }}
                    className="hover:bg-gray-200 hover:cursor-pointer rounded-4xl border border-gray-200 w-8 h-8 flex justify-center items-center"
                  >
                    <Plus />
                  </button>
                  <button
                    onClick={() => {
                      setHistory(
                        tlso.set(
                          tlso.get().filter((v) => !shallowEqual(v, item)),
                        ) || [],
                      );
                    }}
                    className="hover:bg-gray-200 hover:cursor-pointer rounded-4xl border border-gray-200 w-8 h-8 flex justify-center items-center"
                  >
                    <Trash />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {showAddToFolder && (
            <AddToFolder setShow={setShowAddToFolder} item={addToFolderItem!} />
          )}
          {autoSave && !autoSaveFolderId && (
            <FolderSelector
              userId={session!.user.id as string}
              cancel={() => setAutoSave(false)}
              setSelectedFolderId={(id) => setAutoSaveFolderId(id)}
            />
          )}
        </div>
      )}
    </>
  );
}
