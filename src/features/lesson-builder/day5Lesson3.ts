import type { LessonContent } from "./types";
import { parseLessonContent } from "./schema/lessonSchema";
import rawContent from "./content/day5Lesson3.content.json";

const parsed = parseLessonContent(rawContent);
if (!parsed.lesson) {
  throw new Error(`Day5 Lesson3 콘텐츠를 읽지 못했습니다: ${parsed.fatalError ?? "형식 오류"}`);
}

const CONTENT: LessonContent = parsed.lesson;

export const DAY5_LESSON3_META = {
  id: CONTENT.id,
  week: CONTENT.week,
  day: CONTENT.day,
  lessonNumber: CONTENT.lesson,
  title: CONTENT.title,
  description: CONTENT.description,
};

export function buildDay5Lesson3(): LessonContent {
  const now = Date.now();
  return {
    ...CONTENT,
    id: CONTENT.id,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
}
