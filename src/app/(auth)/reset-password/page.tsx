"use client";

import { Suspense, useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/design-system/card";
import { Input } from "@/design-system/input";
import { Button } from "@/design-system/button";
import { VStack } from "@/design-system/stack";

function ResetPasswordPageInner() {
  const t = useTranslations("auth");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      toast.error(t("fillAllFields"));
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t("passwordsNotMatch"));
      return;
    }

    if (password.length < 8) {
      toast.error(t("passwordTooShort"));
      return;
    }

    if (!token) {
      toast.error(t("invalidToken"));
      return;
    }

    setLoading(true);
    const { error } = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    if (error) {
      toast.error(error.message ?? t("resetPasswordFailed"));
    } else {
      setSuccess(true);
      toast.success(t("resetPasswordSuccess"));
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-96">
          <CardBody>
            <VStack gap={4} align="center" justify="center">
              <h1 className="w-full text-center text-2xl font-bold">
                {t("resetPasswordSuccessTitle")}
              </h1>
              <p className="text-center text-gray-600">{t("resetPasswordSuccessHint")}</p>
              <Link href="/login" className="text-primary-500 hover:underline">
                {t("backToLogin")}
              </Link>
            </VStack>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-96">
          <CardBody>
            <VStack gap={4} align="center" justify="center">
              <h1 className="w-full text-center text-2xl font-bold">{t("invalidToken")}</h1>
              <p className="text-center text-gray-600">{t("invalidTokenHint")}</p>
              <Link href="/forgot-password" className="text-primary-500 hover:underline">
                {t("requestNewToken")}
              </Link>
            </VStack>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-96">
        <CardBody>
          <VStack gap={4} align="center" justify="center">
            <h1 className="w-full text-center text-3xl font-bold">{t("resetPassword")}</h1>
            <VStack gap={0} align="center" justify="center" className="w-full">
              <Input
                type="password"
                placeholder={t("newPassword")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder={t("confirmPassword")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </VStack>
            <Button variant="primary" onClick={handleResetPassword} loading={loading} fullWidth>
              {t("resetPassword")}
            </Button>
            <Link href="/login" className="text-center text-primary-500 hover:underline">
              {t("backToLogin")}
            </Link>
          </VStack>
        </CardBody>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p>Loading...</p>
        </div>
      }
    >
      <ResetPasswordPageInner />
    </Suspense>
  );
}
