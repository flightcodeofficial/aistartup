import type { LessonContent } from "./types";
import { parseLessonContent } from "./schema/lessonSchema";
import rawContent from "./content/day16Lesson1.content.json";

// 13차시 콘텐츠. 2주차 수업은 Day5까지만 있고 새 Day를 만들지 않는다 — 그래서
// week/day/lesson 값은 2주차 Day5의 5번째 Lesson(5교시)이다. 파일 슬롯 이름은
// day16Lesson1(다음으로 비어 있는 순번)이지만 실제 콘텐츠의 day/lesson 값과는
// 무관하다 — canonicalLessons.ts는 이 메타의 week/day 값(2, 5)으로 필터링해
// day5Lesson1~4 옆에 5번째 Lesson으로 붙인다. id 문자열의 "d6"·"l1"도 처음
// 만들 때 이름이라 남아 있을 뿐 route와 무관하다.
const parsed = parseLessonContent(rawContent);
if (!parsed.lesson) {
  throw new Error(`13차시(w2-d5-l5) 콘텐츠를 읽지 못했습니다: ${parsed.fatalError ?? "형식 오류"}`);
}

const CONTENT: LessonContent = parsed.lesson;

export const DAY16_LESSON1_META = {
  id: CONTENT.id,
  week: CONTENT.week,
  day: CONTENT.day,
  lessonNumber: CONTENT.lesson,
  title: CONTENT.title,
  description: CONTENT.description,
};

export function buildDay16Lesson1(): LessonContent {
  const now = Date.now();
  return {
    ...CONTENT,
    id: CONTENT.id,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
}
