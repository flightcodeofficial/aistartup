import { DAY1_LESSON1_META } from "@/features/lesson-builder/day1Lesson1";
import { DAY1_LESSON2_META } from "@/features/lesson-builder/day1Lesson2";
import { DAY1_LESSON3_META } from "@/features/lesson-builder/day1Lesson3";
import { DAY1_LESSON4_META } from "@/features/lesson-builder/day1Lesson4";
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

const CANONICAL_LESSONS: CanonicalLessonMeta[] = [
  DAY1_LESSON1_META,
  DAY1_LESSON2_META,
  DAY1_LESSON3_META,
  DAY1_LESSON4_META,
];

function getCanonicalLessonMetas(week: number, day: number): CanonicalLessonMeta[] {
  return CANONICAL_LESSONS.filter((l) => l.week === week && l.day === day).sort(
    (a, b) => a.lessonNumber - b.lessonNumber
  );
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
