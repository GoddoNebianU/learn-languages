import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/modules/shared/action-utils";
import { actionGetPublicCourses } from "@/modules/course/course-action";
import { CoursesClient } from "./CoursesClient";

export const metadata: Metadata = {
  title: "Courses | Learn Languages",
  description: "Browse, create, and enroll in language courses.",
};

export default async function CoursesPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/decks");
  }

  const publicResult = await actionGetPublicCourses();
  const publicCourses = publicResult.success ? (publicResult.data ?? []) : [];

  return <CoursesClient initialPublicCourses={publicCourses} />;
}
