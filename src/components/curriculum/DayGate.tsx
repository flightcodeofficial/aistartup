"use client";

import type { ReactNode } from "react";
import type { DayMeta } from "@/features/curriculum/types";
import { useDayRelease } from "@/features/curriculum/useRelease";
import { ScheduledNotice, StaffUnlockNotice } from "./ScheduledNotice";

// Day 화면의 출입구.
//
// 학생: 잠겨 있으면 "오픈 예정" 안내만 보이고 내용은 렌더링되지 않는다.
// 강사·관리자: 잠겨 있어도 내용을 보되, 학생에게는 잠겨 있다는 사실을 위에 알려준다.
//
// 서버 컴포넌트인 Day 페이지에서 역할을 알 수 없어 여기(클라이언트)에서 판정한다.

export function DayGate({ day, children }: { day: DayMeta; children: ReactNode }) {
  const release = useDayRelease(day);

  if (!release.canEnter) {
    return <ScheduledNotice title={day.title} goal={day.goal} backHref="/dashboard" />;
  }

  return (
    <>
      {release.locked && <StaffUnlockNotice label="Day" />}
      {children}
    </>
  );
}
