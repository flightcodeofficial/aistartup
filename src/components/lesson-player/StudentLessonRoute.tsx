"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useStudentLesson } from "@/features/lesson-builder/publishedLesson";
import { LessonPlayer } from "./LessonPlayer";
import {
  LessonPageViewer,
  type LessonPageViewerLessonOption,
} from "@/components/lesson-content/LessonPageViewer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/lib/routes";

// 학생용 Lesson 화면의 분기점.
//
//   게시된 Block Lesson이 있으면  → LessonPlayer (블록 렌더링)
//   없으면                        → 기존 HTML manifest 뷰어 (legacy fallback)
//
// 서버 컴포넌트는 legacy 자료(manifest/파일 존재 여부)만 계산해서 넘기고,
// "무엇을 보여줄지"는 여기서 정한다. 저장소가 브라우저(IndexedDB)에 있어서
// 서버가 미리 알 수 없기 때문이다.
//
// 관리자 Studio UI(편집 버튼, Draft 배지 등)는 이 경로에 절대 나오지 않는다.

/** lib/lessonContent.ts의 LessonContentPage와 같은 모양.
 *  그 파일은 node:fs를 쓰므로 클라이언트에서 import하지 않고 구조만 옮겨 적는다. */
interface LegacyManifestPage {
  pageNumber: number;
  file: string;
  title: string;
}

export interface StudentLessonRouteProps {
  week: number;
  day: number;
  lesson: number;
  pageNumber: number;
  legacy: {
    lessonTitle: string;
    pages: LegacyManifestPage[];
    currentFile?: string;
    currentPageTitle?: string;
    prevPageNumber?: number;
    nextPageNumber?: number;
    pageExists: boolean;
    hasPage: boolean;
    otherLessons: LessonPageViewerLessonOption[];
  };
}

export function StudentLessonRoute({
  week,
  day,
  lesson,
  pageNumber,
  legacy,
}: StudentLessonRouteProps) {
  const state = useStudentLesson(week, day, lesson);

  // 페이지를 넘길 때마다 주소를 맞춰줘서 새로고침·북마크·공유가 그대로 동작하게 한다.
  // Next 라우터 대신 history를 직접 쓰는 이유: 서버 왕복 없이 주소만 바꾸면 되기 때문.
  const syncUrl = useCallback(
    (page: number) => {
      const url = routes.lessonPage(week, day, lesson, page);
      if (typeof window !== "undefined" && window.location.pathname !== url) {
        // Next 라우터가 history.state에 자기 정보를 넣어둔다. null로 덮으면
        // 뒤로가기로 돌아왔을 때 엉뚱한 페이지가 복원되므로 기존 state를 그대로 넘긴다.
        window.history.replaceState(window.history.state, "", url);
      }
    },
    [week, day, lesson]
  );

  if (state.status === "loading") {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-6 sm:px-8">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-[60vh] w-full rounded-2xl" />
      </div>
    );
  }

  if (state.status === "block") {
    const total = state.lesson.pages.length;
    // 범위를 벗어난 deep link는 가장 가까운 유효 페이지로 붙인다(죽은 링크 방지).
    const index = Math.min(Math.max(pageNumber, 1), total) - 1;
    return (
      <LessonPlayer lesson={state.lesson} initialPageIndex={index} onPageChange={syncUrl} />
    );
  }

  // 여기부터 legacy fallback.
  if (!legacy.hasPage) {
    const first = legacy.pages[0]?.pageNumber ?? 1;
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-sm font-semibold text-foreground">페이지를 찾을 수 없습니다.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          이 Lesson에는 {pageNumber}페이지가 없습니다.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={routes.lessonPage(week, day, lesson, first)}>첫 페이지로 가기</Link>
        </Button>
      </div>
    );
  }

  return (
    <LessonPageViewer
      week={week}
      day={day}
      lesson={lesson}
      lessonTitle={legacy.lessonTitle}
      pages={legacy.pages}
      currentPageNumber={pageNumber}
      currentFile={legacy.currentFile}
      currentPageTitle={legacy.currentPageTitle}
      prevPageNumber={legacy.prevPageNumber}
      nextPageNumber={legacy.nextPageNumber}
      pageExists={legacy.pageExists}
      otherLessons={legacy.otherLessons}
    />
  );
}
