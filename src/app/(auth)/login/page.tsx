import { Suspense } from "react";
import { notFound } from "next/navigation";
import { hasCapability } from "@/lib/capability";
import { LoginClient } from "./LoginClient";

export default async function LoginPage() {
  if (!(await hasCapability("signup"))) notFound();
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p>Loading...</p>
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
