import { Trash2, Pencil } from "lucide-react";
import { useState } from "react";
import { Button } from "@/design-system/button";
import { IconButton } from "@/design-system/icon-button";
import { useTranslations } from "next-intl";
import type { ActionOutputCard, CardType } from "@/modules/card/card-action-dto";
import { toast } from "sonner";
import { actionDeleteCard } from "@/modules/card/card-action";
import { EditCardModal } from "./EditCardModal";

interface CardItemProps {
  card: ActionOutputCard;
  isReadOnly: boolean;
  onDel: () => void;
  onUpdated: () => void;
}

const CARD_TYPE_KEYS: Record<CardType, "wordCard" | "phraseCard" | "sentenceCard"> = {
  WORD: "wordCard",
  PHRASE: "phraseCard",
  SENTENCE: "sentenceCard",
};

export function CardItem({ card, isReadOnly, onDel, onUpdated }: CardItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const t = useTranslations("deck_id");

  const frontText = card.word;
  const backText = card.meanings
    .map((m) => (m.partOfSpeech ? `${m.partOfSpeech}: ${m.definition}` : m.definition))
    .join("; ");

  const handleDelete = async () => {
    try {
      const result = await actionDeleteCard({ cardId: card.id });
      if (result.success) {
        toast.success(t("cardDeleted"));
        onDel();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unknown error");
    }
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className="group border-b border-gray-100 transition-colors hover:bg-gray-50">
        <div className="p-4">
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="rounded-md bg-gray-100 px-2 py-1">{t("card")}</span>
              <span className="rounded-md bg-blue-50 px-2 py-1 text-blue-600">
                {t(CARD_TYPE_KEYS[card.cardType])}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {!isReadOnly && (
                <>
                  <IconButton
                    onClick={() => setShowEditModal(true)}
                    title={t("edit")}
                    className="rounded-full text-gray-400 hover:bg-blue-50 hover:text-blue-500"
                  >
                    <Pencil size={14} />
                  </IconButton>
                  <IconButton
                    onClick={() => setShowDeleteConfirm(true)}
                    title={t("delete")}
                    className="rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </IconButton>
                </>
              )}
            </div>
          </div>
          <div className="grid w-3/4 grid-cols-2 gap-4 text-gray-900">
            <div>{frontText.length > 30 ? frontText.substring(0, 30) + "..." : frontText}</div>
            <div>{backText.length > 30 ? backText.substring(0, 30) + "..." : backText}</div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-w-sm rounded-lg bg-white p-4">
            <p className="mb-4 text-gray-700">{t("deleteConfirm")}</p>
            <div className="flex justify-end gap-2">
              <Button variant="light" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                {t("cancel")}
              </Button>
              <Button variant="light" size="sm" onClick={handleDelete}>
                {t("delete")}
              </Button>
            </div>
          </div>
        </div>
      )}

      <EditCardModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        card={card}
        onUpdated={onUpdated}
      />
    </>
  );
}
