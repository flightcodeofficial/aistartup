import { z } from "zod";
import { BLOCK_TYPES } from "../types";
import type { LessonBlock, LessonContent, LessonPage } from "../types";

// 콘텐츠는 관리자가 손으로 만들거나 JSON으로 가져오기 때문에 언제든 깨질 수 있다.
// 원칙: 깨진 블록 하나가 Lesson 전체(또는 앱 전체)를 죽이지 않는다.
// - 블록 단위로 따로 파싱해서, 실패한 블록만 걸러내고 사유를 남긴다.
// - 페이지/레슨 수준의 필수 필드가 깨지면 그때만 전체 실패로 본다.

const blockLayoutSchema = z.object({
  width: z.enum(["narrow", "normal", "wide", "full"]).default("normal"),
  align: z.enum(["left", "center", "right"]).default("left"),
  spacing: z.enum(["none", "small", "medium", "large"]).default("medium"),
  hideOnMobile: z.boolean().optional(),
});

const blockThemeSchema = z.object({
  background: z.enum(["none", "muted", "card", "primary-soft", "dark"]).optional(),
  bordered: z.boolean().optional(),
});

const blockBaseShape = {
  id: z.string().min(1),
  title: z.string().optional(),
  description: z.string().optional(),
  visibility: z.enum(["visible", "hidden", "instructor-only"]).default("visible"),
  layout: blockLayoutSchema.default({ width: "normal", align: "left", spacing: "medium" }),
  theme: blockThemeSchema.default({}),
};

const quizQuestionSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  choices: z
    .array(z.object({ id: z.string().min(1), text: z.string() }))
    .min(2, "보기는 2개 이상이어야 합니다."),
  correctChoiceId: z.string().min(1),
  explanation: z.string().optional(),
});

const inputFormFieldSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  placeholder: z.string().optional(),
  kind: z.enum(["short-text", "long-text", "number", "select", "checkbox"]).default("short-text"),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  defaultChecked: z.boolean().optional(),
});

const mediaDisplaySchema = z.enum(["half", "large", "hero", "fullscreen"]).optional();
const mediaFitSchema = z.enum(["contain", "cover"]).optional();
const mediaRatioSchema = z.enum(["auto", "16/9", "4/3", "1/1", "3/2", "21/9"]).optional();

export const lessonBlockSchema = z.discriminatedUnion("type", [
  z.object({
    ...blockBaseShape,
    type: z.literal("rich-text"),
    data: z.object({
      markdown: z.string(),
      emphasis: z.enum(["normal", "lead", "hero"]).optional(),
    }),
  }),
  z.object({
    ...blockBaseShape,
    type: z.literal("image"),
    data: z.object({
      url: z.string().min(1),
      alt: z.string().default(""),
      caption: z.string().optional(),
      display: mediaDisplaySchema,
      objectFit: mediaFitSchema,
      aspectRatio: mediaRatioSchema,
      mobileRatio: mediaRatioSchema,
    }),
  }),
  z.object({
    ...blockBaseShape,
    type: z.literal("text-image"),
    data: z.object({
      markdown: z.string().default(""),
      imageUrl: z.string().min(1),
      alt: z.string().default(""),
      imagePosition: z.enum(["left", "right"]).default("right"),
    }),
  }),
  z.object({
    ...blockBaseShape,
    type: z.literal("infographic"),
    data: z.object({
      variant: z.enum(["steps", "stats", "comparison", "checklist", "image"]).default("steps"),
      items: z
        .array(
          z.object({
            label: z.string().min(1),
            value: z.string().optional(),
            description: z.string().optional(),
          })
        )
        .default([]),
      imageUrl: z.string().optional(),
      alt: z.string().optional(),
      caption: z.string().optional(),
      fit: mediaFitSchema,
      display: mediaDisplaySchema,
      aspectRatio: mediaRatioSchema,
    }),
  }),
  z.object({
    ...blockBaseShape,
    type: z.literal("html"),
    data: z.object({
      html: z.string(),
      trustedScript: z.boolean().optional(),
      designWidth: z.number().positive().optional(),
      designHeight: z.number().positive().optional(),
      mobileRenderMode: z.enum(["scale", "responsive"]).optional(),
    }),
  }),
  z.object({
    ...blockBaseShape,
    type: z.literal("html-file"),
    data: z.object({
      src: z.string().min(1),
      trustedScript: z.boolean().optional(),
      designWidth: z.number().positive().optional(),
      designHeight: z.number().positive().optional(),
      mobileRenderMode: z.enum(["scale", "responsive"]).optional(),
    }),
  }),
  z.object({
    ...blockBaseShape,
    type: z.literal("video"),
    data: z.object({
      url: z.string().min(1),
      provider: z.enum(["youtube", "vimeo", "file"]).default("youtube"),
      caption: z.string().optional(),
    }),
  }),
  z.object({
    ...blockBaseShape,
    type: z.literal("external-link"),
    data: z.object({
      url: z.string().min(1),
      buttonLabel: z.string().default("열기"),
      openInNewTab: z.boolean().default(true),
      showSecurityNotice: z.boolean().default(true),
      requireCompletionCheck: z.boolean().default(false),
      practiceName: z.string().optional(),
      practiceDescription: z.string().optional(),
      estimatedMinutes: z.number().optional(),
      /** 있으면 버튼 클릭 시 이 텍스트를 클립보드에 복사한 뒤 링크로 이동한다. */
      copyText: z.string().optional(),
    }),
  }),
  z.object({
    ...blockBaseShape,
    type: z.literal("internal-app"),
    data: z.object({
      route: z.string().min(1),
      practiceName: z.string().default("실습"),
      inputArtifactType: z.string().optional(),
      outputArtifactType: z.string().optional(),
      inputArtifactTypes: z.array(z.string()).optional(),
      completionNote: z.string().optional(),
      requireCompletionCheck: z.boolean().default(false),
    }),
  }),
  z.object({
    ...blockBaseShape,
    type: z.literal("quiz"),
    data: z.object({ questions: z.array(quizQuestionSchema).min(1, "문항이 최소 1개 필요합니다.") }),
  }),
  z.object({
    ...blockBaseShape,
    type: z.literal("input-form"),
    data: z.object({
      fields: z.array(inputFormFieldSchema).min(1, "입력 항목이 최소 1개 필요합니다."),
      artifactType: z.string().optional(),
      inputArtifactTypes: z.array(z.string()).optional(),
    }),
  }),
  z.object({
    ...blockBaseShape,
    type: z.literal("prompt"),
    data: z.object({
      prompt: z.string().min(1),
      targetTool: z.string().optional(),
      copyable: z.boolean().default(true),
    }),
  }),
  z.object({
    ...blockBaseShape,
    type: z.literal("download"),
    data: z.object({
      url: z.string().min(1),
      fileName: z.string().min(1),
      sizeLabel: z.string().optional(),
    }),
  }),
  z.object({
    ...blockBaseShape,
    type: z.literal("result-preview"),
    data: z.object({ artifactType: z.string().optional(), emptyMessage: z.string().optional() }),
  }),
  z.object({
    ...blockBaseShape,
    type: z.literal("save-artifact"),
    data: z.object({
      artifactType: z.string().min(1),
      artifactTitle: z.string().min(1),
      sourceBlockId: z.string().optional(),
      buttonLabel: z.string().default("저장"),
    }),
  }),
  z.object({
    ...blockBaseShape,
    type: z.literal("reflection"),
    data: z.object({
      questions: z.array(z.string().min(1)).min(1, "회고 질문이 최소 1개 필요합니다."),
      placeholder: z.string().optional(),
    }),
  }),
  z.object({
    ...blockBaseShape,
    type: z.literal("divider"),
    data: z.object({ style: z.enum(["line", "space", "dots"]).default("line") }),
  }),
]);

export const lessonPageSchema = z.object({
  id: z.string().min(1),
  title: z.string().default("제목 없는 페이지"),
  description: z.string().optional(),
  layout: z.enum(["standard", "wide", "fullscreen", "practice"]).default("standard"),
  blocks: z.array(z.unknown()).default([]),
});

export const lessonContentSchema = z.object({
  id: z.string().min(1),
  courseId: z.string().default("default-course"),
  week: z.number().int(),
  day: z.number().int(),
  lesson: z.number().int(),
  title: z.string().default("제목 없는 Lesson"),
  description: z.string().optional(),
  durationMinutes: z.number().optional(),
  pages: z.array(z.unknown()).default([]),
  status: z.enum(["draft", "published"]).default("draft"),
  version: z.number().int().default(1),
  createdAt: z.number().default(0),
  updatedAt: z.number().default(0),
});

export interface BlockParseIssue {
  index: number;
  blockId?: string;
  blockType?: string;
  message: string;
}

export interface ParsedLesson {
  lesson: LessonContent | null;
  /** 걸러진 블록들. 편집기·개발 모드에서 노출해 원인을 알 수 있게 한다. */
  issues: BlockParseIssue[];
  /** 레슨 자체가 파싱 불가일 때의 사유. */
  fatalError?: string;
}

function parseBlocks(rawBlocks: unknown[], issues: BlockParseIssue[], pageLabel: string): LessonBlock[] {
  const blocks: LessonBlock[] = [];
  rawBlocks.forEach((raw, index) => {
    const result = lessonBlockSchema.safeParse(raw);
    if (result.success) {
      blocks.push(result.data as LessonBlock);
      return;
    }
    const candidate = raw as { id?: unknown; type?: unknown };
    issues.push({
      index,
      blockId: typeof candidate?.id === "string" ? candidate.id : undefined,
      blockType: typeof candidate?.type === "string" ? candidate.type : undefined,
      message: `${pageLabel} · ${result.error.issues[0]?.message ?? "알 수 없는 오류"}`,
    });
  });
  return blocks;
}

/** 신뢰할 수 없는 입력(JSON 가져오기, 로컬 저장분)을 안전하게 LessonContent로 바꾼다. */
export function parseLessonContent(raw: unknown): ParsedLesson {
  const issues: BlockParseIssue[] = [];
  const outer = lessonContentSchema.safeParse(raw);
  if (!outer.success) {
    return { lesson: null, issues, fatalError: outer.error.issues[0]?.message ?? "Lesson 형식이 아닙니다." };
  }

  const pages: LessonPage[] = [];
  outer.data.pages.forEach((rawPage, pageIndex) => {
    const parsedPage = lessonPageSchema.safeParse(rawPage);
    if (!parsedPage.success) {
      issues.push({
        index: pageIndex,
        message: `${pageIndex + 1}번째 페이지를 건너뜀 — ${parsedPage.error.issues[0]?.message ?? "형식 오류"}`,
      });
      return;
    }
    pages.push({
      id: parsedPage.data.id,
      title: parsedPage.data.title,
      description: parsedPage.data.description,
      layout: parsedPage.data.layout,
      blocks: parseBlocks(parsedPage.data.blocks, issues, `${parsedPage.data.title}`),
    });
  });

  return {
    lesson: { ...outer.data, pages } as LessonContent,
    issues,
  };
}

export function isKnownBlockType(value: unknown): boolean {
  return typeof value === "string" && (BLOCK_TYPES as readonly string[]).includes(value);
}
