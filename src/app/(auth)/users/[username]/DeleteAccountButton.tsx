"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/design-system/button";
import { Input } from "@/design-system/input";
import { LinkButton } from "@/design-system/link-button";
import { Modal } from "@/design-system/modal";
import { actionDeleteAccount } from "@/modules/auth/auth-action";

interface DeleteAccountButtonProps {
  username: string;
}

export function DeleteAccountButton({ username }: DeleteAccountButtonProps) {
  const t = useTranslations("user_profile");
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [confirmUsername, setConfirmUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirmUsername !== username) {
      toast.error(t("deleteAccount.usernameMismatch"));
      return;
    }

    setLoading(true);
    try {
      const result = await actionDeleteAccount();
      if (result.success) {
        toast.success(t("deleteAccount.success"));
        router.push("/");
      } else {
        toast.error(result.message || t("deleteAccount.failed"));
      }
    } catch {
      toast.error(t("deleteAccount.failed"));
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  return (
    <>
      <LinkButton
        onClick={() => setShowModal(true)}
        className="text-xs text-gray-400 hover:text-red-500"
      >
        {t("deleteAccount.button")}
      </LinkButton>

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            {t("deleteAccount.title")}
          </h2>
          
          <div className="space-y-4">
            <p className="text-gray-700">
              {t("deleteAccount.warning")}
            </p>
            
            <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
              <li>{t("deleteAccount.warningDecks")}</li>
              <li>{t("deleteAccount.warningCards")}</li>
              <li>{t("deleteAccount.warningHistory")}</li>
              <li>{t("deleteAccount.warningPermanent")}</li>
            </ul>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("deleteAccount.confirmLabel")} <span className="font-mono font-bold">{username}</span>
              </label>
              <Input
                type="text"
                value={confirmUsername}
                onChange={(e) => setConfirmUsername(e.target.value)}
                variant="bordered"
                placeholder={username}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="light" onClick={() => setShowModal(false)}>
              {t("deleteAccount.cancel")}
            </Button>
            <Button 
              variant="light" 
              onClick={handleDelete} 
              loading={loading}
              disabled={confirmUsername !== username}
            >
              {t("deleteAccount.confirm")}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
