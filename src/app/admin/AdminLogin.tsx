"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Shield } from "lucide-react";
import { Button } from "@/design-system/button";
import { Card } from "@/design-system/card";
import { Input } from "@/design-system/input";
import { Field } from "@/design-system/field";
import { IconButton } from "@/design-system/icon-button";
import { PageLayout } from "@/components/ui/PageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { actionAdminLogin } from "./admin-action";

interface AdminLoginProps {}

export function AdminLogin(_props: AdminLoginProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    const formData = new FormData();
    formData.set("password", password);

    startTransition(async () => {
      const result = await actionAdminLogin(formData);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <PageLayout>
      <PageHeader
        title="Admin Login"
        subtitle="Enter the admin password to access system settings"
      />

      <div className="mx-auto max-w-md">
        <Card variant="bordered" padding="md">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
              <Shield size={20} className="text-primary-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Authentication Required</h2>
              <p className="text-sm text-gray-500">Enter your admin password</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Password" errorText={error || undefined}>
              <div className="relative">
                <Input
                  variant="bordered"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  disabled={isPending}
                />
                <IconButton
                  tone="muted"
                  shape="round"
                  icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                />
              </div>
            </Field>

            <Button variant="primary" type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Please wait..." : "Login"}
            </Button>
          </form>
        </Card>
      </div>
    </PageLayout>
  );
}
