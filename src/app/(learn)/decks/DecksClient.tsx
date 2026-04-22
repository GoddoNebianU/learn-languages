"use client";

import { ChevronRight, Layers, Pencil, Plus, Globe, Lock, Trash2 } from "lucide-react";
import { Button } from "@/design-system/button";
import { IconButton } from "@/design-system/icon-button";
import { Skeleton } from "@/design-system/skeleton";
import { VStack } from "@/design-system/stack";
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
      className="group flex cursor-pointer items-center justify-between border-b border-gray-200 px-5 py-4 transition-colors last:border-b-0 hover:bg-gray-50"
      onClick={() => {
        router.push(`/decks/${deck.id}`);
      }}
    >
      <div className="flex flex-1 items-center gap-4">
        <div className="shrink-0 text-primary-500">
          <Layers size={24} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold text-gray-900">{deck.name}</h3>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              {deck.visibility === "PUBLIC" ? <Globe size={12} /> : <Lock size={12} />}
              {deck.visibility === "PUBLIC" ? t("public") : t("private")}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-gray-500">
            {t("deckInfo", {
              id: deck.id,
              name: deck.name,
              totalCards: deck.cardCount ?? 0,
            })}
          </p>
        </div>
      </div>

      <div className="ml-4 flex items-center gap-1">
        <IconButton
          className="rounded-full"
          onClick={handleToggleVisibility}
          title={deck.visibility === "PUBLIC" ? t("setPrivate") : t("setPublic")}
        >
          {deck.visibility === "PUBLIC" ? <Lock size={18} /> : <Globe size={18} />}
        </IconButton>
        <IconButton className="rounded-full" onClick={handleRename}>
          <Pencil size={18} />
        </IconButton>
        <IconButton
          onClick={handleDelete}
          className="rounded-full hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 size={18} />
        </IconButton>
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

  const loadDecks = async () => {
    setLoading(true);
    const result = await actionGetDecksByUserId({ userId });
    if (result.success && result.data) {
      setDecks(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDecks();
  }, [userId]);

  const handleUpdateDeck = (deckId: number, updates: Partial<ActionOutputDeck>) => {
    setDecks((prev) => prev.map((d) => (d.id === deckId ? { ...d, ...updates } : d)));
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

      <div className="mb-4 flex gap-2">
        <Button variant="light" onClick={handleCreateDeck}>
          <Plus size={18} />
          {t("newDeck")}
        </Button>
      </div>

      <CardList>
        {loading ? (
          <VStack align="center" className="p-8">
            <Skeleton variant="circular" className="mb-3 h-8 w-8" />
            <p className="text-sm text-gray-500">{t("loading")}</p>
          </VStack>
        ) : decks.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
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
