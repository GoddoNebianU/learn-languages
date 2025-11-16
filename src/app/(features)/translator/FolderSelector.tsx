import Container from "@/components/cards/Container";
import { useEffect, useState } from "react";
import { folder } from "../../../../generated/prisma/browser";
import { getFoldersByOwner } from "@/lib/services/folderService";
import LightButton from "@/components/buttons/LightButton";

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
            <ul>
              {folders.map((folder) => (
                <li key={folder.id}>{folder.name}</li>
              ))}
            </ul>
          )) || <p>No folders found</p>}
        <LightButton onClick={cancel}>Cancel</LightButton>
      </Container>
    </div>
  );
};

export default FolderSelector;
