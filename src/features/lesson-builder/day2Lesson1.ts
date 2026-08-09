import type { LessonContent } from "./types";
import { parseLessonContent } from "./schema/lessonSchema";
import rawContent from "./content/day2Lesson1.content.json";

export const DAY2_LESSON1_ID = "w2-d2-l1-source-message";

export interface Day2Lesson1Assets {
  sourceToMessagePipeline: string;
  messageAngleMap: string;
  sourceAuditInteractive: string;
}

export const DAY2_LESSON1_ASSET_FILES = {
  sourceToMessagePipeline: "/lesson-content/week2/day2/source_to_message_pipeline.svg",
  messageAngleMap: "/lesson-content/week2/day2/message_angle_map.svg",
  sourceAuditInteractive: "/lesson-content/week2/day2/source_audit_interactive.html",
} as const;

export const DAY2_LESSON1_RESULT_FORM_ID = "l1-b34";

const parsed = parseLessonContent(rawContent);

if (!parsed.lesson) {
  throw new Error(`Day2 Lesson1 콘텐츠를 읽지 못했습니다: ${parsed.fatalError ?? "형식 오류"}`);
}
if (parsed.issues.length > 0 && process.env.NODE_ENV !== "production") {
  console.warn("[day2Lesson1] 제외된 블록", parsed.issues);
}

const CONTENT: LessonContent = parsed.lesson;

export const DAY2_LESSON1_META = {
  id: CONTENT.id,
  week: CONTENT.week,
  day: CONTENT.day,
  lessonNumber: CONTENT.lesson,
  title: CONTENT.title,
  description: CONTENT.description,
};

export function buildDay2Lesson1(assets: Day2Lesson1Assets): LessonContent {
  const swap: Record<string, string> = {
    [DAY2_LESSON1_ASSET_FILES.sourceToMessagePipeline]: assets.sourceToMessagePipeline,
    [DAY2_LESSON1_ASSET_FILES.messageAngleMap]: assets.messageAngleMap,
    [DAY2_LESSON1_ASSET_FILES.sourceAuditInteractive]: assets.sourceAuditInteractive,
  };

  const now = Date.now();
  return {
    ...CONTENT,
    id: DAY2_LESSON1_ID,
    status: "draft",
    createdAt: now,
    updatedAt: now,
    pages: CONTENT.pages.map((page) => ({
      ...page,
      blocks: page.blocks.map((block) => {
        if (block.type === "infographic" && block.data.imageUrl) {
          const replacement = swap[block.data.imageUrl];
          if (!replacement) return block;
          return { ...block, data: { ...block.data, imageUrl: replacement } };
        }

        if (block.type === "html-file" && block.data.src) {
          const replacement = swap[block.data.src];
          if (!replacement) return block;
          return { ...block, data: { ...block.data, src: replacement } };
        }

        return block;
      }),
    })),
  };
}
