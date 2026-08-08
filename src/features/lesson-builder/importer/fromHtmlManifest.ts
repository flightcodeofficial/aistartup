import type { LessonContent, LessonPage } from "../types";
import { createBlockId, createPageId, DEFAULT_LAYOUT, DEFAULT_THEME } from "../types";
import { lessonContentAssetPath } from "@/lib/lessonContentPaths";

// 기존 콘텐츠(manifest.json + pageNN.html)를 새 블록 구조로 옮긴다.
// 원본 파일은 건드리지 않는다 — public/lesson-content/** 는 그대로 두고,
// 각 페이지에 그 파일을 가리키는 html-file 블록 1개를 만든 LessonContent를 새로 생성할 뿐이다.
// 따라서 기존 라우트(/week/../lesson/../page/..)는 계속 원본을 그대로 사용한다.

export interface HtmlManifestPageInput {
  pageNumber: number;
  file: string;
  title: string;
}

export interface HtmlManifestImportInput {
  courseId: string;
  week: number;
  day: number;
  lesson: number;
  lessonTitle: string;
  pages: HtmlManifestPageInput[];
}

/** 기존 슬라이드는 1280x720 기준으로 만들어졌고, 관리자가 이미 검수한 콘텐츠이므로
 *  스크립트 실행(퀴즈 인터랙션 등)을 허용한다. */
const LEGACY_DESIGN_WIDTH = 1280;
const LEGACY_DESIGN_HEIGHT = 720;

export function buildLessonFromHtmlManifest(input: HtmlManifestImportInput): LessonContent {
  const now = Date.now();

  const pages: LessonPage[] = input.pages
    .slice()
    .sort((a, b) => a.pageNumber - b.pageNumber)
    .map((page) => ({
      id: createPageId(),
      title: page.title || `Page ${page.pageNumber}`,
      layout: "fullscreen" as const,
      blocks: [
        {
          id: createBlockId(),
          type: "html-file" as const,
          visibility: "visible" as const,
          layout: { ...DEFAULT_LAYOUT, width: "full" as const, spacing: "none" as const },
          theme: { ...DEFAULT_THEME },
          data: {
            src: lessonContentAssetPath(input.week, input.day, input.lesson, page.file),
            trustedScript: true,
            designWidth: LEGACY_DESIGN_WIDTH,
            designHeight: LEGACY_DESIGN_HEIGHT,
          },
        },
      ],
    }));

  return {
    id: `imported-w${input.week}-d${input.day}-l${input.lesson}`,
    courseId: input.courseId,
    week: input.week,
    day: input.day,
    lesson: input.lesson,
    title: input.lessonTitle,
    description: "기존 HTML 슬라이드에서 가져온 Lesson입니다.",
    pages,
    status: "draft",
    version: 1,
    createdAt: now,
    updatedAt: now,
  };
}
