"use client";

import { ArrowLeft, Edit, Plus, Trash2, X } from "lucide-react";
import { Center } from "@/components/Center";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/cards/Container";
import {
  createTextPair,
  deleteTextPairById,
  getTextPairsByFolderId,
  updateTextPairById,
} from "@/lib/services/textPairService";
import AddTextPairModal from "./AddTextPairModal";
import TextPairCard from "./TextPairCard";
import UpdateTextPairModal from "./UpdateTextPairModal";
import { text_pairUpdateInput } from "../../../../generated/prisma/models";

export interface TextPair {
  id: number;
  text1: string;
  text2: string;
  locale1: string;
  locale2: string;
}

export default function InFolder({ folderId }: { folderId: number }) {
  const [textPairs, setTextPairs] = useState<TextPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAddModal, setAddModal] = useState(false);
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

  const refreshTextPairs = async () => {
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
              <h1 className="text-2xl font-light text-gray-900">Text Pairs</h1>
              <p className="text-sm text-gray-500 mt-1">
                {textPairs.length} items
              </p>
            </div>

            <button
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => {
                setAddModal(true);
              }}
            >
              <Plus size={18} className="text-gray-600 hover:cursor-pointer" />
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-gray-500">Loading text pairs...</p>
            </div>
          ) : textPairs.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-gray-500 mb-2">No text pair items</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {textPairs.map((textPair) => (
                <TextPairCard
                  key={textPair.id}
                  textPair={textPair}
                  onDel={() => {
                    deleteTextPairById(textPair.id);
                    refreshTextPairs();
                  }}
                  refreshTextPairs={refreshTextPairs}
                />
              ))}
            </div>
          )}
        </div>
      </Container>
      <AddTextPairModal
        isOpen={openAddModal}
        onClose={() => setAddModal(false)}
        onAdd={async (
          text1: string,
          text2: string,
          locale1: string,
          locale2: string,
        ) => {
          await createTextPair({
            text1: text1,
            text2: text2,
            locale1: locale1,
            locale2: locale2,
            folders: {
              connect: {
                id: folderId,
              },
            },
          });
          refreshTextPairs();
        }}
      />
    </Center>
  );
}
