import type { LessonContent } from "./types";
import { parseLessonContent } from "./schema/lessonSchema";
import rawContent from "./content/day1Lesson3.content.json";

// 2주차 Day1 Lesson3 — "세그먼트·ECP/ICP·Anti-ICP" 실제 수업 콘텐츠.
//
// day1Lesson1.ts / day1Lesson2.ts와 같은 패턴: 원고는 content/day1Lesson3.content.json에
// 있고, 여기서는 저장소에 넣기 전 asset:// 치환만 한다. Lesson3의 이미지는 Lesson2와
// 같은 순수 image 타입(P03) 하나뿐이라 day1Lesson2의 buildDay1Lesson2를 고치지 않고
// 별도 buildDay1Lesson3으로 둔다.
//
// html-file(P06 인터랙티브)은 Lesson1·2와 동일하게 asset 업로드 대상이 아니다 —
// public 경로를 그대로 쓴다.

export const DAY1_LESSON3_ID = "w2-d1-l3-segmentation";

export interface Day1Lesson3Assets {
  segmentMap: string;
}

export const DAY1_LESSON3_ASSET_FILES = {
  segmentMap: "/lesson-content/week2-day1-lesson3/segment_map.svg",
} as const;

/** Page11 입력 폼. Page12 save-artifact가 이 id를 참조한다. */
export const DAY1_LESSON3_RESULT_FORM_ID = "b11-form";

const parsed = parseLessonContent(rawContent);

if (!parsed.lesson) {
  throw new Error(`Day1 Lesson3 콘텐츠를 읽지 못했습니다: ${parsed.fatalError ?? "형식 오류"}`);
}
if (parsed.issues.length > 0 && process.env.NODE_ENV !== "production") {
  console.warn("[day1Lesson3] 제외된 블록", parsed.issues);
}

const CONTENT: LessonContent = parsed.lesson;

/** 학생 Day 화면·사이드바가 쓰는 Lesson 카드용 메타데이터. CONTENT에서만 뽑아 쓴다 — 제목을 따로 다시 적지 않는다. */
export const DAY1_LESSON3_META = {
  id: CONTENT.id,
  week: CONTENT.week,
  day: CONTENT.day,
  lessonNumber: CONTENT.lesson,
  title: CONTENT.title,
  description: CONTENT.description,
};

/**
 * 저장소에 넣을 Lesson을 만든다. status는 항상 draft — 이 함수는 절대 게시하지 않는다.
 */
export function buildDay1Lesson3(assets: Day1Lesson3Assets): LessonContent {
  const swap: Record<string, string> = {
    [DAY1_LESSON3_ASSET_FILES.segmentMap]: assets.segmentMap,
  };

  const now = Date.now();
  return {
    ...CONTENT,
    id: DAY1_LESSON3_ID,
    status: "draft",
    createdAt: now,
    updatedAt: now,
    pages: CONTENT.pages.map((page) => ({
      ...page,
      blocks: page.blocks.map((block) => {
        if (block.type !== "image" || !block.data.url) return block;
        const replacement = swap[block.data.url];
        if (!replacement) return block;
        return { ...block, data: { ...block.data, url: replacement } };
      }),
    })),
  };
}
