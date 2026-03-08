"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { Card, CardBody } from "@/design-system/base/card";
import { Input } from "@/design-system/base/input";
import { PrimaryButton } from "@/design-system/base/button";
import { VStack } from "@/design-system/layout/stack";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  const session = authClient.useSession().data;
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push(redirectTo ?? "/profile");
    }
  }, [session, router, redirectTo]);

  const handleLogin = async () => {
    if (!username || !password) {
      toast.error("请输入用户名和密码");
      return;
    }

    setLoading(true);
    try {
      if (username.includes("@")) {
        await authClient.signIn.email({
          email: username,
          password: username
        });
      } else {
        await authClient.signIn.username({
          username: username,
          password: password,
        });
      }
      router.push(redirectTo ?? "/profile");
    } catch (error) {
      toast.error("登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-80">
        <CardBody>
          <VStack gap={4} align="center" justify="center">
            <h1 className="text-3xl font-bold text-center w-full">登录</h1>
            
            <VStack gap={0} align="center" justify="center" className="w-full">
              <Input
                placeholder="用户名或邮箱地址"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              
              <Input
                type="password"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </VStack>
            
            <PrimaryButton 
              onClick={handleLogin} 
              loading={loading}
              fullWidth
            >
              确认
            </PrimaryButton>
            
            <Link 
              href={"/signup" + (redirectTo ? `?redirect=${redirectTo}` : "")}
              className="text-center text-primary-500 hover:underline"
            >
              没有账号？去注册
            </Link>
          </VStack>
        </CardBody>
      </Card>
    </div>
  );
}
