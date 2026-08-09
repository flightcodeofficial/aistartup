import type { LessonContent } from "./types";
import { parseLessonContent } from "./schema/lessonSchema";
import rawContent from "./content/day1Lesson1.content.json";

// 2주차 Day1 Lesson1 — "왜 고객 분석이 먼저인가" 실제 수업 콘텐츠.
//
// 콘텐츠 본문은 content/day1Lesson1.content.json 에 있다. 원고를 손보는 사람과
// 코드를 손보는 사람이 다르므로, 수업 내용은 데이터로 분리해 두고 여기서는
// 저장소에 넣기 전 최소한의 변환만 한다.
//
// 직전 버전(12페이지 이전, 손으로 조립한 TS)은
// docs/lesson-backups/day1Lesson1.v1.2026-08-09.ts.bak 에 보관돼 있다.
//
// 구형 HTML Lesson1(public/lesson-content/week2/day1/lesson1/page01~07.html)은 지우지 않는다.
// 그쪽은 legacy reference로 남고, 이 Block Lesson이 실제 수업본이다.

export const DAY1_LESSON1_ID = "w2-d1-l1-customer-analysis";

/** 설치 시 Asset Repository에 올린 SVG의 asset:// 참조. 업로드가 안 되면 public 경로로 떨어진다. */
export interface Day1Lesson1Assets {
  aiMarketingShift: string;
  imaginedVsEvidence: string;
  stpMap: string;
}

export const DAY1_LESSON1_ASSET_FILES = {
  aiMarketingShift: "/lesson-content/week2-day1-lesson1/infographic_ai_marketing_shift.svg",
  imaginedVsEvidence:
    "/lesson-content/week2-day1-lesson1/infographic_imagined_vs_evidence_customer.svg",
  stpMap: "/lesson-content/week2-day1-lesson1/infographic_stp_map.svg",
} as const;

/** Page11 입력 폼. Page12 save-artifact가 이 id를 참조한다. */
export const DAY1_LESSON1_RESULT_FORM_ID = "b11-form";

// 원고 JSON도 결국 외부 입력이다. 편집기의 "JSON 가져오기"와 같은 검증기를 통과시켜
// 깨진 블록이 조용히 저장소로 들어가지 않게 한다.
const parsed = parseLessonContent(rawContent);

if (!parsed.lesson) {
  throw new Error(`Day1 Lesson1 콘텐츠를 읽지 못했습니다: ${parsed.fatalError ?? "형식 오류"}`);
}
if (parsed.issues.length > 0 && process.env.NODE_ENV !== "production") {
  // 조용히 빠지면 수업 중에야 발견하게 된다.
  console.warn("[day1Lesson1] 제외된 블록", parsed.issues);
}

const CONTENT: LessonContent = parsed.lesson;

/** 학생 Day 화면·사이드바가 쓰는 Lesson 카드용 메타데이터. CONTENT에서만 뽑아 쓴다 — 제목을 따로 다시 적지 않는다. */
export const DAY1_LESSON1_META = {
  id: CONTENT.id,
  week: CONTENT.week,
  day: CONTENT.day,
  lessonNumber: CONTENT.lesson,
  title: CONTENT.title,
  description: CONTENT.description,
};

/**
 * 저장소에 넣을 Lesson을 만든다.
 *
 * 콘텐츠 JSON은 public 경로를 쓰지만, 저장 시점에는 asset:// 참조로 바꾼다.
 * 블록이 파일 위치 대신 asset id를 들고 있어야 나중에 저장소를 갈아도
 * 콘텐츠를 다시 손대지 않는다.
 */
export function buildDay1Lesson1(assets: Day1Lesson1Assets): LessonContent {
  const swap: Record<string, string> = {
    [DAY1_LESSON1_ASSET_FILES.aiMarketingShift]: assets.aiMarketingShift,
    [DAY1_LESSON1_ASSET_FILES.imaginedVsEvidence]: assets.imaginedVsEvidence,
    [DAY1_LESSON1_ASSET_FILES.stpMap]: assets.stpMap,
  };

  const now = Date.now();
  return {
    ...CONTENT,
    id: DAY1_LESSON1_ID,
    status: "draft",
    createdAt: now,
    updatedAt: now,
    pages: CONTENT.pages.map((page) => ({
      ...page,
      blocks: page.blocks.map((block) => {
        if (block.type !== "infographic" || !block.data.imageUrl) return block;
        const replacement = swap[block.data.imageUrl];
        if (!replacement) return block;
        return { ...block, data: { ...block.data, imageUrl: replacement } };
      }),
    })),
  };
}
