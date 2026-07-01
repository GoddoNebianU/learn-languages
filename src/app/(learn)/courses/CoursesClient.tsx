"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Globe, Lock, Search, User } from "lucide-react";
import { Button } from "@/design-system/button";
import { Input } from "@/design-system/input";
import { Badge } from "@/design-system/badge";
import { Card } from "@/design-system/card";
import { VStack, HStack } from "@/design-system/stack";
import { Skeleton } from "@/design-system/skeleton";
import { IconButton } from "@/design-system/icon-button";
import { PageLayout } from "@/components/ui/PageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  actionGetPublicCourses,
  actionGetMyCourses,
  actionSearchPublicCourses,
} from "@/modules/course/course-action";
import { actionGetEnrolledCourses } from "@/modules/course/course-enrollment-action";
import type {
  ActionOutputCourse,
  ActionOutputPublicCourse,
} from "@/modules/course/course-action-dto";

type TabKey = "explore" | "mine" | "enrolled";

interface CoursesClientProps {
  initialPublicCourses: ActionOutputPublicCourse[];
}

type CardCourse = {
  id: number;
  title: string;
  description: string;
  language: string;
  visibility: "PRIVATE" | "PUBLIC";
  userName?: string | null;
  userUsername?: string | null;
  chapterCount?: number;
};

function toCardCourse(c: ActionOutputPublicCourse | ActionOutputCourse): CardCourse {
  if ("userName" in c) {
    return {
      id: c.id,
      title: c.title,
      description: c.description,
      language: c.language,
      visibility: c.visibility,
      userName: c.userName,
      userUsername: c.userUsername,
      chapterCount: c.chapterCount,
    };
  }
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    language: c.language,
    visibility: c.visibility,
  };
}

function CourseCard({ course }: { course: CardCourse }) {
  const router = useRouter();
  const author = course.userName ?? course.userUsername ?? "Unknown";

  return (
    <Card
      variant="bordered"
      padding="md"
      clickable
      onClick={() => router.push(`/courses/${course.id}`)}
      className="flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-500">
          <BookOpen size={20} />
        </div>
        {course.visibility === "PUBLIC" ? (
          <Globe size={16} className="text-gray-400" />
        ) : (
          <Lock size={16} className="text-gray-400" />
        )}
      </div>

      <h3 className="line-clamp-2 font-semibold text-gray-900">{course.title}</h3>

      <p className="line-clamp-3 flex-1 text-sm text-gray-500">
        {course.description || "No description"}
      </p>

      <HStack gap={2} wrap>
        {course.language && <Badge variant="info">{course.language}</Badge>}
        {course.chapterCount !== undefined && (
          <Badge variant="neutral">{course.chapterCount} chapters</Badge>
        )}
      </HStack>

      <HStack gap={1} align="center" className="text-xs text-gray-400">
        <User size={12} />
        <span>{author}</span>
      </HStack>
    </Card>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button variant={active ? "primary" : "light"} size="sm" onClick={onClick}>
      {children}
    </Button>
  );
}

function CourseGrid({ courses }: { courses: CardCourse[] }) {
  if (courses.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <BookOpen size={24} className="text-gray-400" />
        </div>
        <p className="text-sm">No courses found</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}

export function CoursesClient({ initialPublicCourses }: CoursesClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("explore");
  const [publicCourses, setPublicCourses] =
    useState<ActionOutputPublicCourse[]>(initialPublicCourses);
  const [myCourses, setMyCourses] = useState<ActionOutputCourse[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<ActionOutputPublicCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const loadMyCourses = async () => {
    setLoading(true);
    const result = await actionGetMyCourses();
    if (result.success && result.data) setMyCourses(result.data);
    setLoading(false);
  };

  const loadEnrolled = async () => {
    setLoading(true);
    const result = await actionGetEnrolledCourses();
    if (result.success && result.data) setEnrolledCourses(result.data);
    setLoading(false);
  };

  const handleTabChange = (next: TabKey) => {
    setTab(next);
    if (next === "mine" && myCourses.length === 0) loadMyCourses();
    if (next === "enrolled" && enrolledCourses.length === 0) loadEnrolled();
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      const result = await actionGetPublicCourses();
      if (result.success && result.data) setPublicCourses(result.data);
      return;
    }
    setLoading(true);
    const result = await actionSearchPublicCourses({ query: searchQuery.trim() });
    if (result.success && result.data) setPublicCourses(result.data);
    setLoading(false);
  };

  const displayed = useMemo<CardCourse[]>(() => {
    if (tab === "explore") return publicCourses.map(toCardCourse);
    if (tab === "mine") return myCourses.map(toCardCourse);
    return enrolledCourses.map(toCardCourse);
  }, [tab, publicCourses, myCourses, enrolledCourses]);

  return (
    <PageLayout>
      <VStack gap={4} align="stretch">
        <PageHeader title="Courses" subtitle="Learn with structured chapters and lessons." />

        <HStack gap={2} align="center">
          <TabButton active={tab === "explore"} onClick={() => handleTabChange("explore")}>
            Explore
          </TabButton>
          <TabButton active={tab === "mine"} onClick={() => handleTabChange("mine")}>
            My Courses
          </TabButton>
          <TabButton active={tab === "enrolled"} onClick={() => handleTabChange("enrolled")}>
            Enrolled
          </TabButton>
        </HStack>

        {tab === "explore" && (
          <HStack align="center" gap={2}>
            <Input
              variant="bordered"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search public courses..."
              leftIcon={<Search size={18} />}
              containerClassName="flex-1"
            />
            <IconButton className="rounded-full" onClick={handleSearch} title="Search">
              <Search size={18} />
            </IconButton>
          </HStack>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Card key={i} variant="bordered" padding="md" className="flex flex-col gap-3">
                <Skeleton variant="text" className="w-3/4" />
                <Skeleton variant="text" />
                <Skeleton variant="text" />
              </Card>
            ))}
          </div>
        ) : (
          <CourseGrid courses={displayed} />
        )}
      </VStack>
    </PageLayout>
  );
}
