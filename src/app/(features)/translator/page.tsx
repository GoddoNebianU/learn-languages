"use client";

import LightButton from "@/components/ui/buttons/LightButton";
import IconClick from "@/components/ui/buttons/IconClick";
import IMAGES from "@/config/images";
import { VOICES } from "@/config/locales";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { TranslationHistorySchema } from "@/lib/interfaces";
import { tlsoPush, tlso } from "@/lib/browser/localStorageOperators";
import { getTTSAudioUrl } from "@/lib/browser/tts";
import { Plus, Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import z from "zod";
import AddToFolder from "./AddToFolder";
import {
  genIPA,
  genLocale,
  genTranslation,
} from "@/lib/server/translatorActions";
import { toast } from "sonner";
import FolderSelector from "./FolderSelector";
import { createPair } from "@/lib/server/services/pairService";
import { shallowEqual } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

export default function TranslatorPage() {
  const t = useTranslations("translator");

  const taref = useRef<HTMLTextAreaElement>(null);
  const [lang, setLang] = useState<string>("chinese");
  const [tresult, setTresult] = useState<string>("");
  const [genIpa, setGenIpa] = useState(true);
  const [ipaTexts, setIpaTexts] = useState(["", ""]);
  const [processing, setProcessing] = useState(false);
  const { load, play } = useAudioPlayer();
  const [history, setHistory] = useState<
    z.infer<typeof TranslationHistorySchema>[]
  >([]);
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

  useEffect(() => {
    setHistory(tlso.get());
  }, []);

  const tts = async (text: string, locale: string) => {
    if (lastTTS.current.text !== text) {
      const shortName = VOICES.find((v) => v.locale === locale)?.short_name;
      if (!shortName) {
        toast.error("Voice not found");
        return;
      }
      try {
        const url = await getTTSAudioUrl(text, shortName);
        await load(url);
        lastTTS.current.text = text;
        lastTTS.current.url = url;
      } catch (error) {
        toast.error("Failed to generate audio");
        console.error(error);
      }
    }
    await play();
  };

  const translate = async () => {
    if (!taref.current) return;
    if (processing) return;

    setProcessing(true);

    const text1 = taref.current.value;

    const llmres: {
      text1: string | null;
      text2: string | null;
      locale1: string | null;
      locale2: string | null;
      ipa1: string | null;
      ipa2: string | null;
    } = {
      text1: text1,
      text2: null,
      locale1: null,
      locale2: null,
      ipa1: null,
      ipa2: null,
    };

    let historyUpdated = false;

    // 检查更新历史记录
    const checkUpdateLocalStorage = () => {
      if (historyUpdated) return;
      if (llmres.text1 && llmres.text2 && llmres.locale1 && llmres.locale2) {
        setHistory(
          tlsoPush({
            text1: llmres.text1,
            text2: llmres.text2,
            locale1: llmres.locale1,
            locale2: llmres.locale2,
          }),
        );
        if (autoSave && autoSaveFolderId) {
          createPair({
            text1: llmres.text1,
            text2: llmres.text2,
            locale1: llmres.locale1,
            locale2: llmres.locale2,
            folder: {
              connect: {
                id: autoSaveFolderId,
              },
            },
          })
            .then(() => {
              toast.success(
                llmres.text1 + "保存到文件夹" + autoSaveFolderId + "成功",
              );
            })
            .catch((error) => {
              toast.error(
                llmres.text1 +
                "保存到文件夹" +
                autoSaveFolderId +
                "失败：" +
                error.message,
              );
            });
        }
        historyUpdated = true;
      }
    };
    // 更新局部翻译状态
    const updateState = (stateName: keyof typeof llmres, value: string) => {
      llmres[stateName] = value;
      checkUpdateLocalStorage();
    };

    genTranslation(text1, lang)
      .then(async (text2) => {
        updateState("text2", text2);
        setTresult(text2);
        // 生成两个locale
        genLocale(text1).then((locale) => {
          updateState("locale1", locale);
        });
        genLocale(text2).then((locale) => {
          updateState("locale2", locale);
        });
        // 生成俩IPA
        if (genIpa) {
          genIPA(text1).then((ipa1) => {
            setIpaTexts((prev) => [ipa1, prev[1]]);
            updateState("ipa1", ipa1);
          });
          genIPA(text2).then((ipa2) => {
            setIpaTexts((prev) => [prev[0], ipa2]);
            updateState("ipa2", ipa2);
          });
        }
      })
      .catch(() => {
        toast.error("Translation failed");
      })
      .finally(() => {
        setProcessing(false);
      });
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
              {ipaTexts[0]}
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
                  tts(t, tlso.get().find((v) => v.text1 === t)?.locale1 || "");
                }}
              ></IconClick>
            </div>
          </div>
          <div className="option1 w-full flex flex-row justify-between items-center">
            <span>{t("detectLanguage")}</span>
            <LightButton
              selected={genIpa}
              onClick={() => setGenIpa((prev) => !prev)}
            >
              {t("generateIPA")}
            </LightButton>
          </div>
        </div>

        {/* Card Component - Right Side */}
        <div className="w-full md:w-1/2 flex flex-col-reverse gap-2">
          {/* ICard2 Component */}
          <div className="bg-gray-100 rounded-2xl w-full h-64 p-2">
            <div className="h-2/3 w-full overflow-y-auto">{tresult}</div>
            <div className="ipa w-full h-1/6 overflow-y-auto text-gray-600">
              {ipaTexts[1]}
            </div>
            <div className="h-1/6 w-full flex justify-end items-center">
              <IconClick
                src={IMAGES.copy_all}
                alt="copy"
                onClick={async () => {
                  await navigator.clipboard.writeText(tresult);
                }}
              ></IconClick>
              <IconClick
                src={IMAGES.play_arrow}
                alt="play"
                onClick={() => {
                  tts(
                    tresult,
                    tlso.get().find((v) => v.text2 === tresult)?.locale2 || "",
                  );
                }}
              ></IconClick>
            </div>
          </div>
          <div className="option2 w-full flex gap-1 items-center flex-wrap">
            <span>{t("translateInto")}</span>
            <LightButton
              selected={lang === "chinese"}
              onClick={() => setLang("chinese")}
            >
              {t("chinese")}
            </LightButton>
            <LightButton
              selected={lang === "english"}
              onClick={() => setLang("english")}
            >
              {t("english")}
            </LightButton>
            <LightButton
              selected={lang === "italian"}
              onClick={() => setLang("italian")}
            >
              {t("italian")}
            </LightButton>
            <LightButton
              selected={!["chinese", "english", "italian"].includes(lang)}
              onClick={() => {
                const newLang = prompt(t("enterLanguage"));
                if (newLang) {
                  setLang(newLang);
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
