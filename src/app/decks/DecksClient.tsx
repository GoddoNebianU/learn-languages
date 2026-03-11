"use client";

import {
  ChevronRight,
  Layers,
  Pencil,
  Plus,
  Globe,
  Lock,
  Trash2,
} from "lucide-react";
import { CircleButton, LightButton } from "@/design-system/base/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PageLayout } from "@/components/ui/PageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { CardList } from "@/components/ui/CardList";
import {
  actionCreateDeck,
  actionDeleteDeck,
  actionGetDecksByUserId,
  actionUpdateDeck,
  actionGetDeckById,
} from "@/modules/deck/deck-action";
import type { ActionOutputDeck } from "@/modules/deck/deck-action-dto";

interface DeckCardProps {
  deck: ActionOutputDeck;
  onUpdateDeck: (deckId: number, updates: Partial<ActionOutputDeck>) => void;
  onDeleteDeck: (deckId: number) => void;
}

const DeckCard = ({ deck, onUpdateDeck, onDeleteDeck }: DeckCardProps) => {
  const router = useRouter();
  const t = useTranslations("decks");

  const handleToggleVisibility = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newVisibility = deck.visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC";
    const result = await actionUpdateDeck({
      deckId: deck.id,
      visibility: newVisibility,
    });
    if (result.success) {
      onUpdateDeck(deck.id, { visibility: newVisibility });
    } else {
      toast.error(result.message);
    }
  };

  const handleRename = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = prompt(t("enterNewName"))?.trim();
    if (newName && newName.length > 0) {
      const result = await actionUpdateDeck({
        deckId: deck.id,
        name: newName,
      });
      if (result.success) {
        onUpdateDeck(deck.id, { name: newName });
      } else {
        toast.error(result.message);
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirm = prompt(t("confirmDelete", { name: deck.name }));
    if (confirm === deck.name) {
      const result = await actionDeleteDeck({ deckId: deck.id });
      if (result.success) {
        onDeleteDeck(deck.id);
      } else {
        toast.error(result.message);
      }
    }
  };

  return (
    <div
      className="flex justify-between items-center group py-4 px-5 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => {
        router.push(`/decks/${deck.id}`);
      }}
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="shrink-0 text-primary-500">
          <Layers size={24} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{deck.name}</h3>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              {deck.visibility === "PUBLIC" ? (
                <Globe size={12} />
              ) : (
                <Lock size={12} />
              )}
              {deck.visibility === "PUBLIC" ? t("public") : t("private")}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {t("deckInfo", {
              id: deck.id,
              name: deck.name,
              totalCards: deck.cardCount ?? 0,
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 ml-4">
        <CircleButton
          onClick={handleToggleVisibility}
          title={deck.visibility === "PUBLIC" ? t("setPrivate") : t("setPublic")}
        >
          {deck.visibility === "PUBLIC" ? (
            <Lock size={18} />
          ) : (
            <Globe size={18} />
          )}
        </CircleButton>
        <CircleButton onClick={handleRename}>
          <Pencil size={18} />
        </CircleButton>
        <CircleButton
          onClick={handleDelete}
          className="hover:text-red-500 hover:bg-red-50"
        >
          <Trash2 size={18} />
        </CircleButton>
        <ChevronRight size={20} className="text-gray-400" />
      </div>
    </div>
  );
};

interface DecksClientProps {
  userId: string;
}

export function DecksClient({ userId }: DecksClientProps) {
  const t = useTranslations("decks");
  const router = useRouter();
  const [decks, setDecks] = useState<ActionOutputDeck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    
    const loadDecks = async () => {
      setLoading(true);
      const result = await actionGetDecksByUserId(userId);
      if (!ignore) {
        if (result.success && result.data) {
          setDecks(result.data);
        }
        setLoading(false);
      }
    };
    
    loadDecks();
    
    return () => {
      ignore = true;
    };
  }, [userId]);

  const handleUpdateDeck = (deckId: number, updates: Partial<ActionOutputDeck>) => {
    setDecks((prev) =>
      prev.map((d) => (d.id === deckId ? { ...d, ...updates } : d))
    );
  };

  const handleDeleteDeck = (deckId: number) => {
    setDecks((prev) => prev.filter((d) => d.id !== deckId));
  };

  const handleCreateDeck = async () => {
    const deckName = prompt(t("enterDeckName"));
    if (!deckName?.trim()) return;

    const result = await actionCreateDeck({ name: deckName.trim() });
    if (result.success && result.deckId) {
      const deckResult = await actionGetDeckById({ deckId: result.deckId });
      if (deckResult.success && deckResult.data) {
        setDecks((prev) => [...prev, deckResult.data!]);
      }
    } else {
      toast.error(result.message);
    }
  };

  return (
    <PageLayout>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="mb-4">
        <LightButton onClick={handleCreateDeck}>
          <Plus size={18} />
          {t("newDeck")}
        </LightButton>
      </div>

      <CardList>
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">{t("loading")}</p>
          </div>
        ) : decks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
              <Layers size={24} className="text-gray-400" />
            </div>
            <p className="text-sm">{t("noDecksYet")}</p>
          </div>
        ) : (
          decks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onUpdateDeck={handleUpdateDeck}
              onDeleteDeck={handleDeleteDeck}
            />
          ))
        )}
      </CardList>
    </PageLayout>
  );
}
