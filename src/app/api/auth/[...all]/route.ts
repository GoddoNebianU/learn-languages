import { auth } from "@/auth";
import { hasCapability } from "@/lib/capability";
import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse } from "next/server";

const handlers = toNextJsHandler(auth);

function disabledGuard() {
  return new NextResponse(null, { status: 404 });
}

export async function GET(...args: Parameters<typeof handlers.GET>) {
  if (!(await hasCapability("signup"))) return disabledGuard();
  return handlers.GET(...args);
}

export async function POST(...args: Parameters<typeof handlers.POST>) {
  if (!(await hasCapability("signup"))) return disabledGuard();
  return handlers.POST(...args);
}
