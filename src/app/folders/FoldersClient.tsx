"use client";

import DarkButton from "@/components/buttons/DarkButton";
import LightButton from "@/components/buttons/LightButton";
import ACard from "@/components/cards/ACard";
import { Center } from "@/components/Center";
import {
  createFolder,
  deleteFolderById,
  getFoldersWithTextPairsCountByOwner,
} from "@/lib/controllers/FolderController";
import { useEffect, useState } from "react";
import InFolder from "./InFolder";

interface Folder {
  id: number;
  name: string;
  text_pairs_count: number;
}

interface FolderProps {
  folder: Folder;
  deleteCallback: () => void;
  openCallback: () => void;
}

const FolderCard = ({ folder, deleteCallback, openCallback }: FolderProps) => {
  return (
    <div className="flex flex-row items-center justify-center border">
      <div className="flex-1">
        <div>ID: {folder.id}</div>
        <div>Name: {folder.name}</div>
        <div>Text Pairs Count: {folder.text_pairs_count}</div>
      </div>
      <DarkButton className="w-fit h-fit m-2" onClick={openCallback}>
        open
      </DarkButton>
      <DarkButton className="w-fit h-fit m-2" onClick={deleteCallback}>
        delete
      </DarkButton>
    </div>
  );
};

export default function FoldersClient({ username }: { username: string }) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [page, setPage] = useState<"folders" | "in folder">("folders");
  const [folderId, setFolderId] = useState<number>(0);

  useEffect(() => {
    getFoldersWithTextPairsCountByOwner(username).then((folders) => {
      setFolders(folders as Folder[]);
    });
  }, [username]);

  const updateFolders = async () => {
    const updatedFolders = await getFoldersWithTextPairsCountByOwner(username);
    setFolders(updatedFolders as Folder[]);
  };

  if (page === "folders")
    return (
      <Center>
        <ACard className="flex flex-col">
          <h1 className="text-4xl font-extrabold text-center">Your Folders</h1>
          <LightButton
            className="w-fit"
            onClick={async () => {
              const folderName = prompt("Enter folder name:");
              if (!folderName) return;
              await createFolder(folderName, username);
              await updateFolders();
            }}
          >
            Create Folder
          </LightButton>
          <div className="overflow-y-auto">
            {folders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                deleteCallback={() => {
                  const confirm = prompt(
                    "Input folder's name to delete this folder.",
                  );
                  if (confirm === folder.name) {
                    deleteFolderById(folder.id).then(updateFolders);
                  }
                }}
                openCallback={() => {
                  setFolderId(folder.id);
                  setPage("in folder");
                }}
              />
            ))}
          </div>
        </ACard>
      </Center>
    );
  else if (page === "in folder") {
    return <InFolder username={username} folderId={folderId} />;
  }
}
