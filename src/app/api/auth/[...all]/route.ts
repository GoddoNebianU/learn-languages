import { auth } from "@/auth";
import { isSingleUserMode } from "@/lib/auth-mode";
import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse } from "next/server";

const handlers = toNextJsHandler(auth);

function singleUserGuard() {
  return new NextResponse(null, { status: 404 });
}

export async function GET(...args: Parameters<typeof handlers.GET>) {
  if (isSingleUserMode()) return singleUserGuard();
  return handlers.GET(...args);
}

export async function POST(...args: Parameters<typeof handlers.POST>) {
  if (isSingleUserMode()) return singleUserGuard();
  return handlers.POST(...args);
}
