"use server";

import { auth } from "@/auth";
import { getSingleUserId } from "@/lib/auth-mode";
import { headers } from "next/headers";

export async function getCurrentUserId(): Promise<string | null> {
  if (process.env.NEXT_PUBLIC_AUTH_MODE === "single") {
    return getSingleUserId();
  }
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}
