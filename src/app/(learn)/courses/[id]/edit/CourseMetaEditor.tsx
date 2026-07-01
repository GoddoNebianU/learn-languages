"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/design-system/button";
import { Input } from "@/design-system/input";
import { Textarea } from "@/design-system/textarea";
import { Select } from "@/design-system/select";
import { Card } from "@/design-system/card";
import { Field } from "@/design-system/field";
import { VStack, HStack } from "@/design-system/stack";
import { Badge } from "@/design-system/badge";
import { actionUpdateCourse } from "@/modules/course/course-action";
import type { ActionOutputCourse, ActionOutputChapter } from "@/modules/course/course-action-dto";

export function CourseMetaEditor({
  course,
  onSaved,
}: {
  course: ActionOutputCourse;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description);
  const [language, setLanguage] = useState(course.language);
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">(course.visibility);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const result = await actionUpdateCourse({
      courseId: course.id,
      title: title.trim(),
      description,
      language,
      visibility,
    });
    if (result.success) toast.success("Course saved");
    else toast.error(result.message);
    setSaving(false);
    onSaved();
  };

  return (
    <Card variant="bordered" padding="md">
      <VStack gap={3} align="stretch">
        <h2 className="text-lg font-bold text-gray-900">Course Settings</h2>
        <Field label="Title" required>
          <Input variant="bordered" value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="Description">
          <Textarea variant="bordered" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <HStack gap={2} align="end">
          <Field label="Language" className="flex-1">
            <Input variant="bordered" value={language} onChange={(e) => setLanguage(e.target.value)} />
          </Field>
          <Field label="Visibility" className="w-40">
            <Select variant="bordered" value={visibility} onChange={(e) => setVisibility(e.target.value as "PUBLIC" | "PRIVATE")}>
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </Select>
          </Field>
        </HStack>
        <HStack justify="between" align="center">
          <Badge variant="neutral">ID: {course.id}</Badge>
          <Button variant="primary" onClick={handleSave} loading={saving}>Save Course</Button>
        </HStack>
      </VStack>
    </Card>
  );
}

export function ChapterTitleEditor({
  chapter,
  saving,
  onSave,
}: {
  chapter: ActionOutputChapter;
  saving: boolean;
  onSave: (title: string) => Promise<void>;
}) {
  const [title, setTitle] = useState(chapter.title);

  return (
    <Card variant="bordered" padding="md">
      <VStack gap={3} align="stretch">
        <h2 className="text-lg font-bold text-gray-900">Edit Chapter</h2>
        <Field label="Chapter Title" required>
          <Input variant="bordered" value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <HStack justify="end">
          <Button variant="primary" disabled={!title.trim()} loading={saving} onClick={() => onSave(title.trim())}>
            Save Chapter
          </Button>
        </HStack>
      </VStack>
    </Card>
  );
}
