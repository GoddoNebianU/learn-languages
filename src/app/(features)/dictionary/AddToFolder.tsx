"use client";

import { LightButton } from "@/components/ui/buttons";
import Container from "@/components/ui/Container";
import { useEffect, useState } from "react";
import { Folder } from "../../../../generated/prisma/browser";
import { getFoldersByUserId } from "@/lib/server/services/folderService";
import { Folder as Fd } from "lucide-react";
import { createPair } from "@/lib/server/services/pairService";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface AddToFolderProps {
  definitionLang: string;
  queryLang: string;
  standardForm: string;
  definition: string;
  ipa?: string;
  setShow: (show: boolean) => void;
}

const AddToFolder: React.FC<AddToFolderProps> = ({
  definitionLang,
  queryLang,
  standardForm,
  definition,
  ipa,
  setShow,
}) => {
  const { data: session } = authClient.useSession();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    const userId = session.user.id as string;
    getFoldersByUserId(userId)
      .then(setFolders)
      .then(() => setLoading(false));
  }, [session]);

  if (!session) {
    return null;
  }

  return (
    <div className="fixed left-0 top-0 z-50 w-screen h-screen bg-black/50 flex justify-center items-center">
      <Container className="p-6">
        <h1 className="text-xl font-bold mb-4">选择文件夹保存</h1>
        <div className="border border-gray-200 rounded-2xl">
          {loading ? (
            <span>加载中...</span>
          ) : folders.length > 0 ? (
            folders.map((folder) => (
              <button
                key={folder.id}
                className="p-2 flex items-center justify-start hover:bg-gray-50 gap-2 hover:cursor-pointer w-full border-b border-gray-200"
                onClick={() => {
                  createPair({
                    text1: standardForm,
                    text2: definition,
                    language1: queryLang,
                    language2: definitionLang,
                    ipa1: ipa || undefined,
                    folder: {
                      connect: {
                        id: folder.id,
                      },
                    },
                  })
                    .then(() => {
                      toast.success(`已保存到文件夹：${folder.name}`);
                      setShow(false);
                    })
                    .catch(() => {
                      toast.error("保存失败，请稍后重试");
                    });
                }}
              >
                <Fd />
                {folder.name}
              </button>
            ))
          ) : (
            <div className="p-4 text-gray-500">暂无文件夹</div>
          )}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <LightButton onClick={() => setShow(false)}>关闭</LightButton>
        </div>
      </Container>
    </div>
  );
};

export default AddToFolder;
