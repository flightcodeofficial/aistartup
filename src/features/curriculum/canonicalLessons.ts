import { DAY1_LESSON1_META } from "@/features/lesson-builder/day1Lesson1";
import { DAY1_LESSON2_META } from "@/features/lesson-builder/day1Lesson2";
import { DAY1_LESSON3_META } from "@/features/lesson-builder/day1Lesson3";
import { DAY1_LESSON4_META } from "@/features/lesson-builder/day1Lesson4";
import { DAY2_LESSON1_META } from "@/features/lesson-builder/day2Lesson1";
import { DAY2_LESSON2_META } from "@/features/lesson-builder/day2Lesson2";
import { DAY2_LESSON3_META } from "@/features/lesson-builder/day2Lesson3";
import { DAY2_LESSON4_META } from "@/features/lesson-builder/day2Lesson4";
import { DAY3_LESSON1_META } from "@/features/lesson-builder/day3Lesson1";
import { DAY3_LESSON2_META } from "@/features/lesson-builder/day3Lesson2";
import { DAY3_LESSON3_META } from "@/features/lesson-builder/day3Lesson3";
import { DAY3_LESSON4_META } from "@/features/lesson-builder/day3Lesson4";
import { DAY4_LESSON1_META } from "@/features/lesson-builder/day4Lesson1";
import { DAY4_LESSON2_META } from "@/features/lesson-builder/day4Lesson2";
import { DAY4_LESSON3_META } from "@/features/lesson-builder/day4Lesson3";
import { DAY4_LESSON4_META } from "@/features/lesson-builder/day4Lesson4";
import { DAY5_LESSON1_META } from "@/features/lesson-builder/day5Lesson1";
import { DAY5_LESSON2_META } from "@/features/lesson-builder/day5Lesson2";
import { DAY5_LESSON3_META } from "@/features/lesson-builder/day5Lesson3";
import { DAY5_LESSON4_META } from "@/features/lesson-builder/day5Lesson4";
import { DAY6_LESSON1_META } from "@/features/lesson-builder/day6Lesson1";
import { DAY6_LESSON2_META } from "@/features/lesson-builder/day6Lesson2";
import { DAY6_LESSON3_META } from "@/features/lesson-builder/day6Lesson3";
import { DAY6_LESSON4_META } from "@/features/lesson-builder/day6Lesson4";
import { DAY7_LESSON1_META } from "@/features/lesson-builder/day7Lesson1";
import { DAY7_LESSON2_META } from "@/features/lesson-builder/day7Lesson2";
import { DAY7_LESSON3_META } from "@/features/lesson-builder/day7Lesson3";
import { DAY7_LESSON4_META } from "@/features/lesson-builder/day7Lesson4";
import { DAY8_LESSON1_META } from "@/features/lesson-builder/day8Lesson1";
import { DAY8_LESSON2_META } from "@/features/lesson-builder/day8Lesson2";
import { DAY8_LESSON3_META } from "@/features/lesson-builder/day8Lesson3";
import { DAY8_LESSON4_META } from "@/features/lesson-builder/day8Lesson4";
import { DAY9_LESSON1_META } from "@/features/lesson-builder/day9Lesson1";
import { DAY9_LESSON2_META } from "@/features/lesson-builder/day9Lesson2";
import { DAY9_LESSON3_META } from "@/features/lesson-builder/day9Lesson3";
import { DAY9_LESSON4_META } from "@/features/lesson-builder/day9Lesson4";
import { DAY10_LESSON1_META } from "@/features/lesson-builder/day10Lesson1";
import { DAY10_LESSON2_META } from "@/features/lesson-builder/day10Lesson2";
import { DAY10_LESSON3_META } from "@/features/lesson-builder/day10Lesson3";
import { DAY10_LESSON4_META } from "@/features/lesson-builder/day10Lesson4";
import { DAY11_LESSON1_META } from "@/features/lesson-builder/day11Lesson1";
import { DAY11_LESSON2_META } from "@/features/lesson-builder/day11Lesson2";
import { DAY11_LESSON3_META } from "@/features/lesson-builder/day11Lesson3";
import { DAY11_LESSON4_META } from "@/features/lesson-builder/day11Lesson4";
import { DAY12_LESSON1_META } from "@/features/lesson-builder/day12Lesson1";
import { DAY12_LESSON2_META } from "@/features/lesson-builder/day12Lesson2";
import { DAY12_LESSON3_META } from "@/features/lesson-builder/day12Lesson3";
import { DAY12_LESSON4_META } from "@/features/lesson-builder/day12Lesson4";
import { DAY13_LESSON1_META } from "@/features/lesson-builder/day13Lesson1";
import { DAY13_LESSON2_META } from "@/features/lesson-builder/day13Lesson2";
import { DAY13_LESSON3_META } from "@/features/lesson-builder/day13Lesson3";
import { DAY13_LESSON4_META } from "@/features/lesson-builder/day13Lesson4";
import { DAY14_LESSON1_META } from "@/features/lesson-builder/day14Lesson1";
import { DAY14_LESSON2_META } from "@/features/lesson-builder/day14Lesson2";
import { DAY14_LESSON3_META } from "@/features/lesson-builder/day14Lesson3";
import { DAY14_LESSON4_META } from "@/features/lesson-builder/day14Lesson4";
import { DAY15_LESSON1_META } from "@/features/lesson-builder/day15Lesson1";
import { DAY15_LESSON2_META } from "@/features/lesson-builder/day15Lesson2";
import { DAY15_LESSON3_META } from "@/features/lesson-builder/day15Lesson3";
import { DAY15_LESSON4_META } from "@/features/lesson-builder/day15Lesson4";
import { getDay, getLesson } from "./data";
import { lessonRelease, type ReleaseStatus } from "./release";
import type { Step } from "./types";

// 학생 Day 화면·사이드바의 정식 Lesson 목록은 여기서 나온다.
//
// canonical 수업 시스템은 Block Lesson(lesson-builder)이다. legacy STEP 커리큘럼
// (features/curriculum/data/week2/day1.ts)은 그 안의 Step 콘텐츠·release 값을 위한
// 참조일 뿐, Lesson 목록 자체의 데이터 소스가 아니다 — 그래서 day1.ts에는 Lesson을
// 추가하지 않고, 이 파일이 day1LessonN.ts의 메타데이터를 모아 목록을 만든다.

export interface CanonicalLessonMeta {
  id: string;
  week: number;
  day: number;
  lessonNumber: number;
  title: string;
  description?: string;
}

export const CANONICAL_LESSONS: CanonicalLessonMeta[] = [
  DAY1_LESSON1_META, DAY1_LESSON2_META, DAY1_LESSON3_META, DAY1_LESSON4_META,
  DAY2_LESSON1_META, DAY2_LESSON2_META, DAY2_LESSON3_META, DAY2_LESSON4_META,
  DAY3_LESSON1_META, DAY3_LESSON2_META, DAY3_LESSON3_META, DAY3_LESSON4_META,
  DAY4_LESSON1_META, DAY4_LESSON2_META, DAY4_LESSON3_META, DAY4_LESSON4_META,
  DAY5_LESSON1_META, DAY5_LESSON2_META, DAY5_LESSON3_META, DAY5_LESSON4_META,
  DAY6_LESSON1_META, DAY6_LESSON2_META, DAY6_LESSON3_META, DAY6_LESSON4_META,
  DAY7_LESSON1_META, DAY7_LESSON2_META, DAY7_LESSON3_META, DAY7_LESSON4_META,
  DAY8_LESSON1_META, DAY8_LESSON2_META, DAY8_LESSON3_META, DAY8_LESSON4_META,
  DAY9_LESSON1_META, DAY9_LESSON2_META, DAY9_LESSON3_META, DAY9_LESSON4_META,
  DAY10_LESSON1_META, DAY10_LESSON2_META, DAY10_LESSON3_META, DAY10_LESSON4_META,
  DAY11_LESSON1_META, DAY11_LESSON2_META, DAY11_LESSON3_META, DAY11_LESSON4_META,
  DAY12_LESSON1_META, DAY12_LESSON2_META, DAY12_LESSON3_META, DAY12_LESSON4_META,
  DAY13_LESSON1_META, DAY13_LESSON2_META, DAY13_LESSON3_META, DAY13_LESSON4_META,
  DAY14_LESSON1_META, DAY14_LESSON2_META, DAY14_LESSON3_META, DAY14_LESSON4_META,
  DAY15_LESSON1_META, DAY15_LESSON2_META, DAY15_LESSON3_META, DAY15_LESSON4_META,
];

function getCanonicalLessonMetas(week: number, day: number): CanonicalLessonMeta[] {
  return CANONICAL_LESSONS.filter((l) => l.week === week && l.day === day).sort(
    (a, b) => a.lessonNumber - b.lessonNumber
  );
}

/** Day에 canonical Lesson이 하나라도 등록됐는지. status="coming-soon"이어도
 *  canonical Lesson이 있으면 "콘텐츠 준비 중" 대신 실제 Lesson 카드를 보여줘야 한다. */
export function hasCanonicalLessons(week: number, day: number): boolean {
  return getCanonicalLessonMetas(week, day).length > 0;
}

/**
 * week2 Day1의 몇 교시(Lesson)까지 열렸는지 — data/index.ts의 week2 배열이 lesson1~3에
 * 적용하는 것과 동일한 규칙(1교시만 open, 나머지 scheduled)이다. day1.ts에는 아직 없는
 * Lesson4처럼 legacy LessonMeta가 없는 canonical Lesson의 release 기본값에만 쓴다 —
 * legacy LessonMeta가 있는 Lesson(1~3)은 거기 이미 적용된 release 값을 그대로 쓴다.
 */
function week2Day1DefaultRelease(lessonNumber: number): ReleaseStatus {
  return lessonNumber === 1 ? "open" : "scheduled";
}

export interface LessonCard {
  lessonNumber: number;
  title: string;
  description: string;
  release: ReleaseStatus;
  /** 같은 lessonNumber의 legacy STEP(있다면). 입장 시 이어줄 실제 콘텐츠 — UI가 라우팅을 정한다. */
  legacySteps: Step[];
}

/**
 * Day의 학생용 Lesson 카드 목록.
 *
 * canonical Block Lesson이 등록된 Day는 그것을 쓰고(id/title/description),
 * 아직 canonical Lesson이 하나도 없는 Day는 legacy LessonMeta를 그대로 카드로
 * 보여준다(fallback) — legacy STEP은 대체 콘텐츠가 없을 때만 목록에 나선다.
 *
 * release는 항상 기존 curriculum release 정책(lessonRelease — Day가 상한선)을
 * 그대로 따른다. 이 함수는 release 값 자체를 새로 정하지 않는다.
 */
export function getLessonCards(week: number, day: number): LessonCard[] {
  const dayMeta = getDay(week, day);
  const canonical = getCanonicalLessonMetas(week, day);

  if (canonical.length > 0) {
    return canonical.map((meta) => {
      const legacy = getLesson(week, day, meta.lessonNumber);
      const release = legacy
        ? lessonRelease(dayMeta, legacy)
        : lessonRelease(dayMeta, { release: week2Day1DefaultRelease(meta.lessonNumber) });
      return {
        lessonNumber: meta.lessonNumber,
        title: meta.title,
        description: meta.description ?? "",
        release,
        legacySteps: legacy?.steps ?? [],
      };
    });
  }

  return (dayMeta?.lessons ?? []).map((lesson) => ({
    lessonNumber: lesson.lessonNumber,
    title: lesson.title,
    description: lesson.goal,
    release: lessonRelease(dayMeta, lesson),
    legacySteps: lesson.steps,
  }));
}
