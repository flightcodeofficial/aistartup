"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { lessonRepository } from "@/features/lesson-builder";
import type { LessonContent } from "@/features/lesson-builder/types";
import { LessonPlayer } from "@/components/lesson-player/LessonPlayer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function LessonPreviewPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = use(params);
  const [lesson, setLesson] = useState<LessonContent | null | undefined>(undefined);

  useEffect(() => {
    lessonRepository.getLesson(lessonId).then((found) => setLesson(found ?? null));
  }, [lessonId]);

  if (lesson === undefined) {
    return (
      <div className="space-y-3 p-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">Lesson을 찾을 수 없습니다.</p>
        <Button variant="link" asChild>
          <Link href="/admin/courses">Lesson 목록으로</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-border bg-card px-4 py-2">
        <Button variant="ghost" size="sm" asChild className="gap-1.5">
          <Link href={`/admin/lessons/${lesson.id}/edit`}>
            <ArrowLeft className="size-4" />
            편집으로 돌아가기
          </Link>
        </Button>
      </div>
      <LessonPlayer lesson={lesson} />
    </div>
  );
}
