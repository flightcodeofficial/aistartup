"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Layers,
  LayoutGrid,
  PackageOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageSlideFrame } from "./PageSlideFrame";
import { useProgressStore, lessonPageKey } from "@/features/progress/store";
import { lessonContentAssetPath } from "@/lib/lessonContentPaths";
import type { LessonContentPage } from "@/lib/lessonContent";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export interface LessonPageViewerLessonOption {
  lessonNumber: number;
  title: string;
  /** 아직 콘텐츠(manifest)가 없는 Lesson은 비활성으로 표시한다. */
  hasContent: boolean;
  /** 그 Lesson의 첫 페이지 번호. Lesson마다 페이지 번호가 1부터 시작한다는
   *  보장이 없어서(하루 전체를 이어 매기는 경우) "Lesson 이동"은 이 번호로 이동한다. */
  firstPageNumber: number;
}

export function LessonPageViewer({
  week,
  day,
  lesson,
  lessonTitle,
  pages,
  currentPageNumber,
  currentFile,
  currentPageTitle,
  prevPageNumber,
  nextPageNumber,
  pageExists,
  otherLessons,
}: {
  week: number;
  day: number;
  lesson: number;
  lessonTitle: string;
  /** 이 Lesson의 전체 페이지 목록(pageNumber 오름차순). */
  pages: LessonContentPage[];
  currentPageNumber: number;
  currentFile?: string;
  currentPageTitle?: string;
  prevPageNumber?: number;
  nextPageNumber?: number;
  pageExists: boolean;
  otherLessons: LessonPageViewerLessonOption[];
}) {
  const router = useRouter();
  const key = lessonPageKey(week, day, lesson);
  const visitLessonPage = useProgressStore((s) => s.visitLessonPage);
  const visitedPages = useProgressStore((s) => s.getLessonPageProgress(key).visitedPages);

  const prevPageRef = useRef(currentPageNumber);
  const [direction, setDirection] = useState<1 | -1>(1);

  useEffect(() => {
    if (currentPageNumber !== prevPageRef.current) {
      setDirection(currentPageNumber > prevPageRef.current ? 1 : -1);
      prevPageRef.current = currentPageNumber;
    }
    visitLessonPage(key, currentPageNumber);
  }, [currentPageNumber, key, visitLessonPage]);

  const goTo = useCallback(
    (target: number | undefined) => {
      if (target === undefined) return;
      router.push(routes.lessonPage(week, day, lesson, target));
    },
    [router, week, day, lesson]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(nextPageNumber);
      if (e.key === "ArrowLeft") goTo(prevPageNumber);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goTo, nextPageNumber, prevPageNumber]);

  const pageIndex = pages.findIndex((p) => p.pageNumber === currentPageNumber);
  const positionLabel = pageIndex >= 0 ? pageIndex + 1 : 1;
  const totalInLesson = pages.length > 0 ? pages.length : 1;
  const visitedCount = visitedPages.filter((p) => pages.some((entry) => entry.pageNumber === p)).length;
  const progressPercent = pages.length > 0 ? Math.round((visitedCount / pages.length) * 100) : 0;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <Layers className="size-3.5" />
            Lesson {lesson} · {lessonTitle}
          </p>
          {currentPageTitle && <p className="mt-0.5 text-sm font-medium text-foreground">{currentPageTitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Layers className="size-3.5" />
                Lesson 이동
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {otherLessons.map((l) => (
                <DropdownMenuItem
                  key={l.lessonNumber}
                  disabled={!l.hasContent}
                  onClick={() => router.push(routes.lessonPage(week, day, l.lessonNumber, l.firstPageNumber))}
                >
                  Lesson {l.lessonNumber} · {l.title}
                  {!l.hasContent && " (준비 중)"}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <LayoutGrid className="size-3.5" />
                페이지 목록
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Lesson {lesson} 페이지 목록</SheetTitle>
              </SheetHeader>
              <div className="scrollbar-thin mt-2 flex-1 space-y-1 overflow-y-auto px-4 pb-4">
                {pages.length === 0 && (
                  <p className="px-3 py-2 text-sm text-muted-foreground">아직 페이지가 없습니다.</p>
                )}
                {pages.map((p) => {
                  const isVisited = visitedPages.includes(p.pageNumber);
                  const isCurrent = p.pageNumber === currentPageNumber;
                  return (
                    <button
                      key={p.pageNumber}
                      onClick={() => goTo(p.pageNumber)}
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
                        Page {p.pageNumber}
                        {p.title ? ` · ${p.title}` : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {pageExists && currentFile ? (
        <PageSlideFrame
          src={lessonContentAssetPath(week, day, lesson, currentFile)}
          title={`${lessonTitle} · Page ${currentPageNumber}`}
          page={currentPageNumber}
          direction={direction}
        />
      ) : (
        <div className="mx-auto flex aspect-video w-full max-w-5xl flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/30 text-center">
          <PackageOpen className="size-10 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Page {currentPageNumber} 콘텐츠 준비 중</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            이 페이지는 아직 채워지지 않았습니다. 콘텐츠가 등록되면 자동으로 표시됩니다.
          </p>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-5xl items-center gap-3">
        <Button
          variant="outline"
          onClick={() => goTo(prevPageNumber)}
          disabled={prevPageNumber === undefined}
          className="gap-1.5"
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>

        <div className="flex-1">
          <Progress value={progressPercent} className="h-1.5" />
          <p className="mt-1 text-center text-xs text-muted-foreground">
            Page {positionLabel} / {totalInLesson} · {progressPercent}% 방문
          </p>
        </div>

        <Button onClick={() => goTo(nextPageNumber)} disabled={nextPageNumber === undefined} className="gap-1.5">
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
