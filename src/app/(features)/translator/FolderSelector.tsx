import Container from "@/components/ui/Container";
import { useEffect, useState } from "react";
import { Folder } from "../../../../generated/prisma/browser";
import { getFoldersByUserId } from "@/lib/server/services/folderService";
import LightButton from "@/components/ui/buttons/LightButton";
import { Folder as Fd } from "lucide-react";

interface FolderSelectorProps {
  setSelectedFolderId: (id: number) => void;
  userId: string;
  cancel: () => void;
}

const FolderSelector: React.FC<FolderSelectorProps> = ({
  setSelectedFolderId,
  userId,
  cancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);

  useEffect(() => {
    getFoldersByUserId(userId)
      .then(setFolders)
      .then(() => setLoading(false));
  }, [userId]);

  return (
    <div
      className={`bg-black/50 fixed inset-0 z-50 flex justify-center items-center`}
    >
      <Container className="p-6">
        {(loading && <p>Loading...</p>) ||
          (folders.length > 0 && (
            <>
              <h1>Select a Folder</h1>
              <div className="m-2 border-gray-200 border rounded-2xl max-h-96 overflow-y-auto">
                {folders.map((folder) => (
                  <button
                    className="p-2 w-full flex hover:bg-gray-50 gap-2"
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
                  >
                    <Fd />
                    {folder.id}. {folder.name}
                  </button>
                ))}
              </div>
            </>
          )) || <p>No folders found</p>}
        <LightButton onClick={cancel}>Cancel</LightButton>
      </Container>
    </div>
  );
};

export default FolderSelector;
