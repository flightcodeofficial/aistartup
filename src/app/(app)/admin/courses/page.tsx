"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, FileStack, Loader2, Plus, Trash2, Wand2 } from "lucide-react";
import { isRemoteLessonStore, lessonRepository } from "@/features/lesson-builder";
import { buildSampleLesson, SAMPLE_LESSON_ID } from "@/features/lesson-builder/sampleLesson";
import { buildGoldenLesson, GOLDEN_LESSON_ID } from "@/features/lesson-builder/goldenLesson";
import { installDay1Lesson1 } from "@/features/lesson-builder/installDay1Lesson1";
import type { LessonContent } from "@/features/lesson-builder/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { LessonUploadCard } from "@/components/admin/LessonUploadCard";

export default function AdminCoursesPage() {
  const router = useRouter();
  const [lessons, setLessons] = useState<LessonContent[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [form, setForm] = useState({ week: 2, day: 1, lesson: 1, title: "새 Lesson" });

  const refresh = useCallback(async () => {
    setLessons(await lessonRepository.listLessons());
  }, []);

  useEffect(() => {
    refresh();
    return lessonRepository.subscribe(refresh);
  }, [refresh]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const created = await lessonRepository.createLesson({
        courseId: "default-course",
        week: Number(form.week),
        day: Number(form.day),
        lesson: Number(form.lesson),
        title: form.title,
      });
      router.push(`/admin/lessons/${created.id}/edit`);
    } finally {
      setCreating(false);
    }
  };

  const handleInstallSample = async () => {
    const existing = await lessonRepository.getLesson(SAMPLE_LESSON_ID);
    if (!existing) await lessonRepository.saveLesson(buildSampleLesson());
    router.push(`/admin/lessons/${SAMPLE_LESSON_ID}/edit`);
  };

  // 실제 수업본. 이미 있으면 덮어쓰지 않고 편집 화면으로만 이동한다.
  const handleInstallDay1Lesson1 = async () => {
    setInstalling(true);
    try {
      const { id } = await installDay1Lesson1();
      router.push(`/admin/lessons/${id}/edit`);
    } finally {
      setInstalling(false);
    }
  };

  const handleInstallGolden = async () => {
    const existing = await lessonRepository.getLesson(GOLDEN_LESSON_ID);
    if (!existing) await lessonRepository.saveLesson(buildGoldenLesson());
    router.push(`/admin/lessons/${GOLDEN_LESSON_ID}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("이 Lesson을 삭제할까요?")) return;
    await lessonRepository.deleteLesson(id);
    refresh();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-8 sm:py-10">
      <div className="bg-hero-gradient rounded-3xl p-6 text-white sm:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
          <FileStack className="size-3.5" />
          Lesson Studio
        </span>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">콘텐츠를 블록으로 조립합니다</h1>
        <p className="mt-2 text-sm text-white/70">
          코딩 없이 글·이미지·HTML·퀴즈·실습 링크를 페이지에 배치해 Lesson을 만듭니다.{" "}
          {isRemoteLessonStore
            ? "저장하면 서버에 반영되어 다른 PC에서도 같은 Lesson을 편집할 수 있습니다."
            : "지금은 이 브라우저(IndexedDB)에만 저장됩니다."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            onClick={handleInstallDay1Lesson1}
            disabled={installing}
            className="gap-2 bg-white text-primary hover:bg-white/90"
          >
            {installing ? <Loader2 className="size-4 animate-spin" /> : <BookOpen className="size-4" />}
            2주차 Day1 Lesson1 열기 (실제 수업)
          </Button>
          <Button
            variant="outline"
            onClick={handleInstallGolden}
            className="gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20"
          >
            <Wand2 className="size-4" />
            GOLDEN LESSON (파일럿)
          </Button>
          <Button
            variant="outline"
            onClick={handleInstallSample}
            className="gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20"
          >
            블록 샘플 열기
          </Button>
        </div>
      </div>

      <LessonUploadCard onDone={refresh} />

      <section className="rounded-2xl border border-border bg-card p-4">
        <p className="mb-3 text-sm font-bold text-foreground">새 Lesson 만들기</p>
        <div className="grid gap-3 sm:grid-cols-4">
          <div>
            <Label htmlFor="week">주차</Label>
            <Input
              id="week"
              type="number"
              value={form.week}
              onChange={(e) => setForm({ ...form, week: Number(e.target.value) })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="day">Day</Label>
            <Input
              id="day"
              type="number"
              value={form.day}
              onChange={(e) => setForm({ ...form, day: Number(e.target.value) })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="lessonNo">Lesson</Label>
            <Input
              id="lessonNo"
              type="number"
              value={form.lesson}
              onChange={(e) => setForm({ ...form, lesson: Number(e.target.value) })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1.5"
            />
          </div>
        </div>
        <Button onClick={handleCreate} disabled={creating} className="mt-3 gap-1.5">
          {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          만들기
        </Button>
      </section>

      <section>
        <p className="mb-3 text-sm font-bold text-foreground">Lesson 목록</p>
        {lessons === null ? (
          <Skeleton className="h-20 w-full rounded-2xl" />
        ) : lessons.length === 0 ? (
          <p className="text-sm text-muted-foreground">아직 만든 Lesson이 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {lessons.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <Link href={`/admin/lessons/${l.id}/edit`} className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-foreground">{l.title}</p>
                    <Badge
                      variant="outline"
                      className={
                        l.status === "published"
                          ? "border-success/30 bg-success/10 text-success"
                          : "border-warning/30 bg-warning/10 text-warning-foreground"
                      }
                    >
                      {l.status === "published" ? "게시됨" : "작성 중"}
                    </Badge>
                    <Badge variant="outline">v{l.version}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {l.week}주차 Day{l.day} Lesson{l.lesson} · 페이지 {l.pages.length}개 ·{" "}
                    {formatRelativeTime(l.updatedAt)}
                  </p>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-danger"
                  onClick={() => handleDelete(l.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
