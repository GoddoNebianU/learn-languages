import { prisma } from "@/lib/db";
import { createLogger } from "@/lib/logger";
import {
  RepoInputCreateEnrollment,
  RepoInputDeleteEnrollment,
  RepoInputGetEnrollmentsByUserId,
  RepoInputCheckEnrollment,
  RepoInputGetEnrolledCourses,
  RepoOutputEnrollment,
  RepoOutputPublicCourse,
} from "./course-repository-dto";
import { mapCourseToPublicOutput } from "./course-repository";

const log = createLogger("course-repository");

// ============================================
// Enrollment
// ============================================

export async function repoCreateEnrollment(input: RepoInputCreateEnrollment): Promise<void> {
  log.debug("Creating enrollment", { userId: input.userId, courseId: input.courseId });
  await prisma.courseEnrollment.create({
    data: {
      userId: input.userId,
      courseId: input.courseId,
    },
  });
  log.info("Enrollment created", { userId: input.userId, courseId: input.courseId });
}

export async function repoDeleteEnrollment(input: RepoInputDeleteEnrollment): Promise<void> {
  log.debug("Deleting enrollment", { userId: input.userId, courseId: input.courseId });
  await prisma.courseEnrollment.deleteMany({
    where: {
      userId: input.userId,
      courseId: input.courseId,
    },
  });
  log.info("Enrollment deleted", { userId: input.userId, courseId: input.courseId });
}

export async function repoGetEnrollmentsByUserId(
  input: RepoInputGetEnrollmentsByUserId
): Promise<RepoOutputEnrollment[]> {
  log.debug("Getting enrollments by userId", { userId: input.userId });
  const enrollments = await prisma.courseEnrollment.findMany({
    where: { userId: input.userId },
    orderBy: { createdAt: "desc" },
  });

  return enrollments.map((enrollment) => ({
    id: enrollment.id,
    userId: enrollment.userId,
    courseId: enrollment.courseId,
    createdAt: enrollment.createdAt,
  }));
}

export async function repoCheckEnrollment(
  input: RepoInputCheckEnrollment
): Promise<boolean> {
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      userId_courseId: {
        userId: input.userId,
        courseId: input.courseId,
      },
    },
    select: { id: true },
  });
  return !!enrollment;
}

export async function repoGetEnrolledCourses(
  input: RepoInputGetEnrolledCourses
): Promise<RepoOutputPublicCourse[]> {
  log.debug("Getting enrolled courses with details", { userId: input.userId });
  const enrollments = await prisma.courseEnrollment.findMany({
    where: { userId: input.userId },
    include: {
      course: {
        include: {
          _count: { select: { chapters: true } },
          user: { select: { name: true, username: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return enrollments.map((enrollment) => mapCourseToPublicOutput(enrollment.course));
}
