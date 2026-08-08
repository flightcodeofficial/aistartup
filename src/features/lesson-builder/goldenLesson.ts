import type { LessonContent, LessonBlock } from "./types";
import { DEFAULT_LAYOUT, DEFAULT_THEME } from "./types";

// GOLDEN LESSON — "강사가 코딩 없이 1시간짜리 고급 수업을 조립할 수 있는가" 검증용 파일럿.
// 실제 2주차 강의 콘텐츠가 아니라, 블록 조합·레이아웃 다양성·실습 흐름을 확인하는 표본이다.
//
// 레이아웃 다양화 원칙: 10페이지가 전부 같은 카드 나열이 되지 않게 한다.
// Hero → Fullscreen infographic → Editorial split → Fullscreen interactive →
// Practice → Practice workspace → Result → Quiz → Reflection → Summary

export const GOLDEN_LESSON_ID = "golden-lesson-pilot";

const base = {
  visibility: "visible" as const,
  layout: { ...DEFAULT_LAYOUT },
  theme: { ...DEFAULT_THEME },
};

const wide = { ...base, layout: { ...DEFAULT_LAYOUT, width: "wide" as const } };
const full = { ...base, layout: { ...DEFAULT_LAYOUT, width: "full" as const, spacing: "none" as const } };

/** 실습 페이지에서 반복 쓰는 입력 폼 블록 id (save-artifact가 참조한다). */
const EVIDENCE_FORM_ID = "golden-b-evidence-form";

const page1: LessonBlock[] = [
  {
    ...base,
    id: "golden-b-hero",
    type: "rich-text",
    layout: { ...DEFAULT_LAYOUT, width: "wide", spacing: "small" },
    data: {
      emphasis: "hero",
      markdown:
        "# 고객을 정의하면\n# 마케팅이 쉬워진다\n\n오늘 한 시간 동안, 막연한 &lsquo;우리 고객&rsquo;을 **문장으로 쓸 수 있는 정의**로 바꿉니다.",
    },
  },
  {
    ...wide,
    id: "golden-b-hero-image",
    type: "image",
    data: {
      url: "/lesson-content/golden/hero-placeholder.svg",
      alt: "고객 정의 흐름 개요",
      display: "hero",
      objectFit: "cover",
      aspectRatio: "21/9",
      mobileRatio: "4/3",
      caption: "증거 → 세그먼트 → ICP → 가치제안으로 이어지는 오늘의 흐름",
    },
  },
  {
    ...wide,
    id: "golden-b-goals",
    type: "infographic",
    title: "오늘의 학습 목표",
    theme: { background: "muted" },
    data: {
      variant: "checklist",
      items: [
        { label: "고객 증거와 추측을 구분할 수 있다", description: "근거 있음 / 추론 / 검증 필요" },
        { label: "내 사업의 세그먼트 후보를 3개 만든다" },
        { label: "가치제안을 한 문장으로 정리한다" },
      ],
    },
  },
];

const page2: LessonBlock[] = [
  {
    ...wide,
    id: "golden-b-stats",
    type: "infographic",
    title: "왜 고객 정의부터인가",
    data: {
      variant: "stats",
      items: [
        { value: "4시간", label: "월말 보고서 소요", description: "인터뷰에서 반복 등장한 고충" },
        { value: "3개", label: "만들 세그먼트 후보", description: "오늘 실습 산출물" },
        { value: "1문장", label: "최종 가치제안", description: "다음 수업의 원천" },
      ],
    },
  },
  {
    ...wide,
    id: "golden-b-compare",
    type: "infographic",
    title: "상상 속 고객 vs 증거 기반 고객",
    data: {
      variant: "comparison",
      items: [
        {
          label: "상상 속 고객",
          value: "30대 직장인, SNS를 자주 사용함",
          description: "언제 사는지, 지금 무엇을 쓰는지 알 수 없어 메시지를 만들 근거가 없습니다.",
        },
        {
          label: "증거 기반 고객",
          value: "월말마다 보고서에 4시간 쓰는 5~20인 기업 운영담당자",
          description: "촉발 사건과 현재 대안이 드러나 있어 바로 메시지를 만들 수 있습니다.",
        },
      ],
    },
  },
];

const page3: LessonBlock[] = [
  {
    ...wide,
    id: "golden-b-editorial",
    type: "text-image",
    title: "핵심 개념: 증거 태그",
    data: {
      markdown:
        "AI가 준 결과를 그대로 믿지 않으려면 **세 가지로 나눠서** 봐야 합니다.\n\n- **근거 있음** — 고객 원문에서 직접 확인됨\n- **추론** — 여러 원문을 종합하면 그럴듯함\n- **검증 필요** — 원문에 없고 AI가 만들어낸 것\n\n이 습관 하나가 이후 모든 실습의 품질을 좌우합니다.",
      imageUrl: "/lesson-content/golden/concept-placeholder.svg",
      alt: "증거 태그 3단계 개념도",
      imagePosition: "right",
    },
  },
  {
    ...base,
    id: "golden-b-editorial-note",
    type: "rich-text",
    theme: { background: "primary-soft" },
    data: {
      emphasis: "lead",
      markdown:
        "> 완벽한 정답보다, **왜 그렇게 분류했는지** 설명할 수 있는 게 목표입니다.",
    },
  },
];

const page4: LessonBlock[] = [
  {
    ...full,
    id: "golden-b-interactive",
    type: "html-file",
    data: {
      src: "/lesson-content/golden/interactive-canvas.html",
      trustedScript: true,
      designWidth: 1280,
      designHeight: 720,
    },
  },
];

const page5: LessonBlock[] = [
  {
    ...base,
    id: "golden-b-prompt",
    type: "prompt",
    title: "실습용 프롬프트",
    description: "복사해서 ChatGPT에 그대로 붙여넣으세요.",
    data: {
      prompt:
        "아래 고객 후기만을 근거로 다음 5가지를 표로 정리해줘.\n1) 반복 문제 2) 촉발 사건 3) 현재 대안 4) 기대 결과 5) 반대 이유\n\n규칙: 각 항목 옆에 근거가 된 후기 번호를 표시하고, 자료에 없는 내용은 '검증 필요'로 표시할 것.",
      targetTool: "ChatGPT",
      copyable: true,
      inputArtifactTypes: ["customer-evidence", "business-idea"],
    },
  },
  {
    ...base,
    id: "golden-b-external",
    type: "external-link",
    data: {
      practiceName: "ChatGPT에서 고객 증거 정리하기",
      practiceDescription:
        "위 프롬프트를 붙여넣고, 내 고객 후기(없다면 경쟁 상품 리뷰)를 넣어 표를 만들어보세요. 결과는 다음 페이지에 옮겨 적습니다.",
      estimatedMinutes: 12,
      url: "https://chatgpt.com",
      buttonLabel: "ChatGPT 열기",
      openInNewTab: true,
      showSecurityNotice: true,
      requireCompletionCheck: true,
    },
  },
];

const page6: LessonBlock[] = [
  {
    ...base,
    id: EVIDENCE_FORM_ID,
    type: "input-form",
    title: "실습 결과 옮겨 적기",
    description: "ChatGPT에서 만든 표를 보고 아래를 채워주세요.",
    data: {
      fields: [
        {
          id: "idea",
          label: "사업 아이디어 한 문장",
          kind: "short-text",
          required: true,
          placeholder: "예: 소규모 기업용 보고서 자동화",
        },
        {
          id: "stage",
          label: "현재 단계",
          kind: "select",
          required: false,
          options: ["아이디어", "고객 인터뷰 중", "MVP 제작", "초기 매출"],
        },
        {
          id: "problem",
          label: "반복되는 고객 문제",
          kind: "long-text",
          required: true,
          placeholder: "후기에서 반복해서 나온 문제를 적어주세요.",
        },
        {
          id: "trigger",
          label: "구매 촉발 사건",
          kind: "long-text",
          required: false,
        },
        {
          id: "verified",
          label: "실제 고객 자료를 사용했다",
          kind: "checkbox",
          required: false,
          placeholder: "예 (아니면 교육용 가설로 표시됩니다)",
        },
      ],
      artifactType: "customer-evidence",
      inputArtifactTypes: ["business-idea", "customer-evidence"],
    },
  },
];

const page7: LessonBlock[] = [
  {
    ...base,
    id: "golden-b-save",
    type: "save-artifact",
    title: "내 프로젝트에 저장",
    description: "저장하면 다음 Lesson에서 이 내용을 그대로 불러올 수 있습니다.",
    data: {
      artifactType: "customer-evidence",
      artifactTitle: "고객 증거 정리",
      sourceBlockId: EVIDENCE_FORM_ID,
      buttonLabel: "이 내용을 프로젝트에 저장",
    },
  },
  {
    ...base,
    id: "golden-b-preview",
    type: "result-preview",
    title: "지금까지 저장된 고객 증거",
    data: {
      artifactType: "customer-evidence",
      emptyMessage: "위에서 저장하면 여기에 바로 나타납니다.",
    },
  },
];

const page8: LessonBlock[] = [
  {
    ...base,
    id: "golden-b-quiz",
    type: "quiz",
    title: "이해도 확인",
    data: {
      questions: [
        {
          id: "gq1",
          question: "AI가 만든 결과 중 원문에 없는 내용은 어떻게 표시해야 할까요?",
          choices: [
            { id: "a", text: "근거 있음" },
            { id: "b", text: "검증 필요" },
            { id: "c", text: "그냥 삭제한다" },
          ],
          correctChoiceId: "b",
          explanation: "원문에서 확인되지 않으면 '검증 필요'로 표시하고 이후 인터뷰에서 확인합니다.",
        },
        {
          id: "gq2",
          question: "좋은 고객 정의에 반드시 들어가야 하는 것은?",
          choices: [
            { id: "a", text: "나이와 성별" },
            { id: "b", text: "문제·상황·현재 대안" },
            { id: "c", text: "예상 매출" },
          ],
          correctChoiceId: "b",
          explanation: "인구통계보다 문제·상황·현재 대안이 메시지를 만드는 근거가 됩니다.",
        },
        {
          id: "gq3",
          question: "고객 자료가 전혀 없을 때 가장 적절한 행동은?",
          choices: [
            { id: "a", text: "AI에게 완성형 페르소나를 만들어 달라고 한다" },
            { id: "b", text: "경쟁 상품 리뷰를 모으고 '가설'로 표시한다" },
            { id: "c", text: "일단 광고부터 집행한다" },
          ],
          correctChoiceId: "b",
          explanation: "대체 자료를 쓰되 실제 고객 데이터가 아니라는 점을 반드시 표시합니다.",
        },
      ],
    },
  },
];

const page9: LessonBlock[] = [
  {
    ...base,
    id: "golden-b-reflection",
    type: "reflection",
    title: "오늘의 회고",
    data: {
      questions: [
        "오늘 배운 것 중 내 사업에 가장 먼저 적용할 것은?",
        "아직 '검증 필요'로 남아 있는 가정은 무엇인가요?",
      ],
      placeholder: "짧아도 좋으니 솔직하게 적어보세요.",
    },
  },
];

const page10: LessonBlock[] = [
  {
    ...wide,
    id: "golden-b-summary-text",
    type: "rich-text",
    data: {
      emphasis: "lead",
      markdown:
        "## 오늘 만든 결과물\n\n아래는 이번 수업에서 **내 프로젝트에 저장된 것들**입니다. 다음 Lesson에서 그대로 불러와 이어서 작업합니다.",
    },
  },
  {
    ...wide,
    id: "golden-b-summary-preview",
    type: "result-preview",
    title: "고객 증거",
    data: {
      artifactType: "customer-evidence",
      emptyMessage: "아직 저장된 결과물이 없습니다. 7페이지로 돌아가 저장해보세요.",
    },
  },
  {
    ...wide,
    id: "golden-b-summary-next",
    type: "infographic",
    title: "다음 단계",
    theme: { background: "muted" },
    data: {
      variant: "steps",
      items: [
        { label: "세그먼트 나누기", description: "오늘 정리한 증거로 후보 3개를 만듭니다" },
        { label: "ICP · ECP 정의", description: "지금 시도할 고객을 좁힙니다" },
        { label: "가치제안 완성", description: "한 문장으로 압축합니다" },
      ],
    },
  },
  {
    ...wide,
    id: "golden-b-summary-link",
    type: "internal-app",
    data: {
      route: "/workspace",
      practiceName: "내 저장공간에서 결과물 확인하기",
      completionNote: "저장한 결과물을 언제든 다시 열어보고 수정할 수 있습니다.",
      requireCompletionCheck: false,
    },
  },
];

export function buildGoldenLesson(): LessonContent {
  const now = Date.now();
  const pages = [
    { id: "golden-p1", title: "오늘 무엇을 하나요", layout: "wide" as const, blocks: page1 },
    { id: "golden-p2", title: "왜 고객 정의부터인가", layout: "wide" as const, blocks: page2 },
    { id: "golden-p3", title: "핵심 개념: 증거 태그", layout: "wide" as const, blocks: page3 },
    { id: "golden-p4", title: "직접 해보기: 가치제안 캔버스", layout: "fullscreen" as const, blocks: page4 },
    { id: "golden-p5", title: "실습 1 — ChatGPT에서 정리하기", layout: "practice" as const, blocks: page5 },
    { id: "golden-p6", title: "실습 2 — 결과 옮겨 적기", layout: "practice" as const, blocks: page6 },
    { id: "golden-p7", title: "실습 3 — 저장하기", layout: "practice" as const, blocks: page7 },
    { id: "golden-p8", title: "이해도 확인", layout: "standard" as const, blocks: page8 },
    { id: "golden-p9", title: "회고", layout: "standard" as const, blocks: page9 },
    { id: "golden-p10", title: "오늘의 결과", layout: "wide" as const, blocks: page10 },
  ];

  return {
    id: GOLDEN_LESSON_ID,
    courseId: "default-course",
    week: 2,
    day: 1,
    lesson: 98,
    title: "GOLDEN LESSON — 고객 정의 1시간 과정",
    description: "강사가 코딩 없이 조립할 수 있는지 검증하는 파일럿 Lesson입니다.",
    durationMinutes: 60,
    status: "published",
    version: 1,
    createdAt: now,
    updatedAt: now,
    pages,
  };
}
