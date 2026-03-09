"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/design-system/base/card";
import { Input } from "@/design-system/base/input";
import { PrimaryButton } from "@/design-system/base/button";
import { VStack } from "@/design-system/layout/stack";

export default function LoginPage() {
  const t = useTranslations("auth");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && session?.user?.username && !redirectTo) {
      router.push("/folders");
    }
  }, [session, isPending, router, redirectTo]);

  const handleLogin = async () => {
    if (!username || !password) {
      toast.error(t("enterCredentials"));
      return;
    }

    setLoading(true);
    try {
      if (username.includes("@")) {
        const { error } = await authClient.signIn.email({
          email: username,
          password: password,
        });
        if (error) {
          toast.error(error.message ?? t("loginFailed"));
          return;
        }
      } else {
        const { error } = await authClient.signIn.username({
          username: username,
          password: password,
        });
        if (error) {
          toast.error(error.message ?? t("loginFailed"));
          return;
        }
      }
      router.push(redirectTo ?? "/folders");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-96">
        <CardBody>
          <VStack gap={4} align="center" justify="center">
            <h1 className="text-3xl font-bold text-center w-full">{t("title")}</h1>
            
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
              className="text-sm text-gray-500 hover:text-primary-500 self-end"
            >
              {t("forgotPassword")}
            </Link>
            
            <PrimaryButton 
              onClick={handleLogin} 
              loading={loading}
              fullWidth
            >
              {t("confirm")}
            </PrimaryButton>
            
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
