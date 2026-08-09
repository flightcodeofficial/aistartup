"use client";

import type { ReactNode } from "react";
import type { DayMeta, LessonMeta } from "@/features/curriculum/types";
import { useLessonRelease } from "@/features/curriculum/useRelease";
import { routes } from "@/lib/routes";
import { ScheduledNotice, StaffUnlockNotice } from "./ScheduledNotice";

// Lesson 안쪽 화면(STEP, Block Lesson 페이지)의 출입구.
//
// 카드에서 막는 것만으로는 부족하다 — 주소를 직접 치거나 예전 링크를 눌러
// 들어올 수 있으므로 실제 화면에서도 막는다.

export function LessonGate({
  day,
  lesson,
  children,
}: {
  day: DayMeta | undefined;
  lesson: LessonMeta | undefined;
  children: ReactNode;
}) {
  const release = useLessonRelease(day, lesson);

  if (!release.canEnter) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
        <ScheduledNotice
          title={
            lesson
              ? `Lesson ${lesson.lessonNumber} · ${lesson.title}`
              : (day?.title ?? "예정된 수업")
          }
          goal={lesson?.goal ?? day?.goal}
          backHref={day ? routes.day(day.week, day.day) : "/dashboard"}
        />
      </div>
    );
  }

  return (
    <>
      {release.locked && (
        <div className="mx-auto max-w-4xl px-4 pt-4 sm:px-8">
          <StaffUnlockNotice label="Lesson" />
        </div>
      )}
      {children}
    </>
  );
}
