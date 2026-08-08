// 블록 기반 Lesson 콘텐츠 모델.
//
// 기존 엔진(lib/lessonContent.ts + public/lesson-content/**)은 "Lesson = HTML 파일 목록"이었다.
// 여기서는 한 단계 일반화한다:
//
//   Lesson = Page 목록
//   Page   = Content Block 목록
//   HTML 파일 = 여러 Block 유형 중 하나("html-file")
//
// 즉 기존 HTML 슬라이드는 사라지지 않고, 17종 블록 중 하나로 편입된다.
// 기존 라우트(/week/../lesson/../page/..)와 기존 manifest 로딩 경로는 그대로 살아있고,
// 이 모델은 관리자 Lesson Studio가 조립하는 새 레이어다.

export const BLOCK_TYPES = [
  "rich-text",
  "image",
  "text-image",
  "infographic",
  "html",
  "html-file",
  "video",
  "external-link",
  "internal-app",
  "quiz",
  "input-form",
  "prompt",
  "download",
  "result-preview",
  "save-artifact",
  "reflection",
  "divider",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  "rich-text": "서식 있는 글",
  image: "이미지",
  "text-image": "글 + 이미지",
  infographic: "인포그래픽",
  html: "HTML 직접 입력",
  "html-file": "HTML 파일",
  video: "영상",
  "external-link": "외부 실습 링크",
  "internal-app": "내부 실습",
  quiz: "퀴즈",
  "input-form": "입력 폼",
  prompt: "프롬프트",
  download: "다운로드",
  "result-preview": "결과 미리보기",
  "save-artifact": "결과물 저장",
  reflection: "회고",
  divider: "구분선",
};

export type BlockVisibility = "visible" | "hidden" | "instructor-only";
export type BlockWidth = "narrow" | "normal" | "wide" | "full";
export type BlockAlign = "left" | "center" | "right";
export type BlockSpacing = "none" | "small" | "medium" | "large";

export interface BlockLayout {
  width: BlockWidth;
  align: BlockAlign;
  spacing: BlockSpacing;
  /** 모바일에서 이 블록을 숨긴다(밀도 높은 표·인포그래픽 등). */
  hideOnMobile?: boolean;
}

export interface BlockTheme {
  /** Tailwind 클래스가 아니라 의미 단위 토큰. 렌더러가 클래스로 변환한다. */
  background?: "none" | "muted" | "card" | "primary-soft" | "dark";
  bordered?: boolean;
}

export interface BlockBase {
  id: string;
  title?: string;
  description?: string;
  visibility: BlockVisibility;
  layout: BlockLayout;
  theme: BlockTheme;
}

// ---------- 블록별 data ----------

export interface RichTextBlock extends BlockBase {
  type: "rich-text";
  data: {
    markdown: string;
    /** editorial: 큰 도입부 문단, hero: 강조 타이틀 블록 */
    emphasis?: "normal" | "lead" | "hero";
  };
}

/** 이미지 표현 크기. 썸네일만 나열되지 않도록 큰 화면 표현을 지원한다. */
export type MediaDisplay = "half" | "large" | "hero" | "fullscreen";
export type MediaFit = "contain" | "cover";
export type MediaRatio = "auto" | "16/9" | "4/3" | "1/1" | "3/2" | "21/9";

export interface ImageBlock extends BlockBase {
  type: "image";
  data: {
    url: string;
    alt: string;
    caption?: string;
    display?: MediaDisplay;
    objectFit?: MediaFit;
    aspectRatio?: MediaRatio;
    /** 모바일에서 더 작은 비율로 보여줄지(가로 이미지가 세로 화면을 잡아먹지 않게). */
    mobileRatio?: MediaRatio;
  };
}

export interface TextImageBlock extends BlockBase {
  type: "text-image";
  data: {
    markdown: string;
    imageUrl: string;
    alt: string;
    imagePosition: "left" | "right";
  };
}

export interface InfographicItem {
  label: string;
  value?: string;
  description?: string;
}

export interface InfographicBlock extends BlockBase {
  type: "infographic";
  data: {
    variant: "steps" | "stats" | "comparison" | "checklist" | "image";
    items: InfographicItem[];
    /** variant가 "image"일 때 사용하는 인포그래픽 이미지. */
    imageUrl?: string;
    alt?: string;
    caption?: string;
    /** contain: 이미지 전체가 보이게 / cover: 영역을 꽉 채우게 */
    fit?: MediaFit;
    display?: MediaDisplay;
    aspectRatio?: MediaRatio;
  };
}

/**
 * 좁은 화면에서 HTML을 어떻게 그릴지.
 * - scale      : 디자인 캔버스(1280x720 등)를 통째로 축소. PPT형 슬라이드용 기본값.
 * - responsive : 축소하지 않고 iframe 폭을 화면 폭에 맞춘다. HTML이 자체 @media를 가진 경우.
 */
export type HtmlMobileRenderMode = "scale" | "responsive";

export interface HtmlBlock extends BlockBase {
  type: "html";
  data: {
    html: string;
    /** 관리자가 명시적으로 승인한 콘텐츠만 iframe 안에서 스크립트를 돌릴 수 있다. */
    trustedScript?: boolean;
    /** 디자인 기준 캔버스. 슬라이드형 HTML은 1280x720을 쓴다. */
    designWidth?: number;
    designHeight?: number;
    /** 생략하면 "scale". */
    mobileRenderMode?: HtmlMobileRenderMode;
  };
}

export interface HtmlFileBlock extends BlockBase {
  type: "html-file";
  data: {
    /** public/ 기준 절대경로. 예: /lesson-content/week2/day1/lesson1/page01.html */
    src: string;
    trustedScript?: boolean;
    designWidth?: number;
    designHeight?: number;
    /** 생략하면 "scale". */
    mobileRenderMode?: HtmlMobileRenderMode;
  };
}

export interface VideoBlock extends BlockBase {
  type: "video";
  data: { url: string; provider: "youtube" | "vimeo" | "file"; caption?: string };
}

export interface ExternalLinkBlock extends BlockBase {
  type: "external-link";
  data: {
    url: string;
    buttonLabel: string;
    openInNewTab: boolean;
    /** 외부 사이트로 나간다는 경고를 노출할지. */
    showSecurityNotice: boolean;
    /** 학생이 돌아와서 "실습 완료"를 표시할 수 있게 한다. */
    requireCompletionCheck: boolean;
    /** 실습 카드로 보이도록 하는 메타 정보. */
    practiceName?: string;
    practiceDescription?: string;
    estimatedMinutes?: number;
  };
}

export interface InternalAppBlock extends BlockBase {
  type: "internal-app";
  data: {
    /** 앱 내부 경로. 예: /mentor, /dashboard/projects */
    route: string;
    practiceName: string;
    inputArtifactType?: string;
    outputArtifactType?: string;
    /** 실습에 참고할 이전 결과물 유형들(선택). */
    inputArtifactTypes?: string[];
    completionNote?: string;
    requireCompletionCheck: boolean;
  };
}

export interface QuizChoice {
  id: string;
  text: string;
}

export interface QuizQuestionData {
  id: string;
  question: string;
  choices: QuizChoice[];
  correctChoiceId: string;
  explanation?: string;
}

export interface QuizBlock extends BlockBase {
  type: "quiz";
  data: { questions: QuizQuestionData[] };
}

export type InputFieldKind = "short-text" | "long-text" | "number" | "select" | "checkbox";

export interface InputFormField {
  id: string;
  label: string;
  placeholder?: string;
  kind: InputFieldKind;
  required: boolean;
  /** kind가 select일 때 선택지. */
  options?: string[];
  /** kind가 checkbox일 때 기본 체크 여부. */
  defaultChecked?: boolean;
}

export interface InputFormBlock extends BlockBase {
  type: "input-form";
  data: {
    fields: InputFormField[];
    /** 제출 결과를 어떤 artifact로 저장할지(save-artifact 블록과 연계). */
    artifactType?: string;
    /** 이전 Lesson 결과를 입력으로 불러올 수 있는 artifact 유형들.
     *  Lesson 간 연결을 코드에 하드코딩하지 않고 콘텐츠 설정으로 정의한다. */
    inputArtifactTypes?: string[];
  };
}

export interface PromptBlock extends BlockBase {
  type: "prompt";
  data: {
    prompt: string;
    targetTool?: string;
    copyable: boolean;
    /** 불러온 artifact 내용을 프롬프트 뒤에 덧붙여 함께 복사할 수 있게 한다. */
    inputArtifactTypes?: string[];
  };
}

export interface DownloadBlock extends BlockBase {
  type: "download";
  data: { url: string; fileName: string; sizeLabel?: string };
}

export interface ResultPreviewBlock extends BlockBase {
  type: "result-preview";
  data: {
    /** 워크스페이스에서 읽어올 artifact 유형. 비어있으면 안내만 표시. */
    artifactType?: string;
    emptyMessage?: string;
  };
}

export interface SaveArtifactBlock extends BlockBase {
  type: "save-artifact";
  data: {
    artifactType: string;
    artifactTitle: string;
    /** 같은 페이지의 input-form 블록 id. 비어있으면 자유 입력 저장. */
    sourceBlockId?: string;
    buttonLabel: string;
  };
}

export interface ReflectionBlock extends BlockBase {
  type: "reflection";
  data: { questions: string[]; placeholder?: string };
}

export interface DividerBlock extends BlockBase {
  type: "divider";
  data: { style: "line" | "space" | "dots" };
}

export type LessonBlock =
  | RichTextBlock
  | ImageBlock
  | TextImageBlock
  | InfographicBlock
  | HtmlBlock
  | HtmlFileBlock
  | VideoBlock
  | ExternalLinkBlock
  | InternalAppBlock
  | QuizBlock
  | InputFormBlock
  | PromptBlock
  | DownloadBlock
  | ResultPreviewBlock
  | SaveArtifactBlock
  | ReflectionBlock
  | DividerBlock;

// ---------- Page / Lesson ----------

export type PageLayout = "standard" | "wide" | "fullscreen" | "practice";

export interface LessonPage {
  id: string;
  title: string;
  description?: string;
  layout: PageLayout;
  blocks: LessonBlock[];
}

export type LessonStatus = "draft" | "published";

export interface LessonContent {
  id: string;
  courseId: string;
  week: number;
  day: number;
  lesson: number;
  title: string;
  description?: string;
  durationMinutes?: number;
  pages: LessonPage[];
  status: LessonStatus;
  version: number;
  createdAt: number;
  updatedAt: number;
}

// ---------- 기본값 팩토리 ----------

export const DEFAULT_LAYOUT: BlockLayout = { width: "normal", align: "left", spacing: "medium" };
export const DEFAULT_THEME: BlockTheme = { background: "none", bordered: false };

export function createBlockId(): string {
  return `block-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createPageId(): string {
  return `page-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** 편집기에서 "블록 추가"를 눌렀을 때 쓰는, 타입별 최소 유효 블록. */
export function createEmptyBlock(type: BlockType): LessonBlock {
  const base = {
    id: createBlockId(),
    visibility: "visible" as const,
    layout: { ...DEFAULT_LAYOUT },
    theme: { ...DEFAULT_THEME },
  };

  switch (type) {
    case "rich-text":
      return { ...base, type, data: { markdown: "여기에 내용을 입력하세요." } };
    case "image":
      return { ...base, type, data: { url: "", alt: "" } };
    case "text-image":
      return { ...base, type, data: { markdown: "", imageUrl: "", alt: "", imagePosition: "right" } };
    case "infographic":
      return { ...base, type, data: { variant: "steps", items: [{ label: "1단계" }] } };
    case "html":
      return { ...base, type, data: { html: "<p>HTML을 붙여넣으세요.</p>" } };
    case "html-file":
      return { ...base, type, data: { src: "" } };
    case "video":
      return { ...base, type, data: { url: "", provider: "youtube" } };
    case "external-link":
      return {
        ...base,
        type,
        data: {
          url: "",
          buttonLabel: "실습 열기",
          openInNewTab: true,
          showSecurityNotice: true,
          requireCompletionCheck: true,
        },
      };
    case "internal-app":
      return {
        ...base,
        type,
        data: { route: "/dashboard/projects", practiceName: "실습", requireCompletionCheck: true },
      };
    case "quiz":
      return {
        ...base,
        type,
        data: {
          questions: [
            {
              id: createBlockId(),
              question: "질문을 입력하세요.",
              choices: [
                { id: "c1", text: "보기 1" },
                { id: "c2", text: "보기 2" },
              ],
              correctChoiceId: "c1",
            },
          ],
        },
      };
    case "input-form":
      return {
        ...base,
        type,
        data: {
          fields: [{ id: createBlockId(), label: "항목", kind: "long-text", required: false }],
        },
      };
    case "prompt":
      return { ...base, type, data: { prompt: "프롬프트를 입력하세요.", copyable: true } };
    case "download":
      return { ...base, type, data: { url: "", fileName: "file.pdf" } };
    case "result-preview":
      return { ...base, type, data: {} };
    case "save-artifact":
      return {
        ...base,
        type,
        data: { artifactType: "custom", artifactTitle: "결과물", buttonLabel: "내 프로젝트에 저장" },
      };
    case "reflection":
      return { ...base, type, data: { questions: ["오늘 배운 것 중 가장 중요한 하나는?"] } };
    case "divider":
      return { ...base, type, data: { style: "line" } };
  }
}

export function createEmptyPage(title = "새 페이지"): LessonPage {
  return { id: createPageId(), title, layout: "standard", blocks: [] };
}
