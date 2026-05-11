"use client";

import { Suspense, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useDictionaryStore } from "./stores/dictionaryStore";
import { PageLayout } from "@/components/ui/PageLayout";
import { Button } from "@/design-system/button";
import { HStack } from "@/design-system/stack";
import { LanguageSelector } from "./LanguageSelector";
import { ReadingMode } from "./ReadingMode";
import { NormalMode } from "./NormalMode";
import { authClient } from "@/lib/auth-client";
import { useCapabilityStore, type CapabilityState } from "@/lib/capability-store";
import { actionGetDecksByUserId } from "@/modules/deck/deck-action";
import type { ActionOutputDeck } from "@/modules/deck/deck-action-dto";

interface DictionaryClientProps {
  initialDecks: ActionOutputDeck[];
}

function DictionaryClientInner({ initialDecks }: DictionaryClientProps) {
  const t = useTranslations("dictionary");
  const router = useRouter();
  const searchParams = useSearchParams();

  const isReadingMode = searchParams.get("mode") === "reading";

  const {
    queryLang,
    definitionLang,
    setQueryLang,
    setDefinitionLang,
  } = useDictionaryStore();

  const noSignup = !useCapabilityStore((s: CapabilityState) => s.has("signup"));
  const { data: session } = authClient.useSession();
  const isLoggedIn = noSignup || !!session;
  const [decks, setDecks] = useState<ActionOutputDeck[]>(initialDecks);

  useEffect(() => {
    if (noSignup || session?.user?.id) {
      const userId = session?.user?.id ?? "";
      actionGetDecksByUserId({ userId }).then((result) => {
        if (result.success && result.data) {
          setDecks(result.data);
        }
      });
    }
  }, [session?.user?.id, noSignup]);

  const handleModeToggle = (mode: "normal" | "reading") => {
    if (mode === "reading") {
      router.push("/dictionary?mode=reading");
    } else {
      router.push("/dictionary");
    }
  };

  const modeProps = {
    queryLang,
    definitionLang,
    decks,
    isLoggedIn,
  };

  return (
    <PageLayout>
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-800 md:text-5xl">{t("title")}</h1>
        <p className="text-lg text-gray-700">{t("description")}</p>
      </div>

      {/* Mode Toggle */}
      <div className="mb-6 flex justify-center">
        <HStack align="center" gap={2}>
          <Button
            variant={isReadingMode ? "light" : "primary"}
            onClick={() => handleModeToggle("normal")}
            size="sm"
          >
            {t("normalMode")}
          </Button>
          <Button
            variant={isReadingMode ? "primary" : "light"}
            onClick={() => handleModeToggle("reading")}
            size="sm"
          >
            {t("readingMode")}
          </Button>
        </HStack>
      </div>

      {/* Shared Language Settings */}
      <div className="mb-4 rounded-lg bg-white/20 p-4">
        <div className="mb-3">
          <span className="font-semibold text-gray-800">{t("languageSettings")}</span>
        </div>

        <div className="space-y-4">
          <LanguageSelector
            label={t("queryLanguage")}
            hint={t("queryLanguageHint")}
            value={queryLang}
            onChange={setQueryLang}
          />

          <LanguageSelector
            label={t("definitionLanguage")}
            hint={t("definitionLanguageHint")}
            value={definitionLang}
            onChange={setDefinitionLang}
          />
        </div>
      </div>

      {isReadingMode ? (
        <ReadingMode {...modeProps} />
      ) : (
        <NormalMode {...modeProps} />
      )}
    </PageLayout>
  );
}

export function DictionaryClient({ initialDecks }: DictionaryClientProps) {
  return (
    <Suspense
      fallback={
        <PageLayout>
          <div className="flex min-h-[50vh] items-center justify-center">
            <p>Loading...</p>
          </div>
        </PageLayout>
      }
    >
      <DictionaryClientInner initialDecks={initialDecks} />
    </Suspense>
  );
}
