import type { DayMeta, LessonMeta } from "./types";

// 공개 상태 — "콘텐츠가 있는가"와 "학생에게 열려 있는가"는 다른 문제다.
//
//   status  (ready / coming-soon)  콘텐츠 제작 상태. 개발·운영 내부용.
//   release (open / scheduled / hidden)  학생에게 지금 열려 있는가. 학생 화면은 이것만 본다.
//
// 학생에게는 "미완성"이 아니라 "아직 진도 전"으로 보여야 하므로,
// 화면 문구는 전부 release에서 나온다. status는 학생 화면에 절대 노출하지 않는다.

export type ReleaseStatus =
  /** 지금 들어갈 수 있다. */
  | "open"
  /** 커리큘럼에는 보이지만 아직 진도 전. 자물쇠 + "오픈 예정". */
  | "scheduled"
  /** 학생에게 아예 보이지 않는다(내부 준비용). 강사·관리자에게만 보인다. */
  | "hidden";

/** 명시하지 않은 Day/Lesson은 잠긴 쪽으로 둔다 — 실수로 열리는 것보다 낫다. */
export const DEFAULT_RELEASE: ReleaseStatus = "scheduled";

export const RELEASE_LABEL: Record<ReleaseStatus, string> = {
  open: "학습 가능",
  scheduled: "오픈 예정",
  hidden: "비공개 (강사 전용)",
};

/** 학생에게 보여줄 안내. "미완성"·"오류"·"권한 없음" 같은 표현은 쓰지 않는다. */
export const SCHEDULED_NOTICE = {
  badge: "오픈 예정",
  heading: "아직 오픈 전인 수업입니다",
  body: "현재 진도에 맞춰 순차적으로 공개됩니다.",
  hint: "수업 일정에 따라 순차 공개됩니다.",
} as const;

export interface ReleaseView {
  status: ReleaseStatus;
  /** 목록·카드에 그릴지. hidden은 학생에게 그리지 않는다. */
  visible: boolean;
  /** 안으로 들어갈 수 있는지. */
  canEnter: boolean;
  /** 자물쇠와 "오픈 예정"을 붙일지. */
  locked: boolean;
}

/**
 * 강사·관리자는 잠금과 무관하게 전부 확인할 수 있어야 한다(수업 준비를 해야 하므로).
 * 잠금은 학생 화면을 정돈하기 위한 것이지 보안 장치가 아니다 —
 * 실제 데이터 접근 통제는 DB의 RLS가 한다.
 */
export function viewRelease(status: ReleaseStatus, isStaff: boolean): ReleaseView {
  if (isStaff) return { status, visible: true, canEnter: true, locked: status !== "open" };
  if (status === "hidden") return { status, visible: false, canEnter: false, locked: true };
  if (status === "scheduled") return { status, visible: true, canEnter: false, locked: true };
  return { status, visible: true, canEnter: true, locked: false };
}

export function dayRelease(day: Pick<DayMeta, "release"> | undefined): ReleaseStatus {
  return day?.release ?? DEFAULT_RELEASE;
}

/**
 * Lesson의 실제 공개 상태.
 *
 * Day가 열려 있지 않으면 그 안의 Lesson도 열리지 않는다 — Day가 상한선이다.
 * Day가 열려 있으면 Lesson이 스스로 정한 값을 쓰고, 없으면 Day를 따른다.
 * 덕분에 "Day는 열되 4교시만 아직 잠금" 같은 운영이 데이터 한 줄로 된다.
 */
export function lessonRelease(
  day: Pick<DayMeta, "release"> | undefined,
  lesson: Pick<LessonMeta, "release"> | undefined
): ReleaseStatus {
  const parent = dayRelease(day);
  if (parent !== "open") return parent;
  return lesson?.release ?? "open";
}

/**
 * 화면에 보여줄 Day 제목. 아직 주제를 배정하지 않은 Day는 title이 빈 문자열이다 —
 * 그 자리를 "AI 마케팅 콘텐츠 생성" 같은 지어낸 제목으로 채우지 않고 "DAY N"만 쓴다.
 */
export function displayDayTitle(day: Pick<DayMeta, "day" | "title">): string {
  return day.title.trim() || `DAY ${day.day}`;
}

/** 화면에 보여줄 Lesson 제목. 규칙은 displayDayTitle과 같다. */
export function displayLessonTitle(lesson: Pick<LessonMeta, "lessonNumber" | "title">): string {
  return lesson.title.trim() || `Lesson ${lesson.lessonNumber}`;
}
