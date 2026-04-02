"use client";

import { LightButton, PrimaryButton, IconClick, CircleButton } from "@/design-system/base/button";
import { Input } from "@/design-system/base/input";
import { Textarea } from "@/design-system/base/textarea";
import { Select } from "@/design-system/base/select";
import { IMAGES } from "@/config/images";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { actionTranslateText } from "@/modules/translator/translator-action";
import { actionCreateCard } from "@/modules/card/card-action";
import { actionGetDecksByUserId } from "@/modules/deck/deck-action";
import type { ActionOutputDeck } from "@/modules/deck/deck-action-dto";
import type { CardType } from "@/modules/card/card-action-dto";
import { toast } from "sonner";
import { getTTSUrl, TTS_SUPPORTED_LANGUAGES } from "@/lib/bigmodel/tts";
import { TSharedTranslationResult } from "@/shared/translator-type";
import { Plus } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { OverflowDropdown } from "@/design-system/overlay/overflow-dropdown";

const SOURCE_LANGUAGES = [
  { value: "Auto", label: "auto" },
  { value: "Chinese", label: "chinese" },
  { value: "English", label: "english" },
  { value: "Japanese", label: "japanese" },
  { value: "Korean", label: "korean" },
  { value: "French", label: "french" },
  { value: "German", label: "german" },
  { value: "Italian", label: "italian" },
  { value: "Spanish", label: "spanish" },
  { value: "Portuguese", label: "portuguese" },
  { value: "Russian", label: "russian" },
] as const;

const TARGET_LANGUAGES = [
  { value: "Chinese", label: "chinese" },
  { value: "English", label: "english" },
  { value: "Japanese", label: "japanese" },
  { value: "Korean", label: "korean" },
  { value: "French", label: "french" },
  { value: "German", label: "german" },
  { value: "Italian", label: "italian" },
  { value: "Spanish", label: "spanish" },
  { value: "Portuguese", label: "portuguese" },
  { value: "Russian", label: "russian" },
] as const;

type LangLabel = typeof SOURCE_LANGUAGES[number]["label"];

function getLangLabel(t: (key: string) => string, label: LangLabel): string {
  switch (label) {
    case "auto": return t("auto");
    case "chinese": return t("chinese");
    case "english": return t("english");
    case "japanese": return t("japanese");
    case "korean": return t("korean");
    case "french": return t("french");
    case "german": return t("german");
    case "italian": return t("italian");
    case "spanish": return t("spanish");
    case "portuguese": return t("portuguese");
    case "russian": return t("russian");
  }
}

// Fixed number of language buttons to display
const FIXED_BUTTON_COUNT = 2;

export default function TranslatorPage() {
  const t = useTranslations("translator");

  const taref = useRef<HTMLTextAreaElement>(null);
  const [sourceLanguage, setSourceLanguage] = useState<string>("Auto");
  const [targetLanguage, setTargetLanguage] = useState<string>("Chinese");
  const [customSourceLanguage, setCustomSourceLanguage] = useState<string>("");
  const [customTargetLanguage, setCustomTargetLanguage] = useState<string>("");
  const [translationResult, setTranslationResult] = useState<TSharedTranslationResult | null>(null);
  const [needIpa, setNeedIpa] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [lastTranslation, setLastTranslation] = useState<{
    sourceText: string;
    sourceLanguage: string;
    targetLanguage: string;
  } | null>(null);
  const { load, play } = useAudioPlayer();
  
  const { data: session } = authClient.useSession();
  const [decks, setDecks] = useState<ActionOutputDeck[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      actionGetDecksByUserId(session.user.id).then((result) => {
        if (result.success && result.data) {
          setDecks(result.data);
        }
      });
    }
  }, [session?.user?.id]);

  const sourceButtonCount = FIXED_BUTTON_COUNT;
  const targetButtonCount = FIXED_BUTTON_COUNT;

  const tts = useCallback(async (text: string, locale: string) => {
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
      await play();
    } catch (error) {
      toast.error("Failed to generate audio");
    }
  }, [load, play]);

  const translate = async () => {
    if (!taref.current || processing) return;

    setProcessing(true);

    const sourceText = taref.current.value;
    const effectiveSourceLanguage = customSourceLanguage.trim() || sourceLanguage;
    const effectiveTargetLanguage = customTargetLanguage.trim() || targetLanguage;

    // 判断是否需要强制重新翻译
    const forceRetranslate =
      lastTranslation?.sourceText === sourceText &&
      lastTranslation?.sourceLanguage === effectiveSourceLanguage &&
      lastTranslation?.targetLanguage === effectiveTargetLanguage;

    try {
      const result = await actionTranslateText({
        sourceText,
        targetLanguage: effectiveTargetLanguage,
        forceRetranslate,
        needIpa,
        sourceLanguage: effectiveSourceLanguage === "Auto" ? undefined : effectiveSourceLanguage,
      });

      if (result.success && result.data) {
        setTranslationResult(result.data);
        setLastTranslation({
          sourceText,
          sourceLanguage: effectiveSourceLanguage,
          targetLanguage: effectiveTargetLanguage,
        });
      } else {
        toast.error(result.message || "翻译失败，请重试");
      }
    } catch (error) {
      toast.error("翻译失败，请重试");
      console.error("翻译错误:", error);
    } finally {
      setProcessing(false);
    }
  };

  const visibleSourceButtons = SOURCE_LANGUAGES.slice(0, sourceButtonCount);
  const visibleTargetButtons = TARGET_LANGUAGES.slice(0, targetButtonCount);

  const handleSaveCard = async () => {
    if (!session) {
      toast.error(t("pleaseLogin"));
      return;
    }
    if (decks.length === 0) {
      toast.error(t("pleaseCreateDeck"));
      return;
    }
    if (!lastTranslation?.sourceText || !translationResult?.translatedText) {
      toast.error(t("noTranslationToSave"));
      return;
    }

    const deckSelect = document.getElementById("deck-select-translator") as HTMLSelectElement;
    const deckId = deckSelect?.value ? Number(deckSelect.value) : decks[0]?.id;

    if (!deckId) {
      toast.error(t("noDeckSelected"));
      return;
    }

    setIsSaving(true);

    try {
      const sourceText = lastTranslation.sourceText;
      const hasSpaces = sourceText.includes(" ");
      let cardType: CardType = "WORD";
      if (!translationResult.sourceIpa) {
        cardType = "SENTENCE";
      } else if (hasSpaces) {
        cardType = "PHRASE";
      }

      await actionCreateCard({
        deckId,
        word: sourceText,
        ipa: translationResult.sourceIpa || null,
        queryLang: lastTranslation.sourceLanguage,
        cardType,
        meanings: [{
          partOfSpeech: null,
          definition: translationResult.translatedText,
          example: null,
        }],
      });

      const deckName = decks.find((d) => d.id === deckId)?.name || "Unknown";
      toast.success(t("savedToDeck", { deckName }));
      setShowSaveModal(false);
    } catch (error) {
      toast.error(t("saveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      {/* TCard Component */}
      <div className="w-screen flex flex-col md:flex-row md:justify-between gap-2 p-2">
        {/* Card Component - Left Side */}
        <div className="w-full md:w-1/2 flex flex-col-reverse gap-2">
          {/* ICard1 Component */}
          <div className="border border-gray-200 rounded-lg w-full h-64 p-2">
            <Textarea
              className="resize-none h-8/12 w-full"
              ref={taref}
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key === "Enter") translate();
              }}
            />
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
                  const text = taref.current?.value;
                  if (!text) return;
                  tts(text, translationResult?.sourceLanguage || "");
                }}
              ></IconClick>
            </div>
          </div>
          <div className="option1 w-full flex gap-1 items-center">
            <span className="shrink-0">{t("sourceLanguage")}</span>
{visibleSourceButtons.map((lang) => (
  <LightButton
    key={lang.value}
    selected={!customSourceLanguage && sourceLanguage === lang.value}
    onClick={() => {
      setSourceLanguage(lang.value);
      setCustomSourceLanguage("");
    }}
    className="shrink-0"
  >
    {getLangLabel(t, lang.label)}
  </LightButton>
))}
<OverflowDropdown
  items={SOURCE_LANGUAGES.slice()}
  visibleCount={sourceButtonCount}
  renderItem={(lang) => (
    <LightButton
      key={lang.value}
      selected={!customSourceLanguage && sourceLanguage === lang.value}
      onClick={() => {
        setSourceLanguage(lang.value);
        setCustomSourceLanguage("");
      }}
      className="shrink-0"
    >
      {getLangLabel(t, lang.label)}
    </LightButton>
  )}
  onItemClick={(lang) => {
    setSourceLanguage(lang.value);
    setCustomSourceLanguage("");
  }}
  getKey={(lang) => lang.value}
  label={t("nMore", { count: SOURCE_LANGUAGES.length - sourceButtonCount })}
/>
<Input
  variant="bordered"
  size="sm"
  value={customSourceLanguage}
  onChange={(e) => setCustomSourceLanguage(e.target.value)}
  placeholder={t("customLanguage")}
  className="w-auto min-w-[120px] shrink-0"
/>
            <div className="flex-1"></div>
            <LightButton
              selected={needIpa}
              onClick={() => setNeedIpa((prev) => !prev)}
              className="shrink-0"
            >
              {t("generateIPA")}
            </LightButton>
          </div>
        </div>

        {/* Card Component - Right Side */}
        <div className="w-full md:w-1/2 flex flex-col-reverse gap-2">
          {/* ICard2 Component */}
          <div className="bg-gray-100 rounded-lg w-full h-64 p-2">
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
          <div className="option2 w-full flex gap-1 items-center">
            <span className="shrink-0">{t("translateInto")}</span>
{visibleTargetButtons.map((lang) => (
  <LightButton
    key={lang.value}
    selected={!customTargetLanguage && targetLanguage === lang.value}
    onClick={() => {
      setTargetLanguage(lang.value);
      setCustomTargetLanguage("");
    }}
    className="shrink-0"
  >
    {getLangLabel(t, lang.label)}
  </LightButton>
))}
<OverflowDropdown
  items={TARGET_LANGUAGES.slice()}
  visibleCount={targetButtonCount}
  renderItem={(lang) => (
    <LightButton
      key={lang.value}
      selected={!customTargetLanguage && targetLanguage === lang.value}
      onClick={() => {
        setTargetLanguage(lang.value);
        setCustomTargetLanguage("");
      }}
      className="shrink-0"
    >
      {getLangLabel(t, lang.label)}
    </LightButton>
  )}
  onItemClick={(lang) => {
    setTargetLanguage(lang.value);
    setCustomTargetLanguage("");
  }}
  getKey={(lang) => lang.value}
  label={t("nMore", { count: TARGET_LANGUAGES.length - targetButtonCount })}
/>
<Input
  variant="bordered"
  size="sm"
  value={customTargetLanguage}
  onChange={(e) => setCustomTargetLanguage(e.target.value)}
  placeholder={t("customLanguage")}
  className="w-auto min-w-[120px] shrink-0"
/>
          </div>
        </div>
      </div>

      {/* TranslateButton Component */}
      <div className="w-screen flex justify-center items-center gap-4">
        <PrimaryButton
          onClick={translate}
          disabled={processing}
          size="lg"
          className="text-xl"
        >
          {t("translate")}
        </PrimaryButton>
        {translationResult && session && decks.length > 0 && (
          <CircleButton
            onClick={() => setShowSaveModal(true)}
            title={t("saveAsCard")}
          >
            <Plus size={20} />
          </CircleButton>
        )}
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">{t("saveAsCard")}</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("selectDeck")}
              </label>
              <Select id="deck-select-translator" className="w-full">
                {decks.map((deck) => (
                  <option key={deck.id} value={deck.id}>
                    {deck.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
              <div className="font-medium mb-1">{t("front")}:</div>
              <div className="text-gray-700 mb-2">{lastTranslation?.sourceText}</div>
              <div className="font-medium mb-1">{t("back")}:</div>
              <div className="text-gray-700">{translationResult?.translatedText}</div>
            </div>
            <div className="flex justify-end gap-2">
              <LightButton onClick={() => setShowSaveModal(false)}>
                {t("cancel")}
              </LightButton>
              <PrimaryButton onClick={handleSaveCard} loading={isSaving}>
                {t("save")}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
