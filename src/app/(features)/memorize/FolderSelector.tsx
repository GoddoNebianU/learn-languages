"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Folder as Fd } from "lucide-react";
import { TSharedFolderWithTotalPairs } from "@/shared/folder-type";
import { PageLayout } from "@/components/ui/PageLayout";
import { PrimaryButton } from "@/design-system/base/button/button";

interface FolderSelectorProps {
  folders: TSharedFolderWithTotalPairs[];
}

const FolderSelector: React.FC<FolderSelectorProps> = ({ folders }) => {
  const t = useTranslations("memorize.folder_selector");
  const router = useRouter();

  return (
    <PageLayout>
      {folders.length === 0 ? (
        // 空状态 - 显示提示和跳转按钮
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            {t("noFolders")}
          </h1>
          <Link href="/folders">
            <PrimaryButton className="px-6 py-2">
              Go to Folders
            </PrimaryButton>
          </Link>
        </div>
      ) : (
        <>
          {/* 页面标题 */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
            {t("selectFolder")}
          </h1>
          {/* 文件夹列表 */}
          <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
            {folders
              .toSorted((a, b) => a.id - b.id)
              .map((folder) => (
                <div
                  key={folder.id}
                  onClick={() =>
                    router.push(`/memorize?folder_id=${folder.id}`)
                  }
                  className="flex flex-row items-center p-4 gap-3 hover:cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  {/* 文件夹图标 */}
                  <div className="shrink-0">
                    <Fd className="text-gray-600" size="md" />
                  </div>
                  {/* 文件夹信息 */}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {folder.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {t("folderInfo", {
                        id: folder.id,
                        name: folder.name,
                        count: folder.total,
                      })}
                    </div>
                  </div>
                  {/* 右箭头 */}
                  <div className="text-gray-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </PageLayout>
  );
};

export { FolderSelector };
