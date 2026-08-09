import type { DayMeta, LessonMeta, PracticeKind, Step, WeekMeta } from "../types";
import { week2day1 } from "./week2/day1";

/**
 * 아직 진도가 오지 않은 Day.
 *
 * 커리큘럼에는 보이되 들어갈 수는 없다(release: "scheduled").
 * status(콘텐츠 제작 상태)와 release(공개 여부)는 별개다 —
 * 콘텐츠가 다 준비돼도 진도 전이면 열지 않는다.
 */
function scheduledDay(day: number, title: string, goal: string): DayMeta {
  return { week: 2, day, title, goal, lessons: [], status: "coming-soon", release: "scheduled" };
}

export const week2: WeekMeta = {
  week: 2,
  title: "AI 기반 고객 확보 & 자동화 마케팅",
  description:
    "생성형 AI를 활용해 타깃 고객을 정의하고, 마케팅 콘텐츠와 랜딩페이지, FAQ·고객 응대 자동화까지 완성하는 주간입니다.",
  days: [
    // Day1만 열려 있다. Lesson1(1교시)만 진행했으므로 2~4교시는 따로 잠근다.
    {
      ...week2day1,
      status: "ready",
      release: "open",
      lessons: week2day1.lessons.map((lesson) => ({
        ...lesson,
        release: lesson.lessonNumber === 1 ? ("open" as const) : ("scheduled" as const),
      })),
    },
    scheduledDay(2, "DAY 2 — AI 마케팅 콘텐츠 생성", "AI로 마케팅용 카피, 이미지, 숏폼 기획안을 생성합니다."),
    scheduledDay(3, "DAY 3 — AI 랜딩페이지 제작", "AI 도구를 활용해 랜딩페이지 초안을 빠르게 제작합니다."),
    scheduledDay(4, "DAY 4 — FAQ & 고객 응대 자동화", "AI로 FAQ와 고객 응대 자동화 흐름을 구성합니다."),
    scheduledDay(5, "DAY 5 — 마케팅 자동화 통합 실습", "이번 주 결과물을 통합하고 자동화 파이프라인을 점검합니다."),
  ],
};

export const curriculum: WeekMeta[] = [week2];

export function getWeek(week: number): WeekMeta | undefined {
  return curriculum.find((w) => w.week === week);
}

export function getDay(week: number, day: number): DayMeta | undefined {
  return getWeek(week)?.days.find((d) => d.day === day);
}

/** Day 안의 모든 Step을 Lesson 순서대로 평탄화한다. Step.id/stepNumber는
 *  Lesson 경계와 무관하게 Day 안에서 전역 고유하므로, 대부분의 조회 함수는
 *  이 평탄화된 목록을 기준으로 동작한다. 컴포넌트에서 이미 가진 DayMeta로
 *  전체 Step 목록이 필요할 때도 이 함수를 그대로 쓴다(week/day 재조회 불필요). */
export function flattenSteps(dayMeta: DayMeta | undefined): Step[] {
  return dayMeta?.lessons.flatMap((l) => l.steps) ?? [];
}

export function getLesson(week: number, day: number, lessonNumber: number): LessonMeta | undefined {
  return getDay(week, day)?.lessons.find((l) => l.lessonNumber === lessonNumber);
}

/** 특정 Step이 속한 Lesson을 찾는다. 라우팅에서 lessonNumber를 URL에
 *  포함시켜야 할 때(routes.step 등) 이 함수로 역으로 조회한다. */
export function findLessonForStep(week: number, day: number, stepNumber: number): LessonMeta | undefined {
  return getDay(week, day)?.lessons.find((l) => l.steps.some((s) => s.stepNumber === stepNumber));
}

export function getStep(week: number, day: number, stepNumber: number) {
  return flattenSteps(getDay(week, day)).find((s) => s.stepNumber === stepNumber);
}

export function getStepById(stepId: string): Step | undefined {
  for (const week of curriculum) {
    for (const day of week.days) {
      const found = flattenSteps(day).find((s) => s.id === stepId);
      if (found) return found;
    }
  }
  return undefined;
}

export function getAllStepIdsForDay(week: number, day: number): string[] {
  return flattenSteps(getDay(week, day)).map((s) => s.id);
}

export function getAllStepIdsForWeek(week: number): string[] {
  return getWeek(week)?.days.flatMap((d) => flattenSteps(d).map((s) => s.id)) ?? [];
}

/** 같은 Day 안에서 beforeStepNumber보다 앞에 있는, 지정된 실습 종류의 가장 가까운 STEP을 찾는다.
 *  예: STEP3(segmentBuilder)이 STEP2(evidenceExtract)의 결과를 이어받을 때 사용.
 *  Lesson 경계를 넘나들어도 Day 전체를 stepNumber 기준으로 검색한다. */
export function findNearestStepByKind(
  week: number,
  day: number,
  beforeStepNumber: number,
  kind: PracticeKind
): Step | undefined {
  const candidates = flattenSteps(getDay(week, day))
    .filter((s) => s.stepNumber < beforeStepNumber && s.practice.kind === kind)
    .sort((a, b) => b.stepNumber - a.stepNumber);
  return candidates[0];
}

/** Day 안에서 지정된 실습 종류를 가진 첫 번째 STEP을 찾는다. (결과 아카이브에서 사용) */
export function findStepByKind(week: number, day: number, kind: PracticeKind): Step | undefined {
  return flattenSteps(getDay(week, day)).find((s) => s.practice.kind === kind);
}
