import { notFound } from "next/navigation";
import { hasCapability } from "@/lib/capability";
import { ForgotPasswordClient } from "./ForgotPasswordClient";

export default async function ForgotPasswordPage() {
  if (!(await hasCapability("email"))) notFound();
  return <ForgotPasswordClient />;
}
