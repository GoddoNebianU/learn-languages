"use client";

import { Suspense, useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter, useSearchParams, notFound } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/design-system/card";
import { Input } from "@/design-system/input";
import { Button } from "@/design-system/button";
import { LinkButton } from "@/design-system/link-button";
import { VStack } from "@/design-system/stack";

function LoginPageInner() {
  if (process.env.NEXT_PUBLIC_AUTH_MODE === "single") notFound();
  const t = useTranslations("auth");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showResendOption, setShowResendOption] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");

  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && session?.user?.username && !redirectTo) {
      router.push("/decks");
    }
  }, [session, isPending, router, redirectTo]);

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;

    setResendLoading(true);
    try {
      const { error } = await authClient.sendVerificationEmail({
        email: unverifiedEmail,
        callbackURL: "/decks",
      });

      if (error) {
        toast.error(t("resendFailed"));
      } else {
        toast.success(t("resendSuccess"));
        setShowResendOption(false);
      }
    } finally {
      setResendLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!username) {
      toast.error(t("identifierRequired"));
      return;
    }
    if (!password) {
      toast.error(t("passwordRequired"));
      return;
    }

    setLoading(true);
    setShowResendOption(false);
    try {
      if (username.includes("@")) {
        const { error } = await authClient.signIn.email({
          email: username,
          password: password,
        });
        if (error) {
          if (error.status === 403) {
            setUnverifiedEmail(username);
            setShowResendOption(true);
            toast.error(t("emailNotVerified"));
          } else {
            toast.error(error.message ?? t("loginFailed"));
          }
          return;
        }
      } else {
        const { error } = await authClient.signIn.username({
          username: username,
          password: password,
        });
        if (error) {
          if (error.status === 403) {
            toast.error(t("emailNotVerified"));
          } else {
            toast.error(error.message ?? t("loginFailed"));
          }
          return;
        }
      }
      router.push(redirectTo ?? "/decks");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-96">
        <CardBody>
          <VStack gap={4} align="center" justify="center">
            <h1 className="w-full text-center text-3xl font-bold">{t("title")}</h1>

            <VStack gap={0} align="center" justify="center" className="w-full">
              <Input
                placeholder={t("usernameOrEmailPlaceholder")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <Input
                type="password"
                placeholder={t("passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </VStack>

            <Link
              href="/forgot-password"
              className="self-end text-sm text-gray-500 hover:text-primary-500"
            >
              {t("forgotPassword")}
            </Link>

            {showResendOption && (
              <div className="w-full rounded-lg bg-yellow-50 p-3 text-sm dark:bg-yellow-900/20">
                <p className="mb-2 text-yellow-800 dark:text-yellow-200">
                  {t("emailNotVerifiedHint")}
                </p>
                <LinkButton onClick={handleResendVerification} className="text-sm">
                  {t("resendVerification")}
                </LinkButton>
              </div>
            )}

            <Button variant="primary" onClick={handleLogin} loading={loading} fullWidth>
              {t("confirm")}
            </Button>

            <Link
              href={"/signup" + (redirectTo ? `?redirect=${redirectTo}` : "")}
              className="text-center text-primary-500 hover:underline"
            >
              {t("noAccountLink")}
            </Link>
          </VStack>
        </CardBody>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p>Loading...</p>
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}
