import type { LessonContent } from "./types";
import { parseLessonContent } from "./schema/lessonSchema";
import rawContent from "./content/day16Lesson1.content.json";

// 파일 슬롯 이름은 day16(다음으로 비어 있는 순번)이지만, 콘텐츠 자체는
// week2의 6일차 1교시(13차시)다. day6Lesson1~4는 이미 week3(3주차) IR
// 콘텐츠가 쓰고 있어 재사용하지 않는다 — canonicalLessons.ts는 이 메타의
// week/day 값(2, 6)으로 필터링하므로 파일 슬롯 번호는 라우팅에 영향이 없다.
const parsed = parseLessonContent(rawContent);
if (!parsed.lesson) {
  throw new Error(`13차시(w2-d6-l1) 콘텐츠를 읽지 못했습니다: ${parsed.fatalError ?? "형식 오류"}`);
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
