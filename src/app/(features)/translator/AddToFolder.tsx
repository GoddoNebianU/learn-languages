import LightButton from "@/components/buttons/LightButton";
import Container from "@/components/cards/Container";
import { TranslationHistorySchema } from "@/lib/interfaces";
import { useSession } from "next-auth/react";
import { Dispatch, useEffect, useState } from "react";
import z from "zod";
import { folder } from "../../../../generated/prisma/browser";
import { getFoldersByOwner } from "@/lib/services/folderService";
import { Folder } from "lucide-react";
import { createTextPair } from "@/lib/services/textPairService";
import { toast } from "sonner";

interface AddToFolderProps {
  item: z.infer<typeof TranslationHistorySchema>;
  setShow: Dispatch<React.SetStateAction<boolean>>;
}

const AddToFolder: React.FC<AddToFolderProps> = ({ item, setShow }) => {
  const session = useSession();
  const [folders, setFolders] = useState<folder[]>([]);

  useEffect(() => {
    const username = session.data!.user!.name as string;
    getFoldersByOwner(username).then(setFolders);
  }, [session.data]);

  if (session.status !== "authenticated") {
    return (
      <div className="fixed left-0 top-0 z-50 w-screen h-screen bg-black/50 flex justify-center items-center">
        <Container className="p-6">
          <div>You are not authenticated</div>;
        </Container>
      </div>
    );
  }
  return (
    <div className="fixed left-0 top-0 z-50 w-screen h-screen bg-black/50 flex justify-center items-center">
      <Container className="p-6">
        <h1>Choose a Folder to Add to</h1>
        <div className="border border-gray-200 rounded-2xl">
          {(folders.length > 0 &&
            folders.map((folder) => (
              <button
                key={folder.id}
                className="p-2 flex items-center justify-start hover:bg-gray-50 gap-2 hover:cursor-pointer w-full border-b border-gray-200"
                onClick={() => {
                  createTextPair({
                    text1: item.text1,
                    text2: item.text2,
                    locale1: item.locale1,
                    locale2: item.locale2,
                    folders: {
                      connect: {
                        id: folder.id,
                      },
                    },
                  })
                    .then(() => {
                      toast.success("Text pair added to folder");
                      setShow(false);
                    })
                    .catch(() => {
                      toast.error("Failed to add text pair to folder");
                    });
                }}
              >
                <Folder />
                {folder.id}. {folder.name}
              </button>
            ))) || <div>No folders found</div>}
        </div>
        <LightButton onClick={() => setShow(false)}>Close</LightButton>
      </Container>
    </div>
  );
};

export default AddToFolder;
