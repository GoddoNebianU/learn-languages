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

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
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

  const handleSignUp = async () => {
    if (!username || !email || !password) {
      toast.error("请填写所有字段");
      return;
    }

    setLoading(true);
    try {
      await authClient.signUp.email({
        email: email,
        name: username,
        username: username,
        password: password,
      });
      router.push(redirectTo ?? "/profile");
    } catch (error) {
      toast.error("注册失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-80">
        <CardBody>
          <VStack gap={4} align="center" justify="center">
            <h1 className="text-3xl font-bold text-center w-full">注册</h1>
            
            <VStack gap={0} align="center" justify="center" className="w-full">
              <Input
                placeholder="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              
              <Input
                type="email"
                placeholder="邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              
              <Input
                type="password"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </VStack>
            
            <PrimaryButton 
              onClick={handleSignUp} 
              loading={loading}
              fullWidth
            >
              确认
            </PrimaryButton>
            
            <Link 
              href={"/login" + (redirectTo ? `?redirect=${redirectTo}` : "")}
              className="text-center text-primary-500 hover:underline"
            >
              已有账号？去登录
            </Link>
          </VStack>
        </CardBody>
      </Card>
    </div>
  );
}
