import type { LessonContent } from "./types";
import { parseLessonContent } from "./schema/lessonSchema";
import rawContent from "./content/day16Lesson1.content.json";

// 13차시(2주차 새 Day16 1교시) 콘텐츠. day6Lesson1~4는 이미 week3(3주차) IR
// 콘텐츠가 쓰고 있어 재사용하지 않는다. day는 1~15가 모두 다른 주차에서 이미
// 쓰이고 있어(2주차 1~5, 3주차 6~9, 4주차 10~15) "DAY 6"이 두 주차에 동시에
// 뜨는 걸 피하려고 이어지는 다음 번호인 16을 그대로 day 값으로도 쓴다. 파일
// 슬롯 이름(day16Lesson1)과 실제 day 값(16)이 일치하므로 다른 lesson과 같은
// 규칙이다 — id 문자열의 "d6"는 처음 만들 때 이름이라 남아 있을 뿐 route와
// 무관하다(canonicalLessons.ts는 week/day 값으로 필터링한다).
const parsed = parseLessonContent(rawContent);
if (!parsed.lesson) {
  throw new Error(`13차시(w2-d16-l1) 콘텐츠를 읽지 못했습니다: ${parsed.fatalError ?? "형식 오류"}`);
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
