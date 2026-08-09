import type { LessonContent } from "./types";
import { parseLessonContent } from "./schema/lessonSchema";
import rawContent from "./content/day2Lesson2.content.json";

export const DAY2_LESSON2_ID = "w2-d2-l2-sns-repurpose";

export interface Day2Lesson2Assets {
  snsChannelContext: string;
  channelContextTransformer: string;
}

export const DAY2_LESSON2_ASSET_FILES = {
  snsChannelContext: "/lesson-content/week2/day2/sns_channel_context.svg",
  channelContextTransformer: "/lesson-content/week2/day2/channel_context_transformer.html",
} as const;

export const DAY2_LESSON2_RESULT_FORM_ID = "l2-b31";

const parsed = parseLessonContent(rawContent);

if (!parsed.lesson) {
  throw new Error(`Day2 Lesson2 콘텐츠를 읽지 못했습니다: ${parsed.fatalError ?? "형식 오류"}`);
}
if (parsed.issues.length > 0 && process.env.NODE_ENV !== "production") {
  console.warn("[day2Lesson2] 제외된 블록", parsed.issues);
}

const CONTENT: LessonContent = parsed.lesson;

export const DAY2_LESSON2_META = {
  id: CONTENT.id,
  week: CONTENT.week,
  day: CONTENT.day,
  lessonNumber: CONTENT.lesson,
  title: CONTENT.title,
  description: CONTENT.description,
};

export function buildDay2Lesson2(assets: Day2Lesson2Assets): LessonContent {
  const swap: Record<string, string> = {
    [DAY2_LESSON2_ASSET_FILES.snsChannelContext]: assets.snsChannelContext,
    [DAY2_LESSON2_ASSET_FILES.channelContextTransformer]: assets.channelContextTransformer,
  };

  const now = Date.now();
  return {
    ...CONTENT,
    id: DAY2_LESSON2_ID,
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
