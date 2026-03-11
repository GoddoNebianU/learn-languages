"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/design-system/base/card";
import { Input } from "@/design-system/base/input";
import { PrimaryButton } from "@/design-system/base/button";
import { VStack } from "@/design-system/layout/stack";

export default function SignUpPage() {
  const t = useTranslations("auth");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && session?.user?.username && !redirectTo && !verificationSent) {
      router.push("/decks");
    }
  }, [session, isPending, router, redirectTo, verificationSent]);

  const handleSignUp = async () => {
    if (!username || !email || !password) {
      toast.error(t("fillAllFields"));
      return;
    }

    setLoading(true);
    try {
      const { error } = await authClient.signUp.email({
        email: email,
        name: username,
        username: username,
        password: password,
      });
      if (error) {
        toast.error(error.message ?? t("signUpFailed"));
        return;
      }
      setVerificationSent(true);
      toast.success(t("verificationEmailSent"));
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-96">
          <CardBody>
            <VStack gap={4} align="center" justify="center">
              <h1 className="text-2xl font-bold text-center w-full">
                {t("verifyYourEmail")}
              </h1>
              <p className="text-center text-gray-600">
                {t("verificationEmailSentHint", { email })}
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
            <h1 className="text-3xl font-bold text-center w-full">{t("signUpTitle")}</h1>
            
            <VStack gap={0} align="center" justify="center" className="w-full">
              <Input
                placeholder={t("usernamePlaceholder")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              
              <Input
                type="email"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              
              <Input
                type="password"
                placeholder={t("passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </VStack>
            
            <PrimaryButton 
              onClick={handleSignUp} 
              loading={loading}
              fullWidth
            >
              {t("confirm")}
            </PrimaryButton>
            
            <Link 
              href={"/login" + (redirectTo ? `?redirect=${redirectTo}` : "")}
              className="text-center text-primary-500 hover:underline"
            >
              {t("hasAccountLink")}
            </Link>
          </VStack>
        </CardBody>
      </Card>
    </div>
  );
}
