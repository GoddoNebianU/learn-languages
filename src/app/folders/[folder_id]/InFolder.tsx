"use client";

import { ArrowLeft, Plus, Volume2, Edit, Trash2 } from "lucide-react";
import { Center } from "@/components/Center";
import { createTextPair, getTextPairsByFolderId } from "@/lib/controllers/TextPairController";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/cards/Container";

interface AddTextPairModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (textPair: TextPair) => void;
}

const AddTextPairModal = ({
  isOpen,
  onClose,
  onAdd,
}: AddTextPairModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-light mb-4">Add New Vocabulary</h2>
        {/* 表单内容 */}
      </div>
    </div>
  );
};

interface TextPair {
  id: number;
  text1: string;
  text2: string;
  locale1: string;
  locale2: string;
}

interface TextPairCardProps {
  textPair: TextPair;
}

const TextPairCard = ({ textPair }: TextPairCardProps) => {
  return (
    <div className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
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

          <div className="flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity">
            <button className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors">
              <Volume2 size={14} />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
              <Edit size={14} />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-sm text-gray-500 mb-1">{textPair.locale1}</div>
            <div className="text-gray-900">{textPair.text1}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">{textPair.locale2}</div>
            <div className="text-gray-900">{textPair.text2}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function InFolder({ folderId }: { folderId: number }) {
  const [textPairs, setTextPairs] = useState<TextPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchTextPairs = async () => {
      setLoading(true);
      try {
        const data = await getTextPairsByFolderId(folderId);
        setTextPairs(data as TextPair[]);
      } catch (error) {
        console.error("Failed to fetch text pairs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTextPairs();
  }, [folderId]);

  return (
    <Center>
      <Container className="p-6">
        <div className="mb-6">
          <button
            onClick={router.back}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Back to folders</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-light text-gray-900">Vocabulary</h1>
              <p className="text-sm text-gray-500 mt-1">
                {textPairs.length} items
              </p>
            </div>

            <button
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => {
                setOpen(true);
              }}
            >
              <Plus size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-gray-500">Loading vocabulary...</p>
            </div>
          ) : textPairs.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-gray-500 mb-2">No vocabulary items</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {textPairs.map((textPair) => (
                <TextPairCard key={textPair.id} textPair={textPair} />
              ))}
            </div>
          )}
        </div>
      </Container>
      <AddTextPairModal
        isOpen={open}
        onClose={function (): void {
          throw new Error("Function not implemented.");
        }}
        onAdd={function (textPair: TextPair): void {
          throw new Error("Function not implemented.");
        }}
      ></AddTextPairModal>
    </Center>
  );
}
