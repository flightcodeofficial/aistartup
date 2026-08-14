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

/**
 * 실제 canonical Lesson 콘텐츠가 준비된 Day를 연다.
 * week2의 scheduledDay+release:"open" 패턴과 동일하되, week을 지정할 수 있다.
 */
function openDay(week: number, day: number, title: string, goal: string): DayMeta {
  return { week, day, title, goal, lessons: [], status: "ready", release: "open" };
}

/**
 * 아직 주제를 배정하지 않은 Day — 커리큘럼 shell만 있는 상태.
 *
 * title을 지어내지 않는다. "" 로 두면 카드·상세 화면이 "AI 마케팅 콘텐츠 생성" 같은
 * 가짜 제목 대신 "DAY N"과 "오픈 예정" 안내만 보여준다(WeekOverviewGrid, ScheduledNotice
 * 양쪽 다 title이 비어 있으면 이 규칙을 따른다).
 */
function placeholderDay(week: number, day: number): DayMeta {
  return { week, day, title: "", goal: "", lessons: [], status: "coming-soon", release: "scheduled" };
}

export const week2: WeekMeta = {
  week: 2,
  title: "AI 기반 고객·시장 검증 & 가치제안 설계",
  description:
    "생성형 AI를 활용해 타깃 고객을 정의하고, SNS·블로그·뉴스레터 콘텐츠, 이메일·DM·홍보문구, 랜딩페이지, FAQ·고객 응대 시나리오까지 완성하는 주간입니다.",
  days: [
    // Day1은 4시간(1~4교시) 전체가 열려 있다.
    {
      ...week2day1,
      status: "ready",
      release: "open",
      lessons: week2day1.lessons.map((lesson) => ({
        ...lesson,
        release: "open" as const,
      })),
    },
    {
      ...scheduledDay(2, "DAY 2 — GPT 기반 SNS·블로그·뉴스레터 자동 생성", "GPT로 SNS·블로그·뉴스레터 콘텐츠를 자동 생성합니다."),
      status: "ready",
      release: "open",
    },
    {
      ...scheduledDay(3, "DAY 3 — AI 기반 이메일·DM·홍보문구 작성", "AI로 이메일·DM·홍보문구 작성을 실습합니다."),
      status: "ready",
      release: "open",
    },
    {
      ...scheduledDay(4, "DAY 4 — AI 기반 랜딩페이지·소개페이지 제작", "AI로 랜딩페이지·소개페이지 제작을 실습합니다."),
      status: "ready",
      release: "open",
    },
    {
      ...scheduledDay(5, "DAY 5 — Notion AI 활용 고객 FAQ 및 응대 시나리오", "Notion AI로 고객 FAQ 및 응대 시나리오를 작성합니다."),
      status: "ready",
      release: "open",
    },
    openDay(2, 6, "DAY 6 — SNS에서 Blog로: Search Intent 설계", "같은 Core Message를 유지하면서, 고객이 검색해서 찾아오는 Blog 콘텐츠의 Search Intent와 Reader Question을 설계합니다."),
  ],
};

// week3(Day6~9)·week4(Day10~15)는 canonical Lesson(day6Lesson1.ts 등)의 week/day
// 메타를 그대로 따라간다. Day6~10은 콘텐츠가 준비되어 열었다. Day11~15는 아직
// 주제를 배정하지 않은 shell이다 — 관리자가 나중에 title/goal/release를 채우면 열린다.
export const week3: WeekMeta = {
  week: 3,
  title: "AI 기반 마케팅·세일즈 & 사업화 전략",
  description: "",
  days: [
    openDay(3, 6, "DAY 6 — IR 근거 대장과 스토리 구조 설계", "아이디어·시장·해결책을 사실/가설로 분리해 Claim Ledger를 만들고, 투자자 관점의 IR 스토리 구조와 투자 요청을 설계합니다."),
    openDay(3, 7, "DAY 7 — Gamma·Canva로 IR Deck 제작", "Gamma로 IR 초안을 만들고 Canva로 시각 정리한 뒤, 슬라이드별 주장·근거·수치를 검수하고 발표용 파일로 내보냅니다."),
    openDay(3, 8, "DAY 8 — 사업계획서·소개서 문서화", "Source Pack을 만들어 IR·사업계획서·서비스 소개서로 재구성하고, 1쪽 요약과 숫자 일치표로 문서 간 정합성을 확인합니다."),
    openDay(3, 9, "DAY 9 — 제품 데모 영상과 발표 준비", "60~120초 데모 영상 스토리보드를 만들어 촬영·편집하고, Mini Brand Kit과 3분 발표 스크립트로 예상 질문까지 준비합니다."),
  ],
};

export const week4: WeekMeta = {
  week: 4,
  title: "AI 기반 사업운영·성장 & 실행전략",
  description: "",
  days: [
    openDay(4, 10, "DAY 10 — 고객 문의 자동화 운영 설계", "문의 접수부터 기록까지 운영 흐름을 설계하고 Make·Zapier로 최소 자동화를 구현한 뒤, AI 분류·초안과 사람 승인 절차를 연결합니다."),
    ...Array.from({ length: 5 }, (_, i) => placeholderDay(4, i + 11)),
  ],
};

export const curriculum: WeekMeta[] = [week2, week3, week4];

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
