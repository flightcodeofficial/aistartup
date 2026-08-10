import type { LessonContent } from "./types";
import { parseLessonContent } from "./schema/lessonSchema";
import rawContent from "./content/day15Lesson2.content.json";

const parsed = parseLessonContent(rawContent);
if (!parsed.lesson) {
  throw new Error(`Day15 Lesson2 콘텐츠를 읽지 못했습니다: ${parsed.fatalError ?? "형식 오류"}`);
}

const CONTENT: LessonContent = parsed.lesson;

export const DAY15_LESSON2_META = {
  id: CONTENT.id,
  week: CONTENT.week,
  day: CONTENT.day,
  lessonNumber: CONTENT.lesson,
  title: CONTENT.title,
  description: CONTENT.description,
};

export function buildDay15Lesson2(): LessonContent {
  const now = Date.now();
  return {
    ...CONTENT,
    id: CONTENT.id,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
}
