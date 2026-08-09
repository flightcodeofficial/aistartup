import type { LessonContent } from "./types";
import { parseLessonContent } from "./schema/lessonSchema";
import rawContent from "./content/day1Lesson2.content.json";

// 2주차 Day1 Lesson2 — "고객 증거 수집·태깅과 반복 패턴 찾기" 실제 수업 콘텐츠.
//
// day1Lesson1.ts와 같은 패턴: 원고는 content/day1Lesson2.content.json에 있고,
// 여기서는 저장소에 넣기 전 asset:// 치환만 한다. Lesson1의 이미지는 전부
// infographic(variant:image) 블록이었지만, Lesson2는 순수 image 타입 블록(P03/P07)을
// 쓴다 — 그래서 day1Lesson1의 buildDay1Lesson1을 고치지 않고 별도 함수로 둔다.
//
// html-file(P06 인터랙티브)은 Lesson1의 interactive HTML과 동일하게 asset 업로드
// 대상이 아니다 — public 경로를 그대로 쓴다.

export const DAY1_LESSON2_ID = "w2-d1-l2-customer-evidence";

export interface Day1Lesson2Assets {
  evidenceStrengthLadder: string;
  sourceTraceChain: string;
}

export const DAY1_LESSON2_ASSET_FILES = {
  evidenceStrengthLadder: "/lesson-content/week2-day1-lesson2/evidence_strength_ladder.svg",
  sourceTraceChain: "/lesson-content/week2-day1-lesson2/source_trace_chain.svg",
} as const;

/** Page11 입력 폼. Page12 save-artifact가 이 id를 참조한다. */
export const DAY1_LESSON2_RESULT_FORM_ID = "b11-form";

const parsed = parseLessonContent(rawContent);

if (!parsed.lesson) {
  throw new Error(`Day1 Lesson2 콘텐츠를 읽지 못했습니다: ${parsed.fatalError ?? "형식 오류"}`);
}
if (parsed.issues.length > 0 && process.env.NODE_ENV !== "production") {
  console.warn("[day1Lesson2] 제외된 블록", parsed.issues);
}

const CONTENT: LessonContent = parsed.lesson;

/** 학생 Day 화면·사이드바가 쓰는 Lesson 카드용 메타데이터. CONTENT에서만 뽑아 쓴다 — 제목을 따로 다시 적지 않는다. */
export const DAY1_LESSON2_META = {
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
export function buildDay1Lesson2(assets: Day1Lesson2Assets): LessonContent {
  const swap: Record<string, string> = {
    [DAY1_LESSON2_ASSET_FILES.evidenceStrengthLadder]: assets.evidenceStrengthLadder,
    [DAY1_LESSON2_ASSET_FILES.sourceTraceChain]: assets.sourceTraceChain,
  };

  const now = Date.now();
  return {
    ...CONTENT,
    id: DAY1_LESSON2_ID,
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
