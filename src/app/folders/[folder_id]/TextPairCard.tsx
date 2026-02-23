import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { CircleButton } from "@/design-system/base/button/button";
import { UpdateTextPairModal } from "./UpdateTextPairModal";
import { useTranslations } from "next-intl";
import { TSharedPair } from "@/shared/folder-type";
import { actionUpdatePairById } from "@/modules/folder/folder-aciton";
import { ActionInputUpdatePairById } from "@/modules/folder/folder-action-dto";
import { toast } from "sonner";

interface TextPairCardProps {
  textPair: TSharedPair;
  isReadOnly: boolean;
  onDel: () => void;
  refreshTextPairs: () => void;
}

export function TextPairCard({
  textPair,
  isReadOnly,
  onDel,
  refreshTextPairs,
}: TextPairCardProps) {
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const t = useTranslations("folder_id");
  return (
    <div className="group border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="px-2 py-1 bg-gray-100 rounded-md">
              {textPair.language1.toUpperCase()}
            </span>
            <span>→</span>
            <span className="px-2 py-1 bg-gray-100 rounded-md">
              {textPair.language2.toUpperCase()}
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
            {textPair.text1.length > 30
              ? textPair.text1.substring(0, 30) + "..."
              : textPair.text1}
          </div>
          <div>
            {textPair.text2.length > 30
              ? textPair.text2.substring(0, 30) + "..."
              : textPair.text2}
          </div>
        </div>
      </div>
      <UpdateTextPairModal
        isOpen={openUpdateModal}
        onClose={() => setOpenUpdateModal(false)}
        onUpdate={async (id: number, data: ActionInputUpdatePairById) => {
          await actionUpdatePairById(id, data).then(result => result.success ? toast.success(result.message) : toast.error(result.message));
          setOpenUpdateModal(false);
          refreshTextPairs();
        }}
        textPair={textPair}
      />
    </div>
  );
}
