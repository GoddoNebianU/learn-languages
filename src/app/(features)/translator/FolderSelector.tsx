import Container from "@/components/cards/Container";
import { useEffect, useState } from "react";
import { folder } from "../../../../generated/prisma/browser";
import { getFoldersByOwner } from "@/lib/services/folderService";
import LightButton from "@/components/buttons/LightButton";
import { Folder } from "lucide-react";

interface FolderSelectorProps {
  setSelectedFolderId: (id: number) => void;
  username: string;
  cancel: () => void;
}

const FolderSelector: React.FC<FolderSelectorProps> = ({
  setSelectedFolderId,
  username,
  cancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState<folder[]>([]);

  useEffect(() => {
    getFoldersByOwner(username)
      .then(setFolders)
      .then(() => setLoading(false));
  }, []);

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
                    <Folder />
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
