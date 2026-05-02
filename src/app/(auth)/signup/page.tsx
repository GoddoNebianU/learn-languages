"use client";

import { Suspense, useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/design-system/card";
import { Input } from "@/design-system/input";
import { Button } from "@/design-system/button";
import { LinkButton } from "@/design-system/link-button";
import { VStack } from "@/design-system/stack";

function SignUpPageInner() {
  const t = useTranslations("auth");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
    if (!username || !email || !password || !confirmPassword) {
      toast.error(t("fillAllFields"));
      return;
    }
    // Username validation
    if (username.length < 3) {
      toast.error(t("usernameTooShort"));
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error(t("usernameInvalid"));
      return;
    }
    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(t("invalidEmail"));
      return;
    }
    // Password validation
    if (password.length < 8) {
      toast.error(t("passwordTooShort"));
      return;
    }
    // Confirm password
    if (password !== confirmPassword) {
      toast.error(t("passwordsNotMatch"));
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

  const [resendLoading, setResendLoading] = useState(false);

  const handleResendVerification = async () => {
    if (!email) return;
    setResendLoading(true);
    try {
      const { error } = await authClient.sendVerificationEmail({
        email: email,
        callbackURL: "/decks",
      });
      if (error) {
        toast.error(t("resendFailed"));
      } else {
        toast.success(t("resendSuccess"));
      }
    } finally {
      setResendLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-96">
          <CardBody>
            <VStack gap={4} align="center" justify="center">
              <h1 className="w-full text-center text-2xl font-bold">{t("verifyYourEmail")}</h1>
              <p className="text-center text-gray-600">
                {t("verificationEmailSentHint", { email })}
              </p>
              <Link href="/login" className="text-primary-500 hover:underline">
                {t("backToLogin")}
              </Link>
              <Button variant="light" onClick={handleResendVerification} loading={resendLoading}>
                {t("resendVerification")}
              </Button>
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
            <h1 className="w-full text-center text-3xl font-bold">{t("signUpTitle")}</h1>

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

              <Input
                type="password"
                placeholder={t("confirmPasswordPlaceholder")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </VStack>

            <Button variant="primary" onClick={handleSignUp} loading={loading} fullWidth>
              {t("confirm")}
            </Button>

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

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p>Loading...</p>
        </div>
      }
    >
      <SignUpPageInner />
    </Suspense>
  );
}
