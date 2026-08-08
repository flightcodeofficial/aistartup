"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  LayoutGrid,
  Layers,
} from "lucide-react";
import { motion } from "framer-motion";
import type { LessonContent } from "@/features/lesson-builder/types";
import { LessonPageRenderer } from "./LessonPageRenderer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useProgressStore, lessonPageKey } from "@/features/progress/store";
import { slidePageVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { useLessonProgressSync } from "@/features/lesson-builder/useLessonProgressSync";

// 블록 기반 Lesson용 플레이어. 기존 HTML 전용 뷰어(LessonPageViewer)와 같은
// 조작 방식(Prev/Next, 진행률, 페이지 점프, 좌우 화살표)을 유지해서
// 학생 입장에서는 콘텐츠가 어떤 방식으로 만들어졌든 똑같이 느껴지게 한다.

export function LessonPlayer({
  lesson,
  initialPageIndex = 0,
  isInstructorView = false,
  onPageChange,
}: {
  lesson: LessonContent;
  initialPageIndex?: number;
  isInstructorView?: boolean;
  /** 학생 라우트가 URL(deep link)을 현재 페이지에 맞춰 갱신할 때 쓴다. */
  onPageChange?: (pageNumber: number) => void;
}) {
  const [pageIndex, setPageIndex] = useState(initialPageIndex);
  const [direction, setDirection] = useState<1 | -1>(1);

  // 학생 입력(퀴즈·폼·회고·실습완료)을 서버와 맞춰 다른 PC에서 이어할 수 있게 한다.
  // 로컬 모드에서는 아무 일도 하지 않는다.
  useLessonProgressSync(lesson.id);

  const key = lessonPageKey(lesson.week, lesson.day, lesson.lesson);
  const visitLessonPage = useProgressStore((s) => s.visitLessonPage);
  const visitedPages = useProgressStore((s) => s.getLessonPageProgress(key).visitedPages);

  const total = lesson.pages.length;
  const current = lesson.pages[pageIndex];

  useEffect(() => {
    if (total > 0) {
      visitLessonPage(key, pageIndex + 1);
      onPageChange?.(pageIndex + 1);
    }
  }, [pageIndex, key, visitLessonPage, total, onPageChange]);

  const goTo = useCallback(
    (nextIndex: number) => {
      if (nextIndex < 0 || nextIndex >= total) return;
      setDirection(nextIndex > pageIndex ? 1 : -1);
      setPageIndex(nextIndex);
    },
    [pageIndex, total]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      // 입력 중에는 화살표가 페이지를 넘기지 않게 한다.
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (e.key === "ArrowRight") goTo(pageIndex + 1);
      if (e.key === "ArrowLeft") goTo(pageIndex - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goTo, pageIndex]);

  if (total === 0 || !current) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-8">
        <p className="text-sm text-muted-foreground">이 Lesson에는 아직 페이지가 없습니다.</p>
      </div>
    );
  }

  const visitedCount = visitedPages.filter((p) => p >= 1 && p <= total).length;
  const progressPercent = Math.round((visitedCount / total) * 100);

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 px-4 sm:px-8">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <Layers className="size-3.5" />
            {lesson.title}
            {lesson.durationMinutes ? (
              <span className="font-normal text-muted-foreground/80 normal-case">
                · {lesson.durationMinutes}분
              </span>
            ) : null}
            {lesson.status === "draft" && (
              <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] text-warning-foreground">
                Draft 미리보기
              </span>
            )}
          </p>
          <p className="mt-0.5 truncate text-sm font-medium text-foreground">{current.title}</p>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            {/* 학생이 실제로 누르는 컨트롤이라 모바일 최소 터치 타깃(44px)을 지킨다 */}
            <Button variant="outline" size="sm" className="min-h-11 gap-1.5 sm:min-h-9">
              <LayoutGrid className="size-3.5" />
              페이지 목록
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle>{lesson.title}</SheetTitle>
            </SheetHeader>
            <div className="scrollbar-thin mt-2 flex-1 space-y-1 overflow-y-auto px-4 pb-4">
              {lesson.pages.map((p, i) => {
                const isVisited = visitedPages.includes(i + 1);
                const isCurrent = i === pageIndex;
                return (
                  <button
                    key={p.id}
                    onClick={() => goTo(i)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      isCurrent ? "bg-primary/10 font-semibold text-primary" : "hover:bg-muted"
                    )}
                  >
                    {isVisited ? (
                      <CheckCircle2 className="size-4 shrink-0 text-success" />
                    ) : (
                      <Circle className="size-4 shrink-0 text-muted-foreground/40" />
                    )}
                    <span className="truncate">
                      {i + 1}. {p.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* AnimatePresence로 감싸면 나간 페이지가 DOM에 계속 남아(입력칸·iframe이 중복 누적)
          폼이 두 번 잡히고 스크린리더 순서도 깨진다. 한 번에 한 페이지만 그리고,
          key 변경으로 새로 마운트하면서 들어오는 애니메이션만 준다. */}
      <div className="min-h-[50vh]">
        <motion.div
          key={current.id}
          custom={direction}
          variants={slidePageVariants}
          initial="enter"
          animate="center"
        >
          <LessonPageRenderer page={current} isInstructorView={isInstructorView} />
        </motion.div>
      </div>

      <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 sm:px-8">
        {/* 모바일 터치 타깃 확보를 위해 최소 44px 높이를 준다 */}
        <Button
          variant="outline"
          onClick={() => goTo(pageIndex - 1)}
          disabled={pageIndex <= 0}
          // 모바일에서는 글자가 숨겨져 아이콘만 남는다 — 이름은 aria-label로 남긴다
          aria-label="이전 페이지"
          className="h-11 shrink-0 gap-1.5 px-3 sm:px-4"
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <div className="flex-1">
          <Progress value={progressPercent} className="h-1.5" />
          <p className="mt-1 text-center text-xs text-muted-foreground">
            Page {pageIndex + 1} / {total} · {progressPercent}% 방문
          </p>
        </div>

        <Button
          onClick={() => goTo(pageIndex + 1)}
          disabled={pageIndex >= total - 1}
          aria-label="다음 페이지"
          className="h-11 shrink-0 gap-1.5 px-3 sm:px-4"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
