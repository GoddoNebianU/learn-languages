import { verifyAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { AdminLogin } from "./AdminLogin";
import { AdminSettings } from "./AdminSettings";

export default async function AdminPage() {
  const isAuthenticated = await verifyAdminSession();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
  const tier = config?.tier ?? "SINGLE";
  const services = (config?.services ?? {}) as Record<string, unknown>;

  const tierCaps = await prisma.tierCapability.findUnique({ where: { tier } });
  const allTiers = await prisma.tierCapability.findMany({ orderBy: { tier: "asc" } });

  const llm = (services.llm ?? {}) as Record<string, string>;
  const tts = (services.tts ?? {}) as Record<string, string>;
  const smtp = (services.smtp ?? {}) as Record<string, unknown>;

  const initialSettings = {
    tier,
    allTiers: allTiers.map((t) => ({
      tier: t.tier,
      capabilities: {
        signup: t.signup,
        userProfile: t.userProfile,
        social: t.social,
        email: t.email,
      },
    })),
    capabilities: {
      signup: tierCaps?.signup ?? true,
      userProfile: tierCaps?.userProfile ?? true,
      social: tierCaps?.social ?? true,
      email: tierCaps?.email ?? true,
    },
    services: {
      llm: {
        apiKey: llm.apiKey ?? "",
        apiUrl: llm.apiUrl ?? "https://api.deepseek.com/chat/completions",
        modelName: llm.modelName ?? "deepseek-v3",
      },
      tts: { apiKey: tts.apiKey ?? "" },
      smtp: {
        host: (smtp.host as string) ?? "",
        port: (smtp.port as number) ?? 587,
        secure: (smtp.secure as boolean) ?? false,
        user: (smtp.user as string) ?? "",
        pass: (smtp.pass as string) ?? "",
        from: (smtp.from as string) ?? "",
      },
    },
  };

  return <AdminSettings initialSettings={initialSettings} />;
}
