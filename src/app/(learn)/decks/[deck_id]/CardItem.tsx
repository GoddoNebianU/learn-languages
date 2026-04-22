import { Trash2, Pencil } from "lucide-react";
import { useState } from "react";
import { Button, CircleButton } from "@/design-system/button";
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

const CARD_TYPE_KEYS: Record<CardType, string> = {
  WORD: "wordCard",
  PHRASE: "phraseCard",
  SENTENCE: "sentenceCard",
};

export function CardItem({
  card,
  isReadOnly,
  onDel,
  onUpdated,
}: CardItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const t = useTranslations("deck_id");

  const frontText = card.word;
  const backText = card.meanings.map((m) => 
    m.partOfSpeech ? `${m.partOfSpeech}: ${m.definition}` : m.definition
  ).join("; ");

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
      <div className="group border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="px-2 py-1 bg-gray-100 rounded-md">
                {t("card")}
              </span>
              <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md">
                {t(CARD_TYPE_KEYS[card.cardType])}
              </span>
            </div>

            <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
              {!isReadOnly && (
                <>
                  <CircleButton
                    onClick={() => setShowEditModal(true)}
                    title={t("edit")}
                    className="text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                  >
                    <Pencil size={14} />
                  </CircleButton>
                  <CircleButton
                    onClick={() => setShowDeleteConfirm(true)}
                    title={t("delete")}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </CircleButton>
                </>
              )}
            </div>
          </div>
          <div className="text-gray-900 grid grid-cols-2 gap-4 w-3/4">
            <div>
              {frontText.length > 30
                ? frontText.substring(0, 30) + "..."
                : frontText}
            </div>
            <div>
              {backText.length > 30
                ? backText.substring(0, 30) + "..."
                : backText}
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-sm mx-4">
            <p className="text-gray-700 mb-4">{t("deleteConfirm")}</p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                {t("cancel")}
              </Button>
              <Button
                variant="error"
                size="sm"
                onClick={handleDelete}
              >
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
