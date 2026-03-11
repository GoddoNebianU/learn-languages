"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/design-system/base/card";
import { Input } from "@/design-system/base/input";
import { PrimaryButton } from "@/design-system/base/button";
import { VStack } from "@/design-system/layout/stack";
import { actionRequestPasswordReset } from "@/modules/auth/forgot-password-action";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResetRequest = async () => {
    if (!email) {
      toast.error(t("emailRequired"));
      return;
    }

    setLoading(true);
    const result = await actionRequestPasswordReset({ email });

    if (!result.success) {
      toast.error(result.message);
    } else {
      setSent(true);
      toast.success(result.message);
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-96">
          <CardBody>
            <VStack gap={4} align="center" justify="center">
              <h1 className="text-2xl font-bold text-center w-full">
                {t("checkYourEmail")}
              </h1>
              <p className="text-center text-gray-600">
                {t("resetPasswordEmailSentHint")}
              </p>
              <Link
                href="/login"
                className="text-primary-500 hover:underline"
              >
                {t("backToLogin")}
              </Link>
            </VStack>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-96">
        <CardBody>
          <VStack gap={4} align="center" justify="center">
            <h1 className="text-3xl font-bold text-center w-full">
              {t("forgotPassword")}
            </h1>
            <p className="text-center text-gray-600 text-sm">
              {t("forgotPasswordHint")}
            </p>
            <VStack gap={0} align="center" justify="center" className="w-full">
              <Input
                type="email"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </VStack>
            <PrimaryButton
              onClick={handleResetRequest}
              loading={loading}
              fullWidth
            >
              {t("sendResetEmail")}
            </PrimaryButton>
            <Link
              href="/login"
              className="text-center text-primary-500 hover:underline"
            >
              {t("backToLogin")}
            </Link>
          </VStack>
        </CardBody>
      </Card>
    </div>
  );
}
