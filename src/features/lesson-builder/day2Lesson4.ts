import type { LessonContent } from "./types";
import { parseLessonContent } from "./schema/lessonSchema";
import rawContent from "./content/day2Lesson4.content.json";

export const DAY2_LESSON4_ID = "w2-d2-l4-content-supply-chain";

export interface Day2Lesson4Assets {
  contentSupplyChain: string;
  oneVariableAbTest: string;
  contentSupplyChainInteractive: string;
}

export const DAY2_LESSON4_ASSET_FILES = {
  contentSupplyChain: "/lesson-content/week2/day2/content_supply_chain.svg",
  oneVariableAbTest: "/lesson-content/week2/day2/one_variable_ab_test.svg",
  contentSupplyChainInteractive: "/lesson-content/week2/day2/content_supply_chain_interactive.html",
} as const;

export const DAY2_LESSON4_RESULT_FORM_ID = "l4-b30";

const parsed = parseLessonContent(rawContent);

if (!parsed.lesson) {
  throw new Error(`Day2 Lesson4 콘텐츠를 읽지 못했습니다: ${parsed.fatalError ?? "형식 오류"}`);
}
if (parsed.issues.length > 0 && process.env.NODE_ENV !== "production") {
  console.warn("[day2Lesson4] 제외된 블록", parsed.issues);
}

const CONTENT: LessonContent = parsed.lesson;

export const DAY2_LESSON4_META = {
  id: CONTENT.id,
  week: CONTENT.week,
  day: CONTENT.day,
  lessonNumber: CONTENT.lesson,
  title: CONTENT.title,
  description: CONTENT.description,
};

export function buildDay2Lesson4(assets: Day2Lesson4Assets): LessonContent {
  const swap: Record<string, string> = {
    [DAY2_LESSON4_ASSET_FILES.contentSupplyChain]: assets.contentSupplyChain,
    [DAY2_LESSON4_ASSET_FILES.oneVariableAbTest]: assets.oneVariableAbTest,
    [DAY2_LESSON4_ASSET_FILES.contentSupplyChainInteractive]: assets.contentSupplyChainInteractive,
  };

  const now = Date.now();
  return {
    ...CONTENT,
    id: DAY2_LESSON4_ID,
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
