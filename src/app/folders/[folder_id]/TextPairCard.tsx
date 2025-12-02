import { Edit, Trash2 } from "lucide-react";
import { TextPair } from "./InFolder";
import { updateTextPairById } from "@/lib/actions/services/textPairService";
import { useState } from "react";
import { text_pairUpdateInput } from "../../../../generated/prisma/models";
import UpdateTextPairModal from "./UpdateTextPairModal";
import { useTranslations } from "next-intl";

interface TextPairCardProps {
  textPair: TextPair;
  onDel: () => void;
  refreshTextPairs: () => void;
}

export default function TextPairCard({
  textPair,
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
              {textPair.locale1.toUpperCase()}
            </span>
            <span>→</span>
            <span className="px-2 py-1 bg-gray-100 rounded-md">
              {textPair.locale2.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
            <button
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              onClick={() => setOpenUpdateModal(true)}
              title={t("edit")}
            >
              <Edit size={14} />
            </button>
            <button
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              onClick={onDel}
              title={t("delete")}
            >
              <Trash2 size={14} />
            </button>
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
        onUpdate={async (id: number, data: text_pairUpdateInput) => {
          await updateTextPairById(id, data);
          setOpenUpdateModal(false);
          refreshTextPairs();
        }}
        textPair={textPair}
      />
    </div>
  );
}
