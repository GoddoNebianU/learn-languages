import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { CircleButton } from "@/design-system/base/button";
import { UpdateCardModal } from "./UpdateCardModal";
import { useTranslations } from "next-intl";
import type { ActionOutputCardWithNote } from "@/modules/card/card-action-dto";
import { toast } from "sonner";

interface CardItemProps {
  card: ActionOutputCardWithNote;
  isReadOnly: boolean;
  onDel: () => void;
  refreshCards: () => void;
}

export function CardItem({
  card,
  isReadOnly,
  onDel,
  refreshCards,
}: CardItemProps) {
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const t = useTranslations("deck_id");

  const fields = card.note.flds.split('\x1f');
  const field1 = fields[0] || "";
  const field2 = fields[1] || "";

  return (
    <div className="group border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="px-2 py-1 bg-gray-100 rounded-md">
              {t("card")}
            </span>
          </div>

          <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
            {!isReadOnly && (
              <>
                <CircleButton
                  onClick={() => setOpenUpdateModal(true)}
                  title={t("edit")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Edit size={14} />
                </CircleButton>
                <CircleButton
                  onClick={onDel}
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
            {field1.length > 30
              ? field1.substring(0, 30) + "..."
              : field1}
          </div>
          <div>
            {field2.length > 30
              ? field2.substring(0, 30) + "..."
              : field2}
          </div>
        </div>
      </div>
      <UpdateCardModal
        isOpen={openUpdateModal}
        onClose={() => setOpenUpdateModal(false)}
        card={card}
        onUpdated={() => {
          setOpenUpdateModal(false);
          refreshCards();
        }}
      />
    </div>
  );
}
