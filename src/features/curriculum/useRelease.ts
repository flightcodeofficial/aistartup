"use client";

import { useAuth } from "@/features/auth/AuthProvider";
import { isStaff } from "@/features/auth/types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { dayRelease, lessonRelease, viewRelease, type ReleaseView } from "./release";
import type { DayMeta, LessonMeta } from "./types";

/**
 * 지금 보는 사람이 강사·관리자인가.
 *
 * 로컬 모드(Supabase 키 없음)에는 역할 개념이 없다. StaffOnly·Sidebar와 같은 기준을 써서
 * 화면마다 판정이 갈리지 않게 한다.
 */
export function useIsStaff(): boolean {
  const { state } = useAuth();
  if (!isSupabaseConfigured) return true;
  return state.status === "signed-in" && isStaff(state.user.role);
}

export function useDayRelease(day: Pick<DayMeta, "release"> | undefined): ReleaseView {
  return viewRelease(dayRelease(day), useIsStaff());
}

export function useLessonRelease(
  day: Pick<DayMeta, "release"> | undefined,
  lesson: Pick<LessonMeta, "release"> | undefined
): ReleaseView {
  return viewRelease(lessonRelease(day, lesson), useIsStaff());
}
