"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Save,
  LogOut,
  Loader2,
  Mail,
  Volume2,
  Server,
  Shield,
  ToggleLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/design-system/button";
import { Card } from "@/design-system/card";
import { Input } from "@/design-system/input";
import { Select } from "@/design-system/select";
import { PageLayout } from "@/components/ui/PageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { useCapabilityStore, type CapabilityState } from "@/lib/capability-store";
import { actionAdminLogout, actionUpdateAdminSettings } from "./admin-action";
import type { DeploymentTier } from "../../../generated/prisma/enums";

interface AdminSettingsProps {
  initialSettings: {
    tier: DeploymentTier;
    capabilities: { signup: boolean; userProfile: boolean; social: boolean; email: boolean };
    services: {
      llm: { apiKey: string; apiUrl: string; modelName: string };
      tts: { apiKey: string };
      smtp: { host: string; port: number; secure: boolean; user: string; pass: string; from: string };
    };
  };
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card variant="bordered" padding="md">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-gray-500">{icon}</span>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <Input
          variant="bordered"
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <Input
        variant="bordered"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
      />
      <div>
        <span className="text-sm font-medium text-gray-900">{label}</span>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </label>
  );
}

export function AdminSettings({ initialSettings }: AdminSettingsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [tier, setTier] = useState<DeploymentTier>(initialSettings.tier);
  const [caps, setCaps] = useState(initialSettings.capabilities);
  const [llm, setLlm] = useState(initialSettings.services.llm);
  const [tts, setTts] = useState(initialSettings.services.tts);
  const [smtp, setSmtp] = useState(initialSettings.services.smtp);

  function updateLlm(key: keyof typeof llm, value: string) {
    setLlm((prev) => ({ ...prev, [key]: value }));
  }

  function updateSmtp(key: keyof typeof smtp, value: string | boolean | number) {
    setSmtp((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    startTransition(async () => {
      const result = await actionUpdateAdminSettings({
        tier,
        capabilities: caps,
        services: { llm, tts, smtp },
      });

      if (result.success) {
        useCapabilityStore.getState().updateAll(tier, {
          signup: caps.signup,
          userProfile: caps.userProfile,
          social: caps.social,
          email: caps.email,
        });
        router.refresh();
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleLogout() {
    startTransition(async () => {
      await actionAdminLogout();
      router.refresh();
    });
  }

  return (
    <PageLayout>
      <PageHeader title="System Settings" subtitle="Manage deployment tier, features, and service configurations" />

      <div className="max-w-2xl space-y-6">
        <SectionCard icon={<Shield size={20} />} title="Deployment Tier">
          <div className="space-y-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Tier</label>
            <Select
              variant="bordered"
              value={tier}
              onChange={(e) => setTier(e.target.value as DeploymentTier)}
            >
              <option value="SINGLE">Single User</option>
              <option value="MULTI">Multi User</option>
            </Select>
            <p className="text-xs text-gray-500">
              {tier === "SINGLE"
                ? "Single user mode: no login required, all features available to admin"
                : "Multi user mode: registration, authentication, and social features"}
            </p>
          </div>
        </SectionCard>

        <SectionCard icon={<ToggleLeft size={20} />} title="Feature Flags">
          <div className="space-y-3">
            <ToggleField
              label="User Registration"
              description="Allow users to sign up and log in"
              checked={caps.signup}
              onChange={(v) => setCaps((p) => ({ ...p, signup: v }))}
            />
            <ToggleField
              label="User Profiles"
              description="Enable user profile pages"
              checked={caps.userProfile}
              onChange={(v) => setCaps((p) => ({ ...p, userProfile: v }))}
            />
            <ToggleField
              label="Social Features"
              description="Follow system, public decks, user exploration"
              checked={caps.social}
              onChange={(v) => setCaps((p) => ({ ...p, social: v }))}
            />
            <ToggleField
              label="Email Features"
              description="Password reset, email verification"
              checked={caps.email}
              onChange={(v) => setCaps((p) => ({ ...p, email: v }))}
            />
          </div>
        </SectionCard>

        <SectionCard icon={<Server size={20} />} title="LLM Service">
          <div className="space-y-4">
            <PasswordInput
              label="API Key"
              value={llm.apiKey}
              onChange={(v) => updateLlm("apiKey", v)}
              placeholder="sk-..."
            />
            <LabeledInput
              label="API URL"
              value={llm.apiUrl}
              onChange={(v) => updateLlm("apiUrl", v)}
              placeholder="https://api.openai.com/v1/chat/completions"
            />
            <LabeledInput
              label="Model Name"
              value={llm.modelName}
              onChange={(v) => updateLlm("modelName", v)}
              placeholder="gpt-4"
            />
          </div>
        </SectionCard>

        <SectionCard icon={<Volume2 size={20} />} title="TTS Service">
          <div className="space-y-4">
            <PasswordInput
              label="API Key"
              value={tts.apiKey}
              onChange={(v) => setTts({ apiKey: v })}
              placeholder="DashScope API Key"
            />
          </div>
        </SectionCard>

        <SectionCard icon={<Mail size={20} />} title="SMTP Service">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <LabeledInput
                label="Host"
                value={smtp.host}
                onChange={(v) => updateSmtp("host", v)}
                placeholder="smtp.example.com"
              />
              <LabeledInput
                label="Port"
                value={smtp.port}
                onChange={(v) => updateSmtp("port", v)}
                type="number"
                placeholder="587"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <LabeledInput
                label="Username"
                value={smtp.user}
                onChange={(v) => updateSmtp("user", v)}
                placeholder="user@example.com"
              />
              <PasswordInput
                label="Password"
                value={smtp.pass}
                onChange={(v) => updateSmtp("pass", v)}
                placeholder="SMTP password"
              />
            </div>
            <LabeledInput
              label="From Address"
              value={smtp.from}
              onChange={(v) => updateSmtp("from", v)}
              placeholder="noreply@example.com"
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={smtp.secure}
                onChange={(e) => updateSmtp("secure", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">Use SSL/TLS</span>
            </label>
          </div>
        </SectionCard>

        <div className="flex items-center gap-4">
          <Button variant="primary" onClick={handleSave} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save All Settings
              </>
            )}
          </Button>
          <Button variant="light" onClick={handleLogout} disabled={isPending}>
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
