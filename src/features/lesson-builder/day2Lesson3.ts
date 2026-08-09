import type { LessonContent } from "./types";
import { parseLessonContent } from "./schema/lessonSchema";
import rawContent from "./content/day2Lesson3.content.json";

export const DAY2_LESSON3_ID = "w2-d2-l3-blog-newsletter";

export interface Day2Lesson3Assets {
  blogNewsletterCompare: string;
  longformStructureInteractive: string;
}

export const DAY2_LESSON3_ASSET_FILES = {
  blogNewsletterCompare: "/lesson-content/week2/day2/blog_newsletter_compare.svg",
  longformStructureInteractive: "/lesson-content/week2/day2/longform_structure_interactive.html",
} as const;

export const DAY2_LESSON3_RESULT_FORM_ID = "l3-b32";

const parsed = parseLessonContent(rawContent);

if (!parsed.lesson) {
  throw new Error(`Day2 Lesson3 콘텐츠를 읽지 못했습니다: ${parsed.fatalError ?? "형식 오류"}`);
}
if (parsed.issues.length > 0 && process.env.NODE_ENV !== "production") {
  console.warn("[day2Lesson3] 제외된 블록", parsed.issues);
}

const CONTENT: LessonContent = parsed.lesson;

export const DAY2_LESSON3_META = {
  id: CONTENT.id,
  week: CONTENT.week,
  day: CONTENT.day,
  lessonNumber: CONTENT.lesson,
  title: CONTENT.title,
  description: CONTENT.description,
};

export function buildDay2Lesson3(assets: Day2Lesson3Assets): LessonContent {
  const swap: Record<string, string> = {
    [DAY2_LESSON3_ASSET_FILES.blogNewsletterCompare]: assets.blogNewsletterCompare,
    [DAY2_LESSON3_ASSET_FILES.longformStructureInteractive]: assets.longformStructureInteractive,
  };

  const now = Date.now();
  return {
    ...CONTENT,
    id: DAY2_LESSON3_ID,
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
