import { Suspense } from "react";
import { notFound } from "next/navigation";
import { hasCapability } from "@/lib/capability";
import { ResetPasswordClient } from "./ResetPasswordClient";

export default async function ResetPasswordPage() {
  if (!(await hasCapability("email"))) notFound();
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p>Loading...</p>
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}
