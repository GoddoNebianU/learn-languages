"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/design-system/card";
import { Input } from "@/design-system/input";
import { Button } from "@/design-system/button";
import { VStack } from "@/design-system/stack";
import { actionRequestPasswordReset } from "@/modules/auth/forgot-password-action";

export default function ForgotPasswordPage() {
  if (process.env.NEXT_PUBLIC_AUTH_MODE === "single") notFound();
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
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-96">
          <CardBody>
            <VStack gap={4} align="center" justify="center">
              <h1 className="w-full text-center text-2xl font-bold">{t("checkYourEmail")}</h1>
              <p className="text-center text-gray-600">{t("resetPasswordEmailSentHint")}</p>
              <Link href="/login" className="text-primary-500 hover:underline">
                {t("backToLogin")}
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
            <h1 className="w-full text-center text-3xl font-bold">{t("forgotPassword")}</h1>
            <p className="text-center text-sm text-gray-600">{t("forgotPasswordHint")}</p>
            <VStack gap={0} align="center" justify="center" className="w-full">
              <Input
                type="email"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </VStack>
            <Button variant="primary" onClick={handleResetRequest} loading={loading} fullWidth>
              {t("sendResetEmail")}
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
