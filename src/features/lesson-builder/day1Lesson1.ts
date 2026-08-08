import type { LessonBlock, LessonContent } from "./types";
import { DEFAULT_LAYOUT, DEFAULT_THEME } from "./types";

// 2주차 Day1 Lesson1 — "왜 고객 분석이 먼저인가" 실제 수업 콘텐츠.
//
// GOLDEN LESSON이 "조립이 되는가"를 확인하는 파일럿이었다면, 이 파일은 실제로 진행할 수업이다.
// 원고(2주차_Day1_Lesson1_통합PWA_최종콘텐츠.md)를 축약 없이 옮겼고,
// 새 block type은 만들지 않았다 — 기존 17종만 조합했다.
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

const HERO_PLACEHOLDER = "/lesson-content/week2-day1-lesson1/hero-placeholder.svg";
const INTERACTIVE_HTML = "/lesson-content/week2-day1-lesson1/interactive_ai_human_roles.html";

/** Page09 입력 폼. Page10 save-artifact가 이 id를 참조한다. */
export const DAY1_LESSON1_RESULT_FORM_ID = "w2d1l1-b09-form";

const base = {
  visibility: "visible" as const,
  layout: { ...DEFAULT_LAYOUT },
  theme: { ...DEFAULT_THEME },
};

const wide = { ...base, layout: { ...DEFAULT_LAYOUT, width: "wide" as const } };
const full = {
  ...base,
  layout: { ...DEFAULT_LAYOUT, width: "full" as const, spacing: "none" as const },
};

// ---------------------------------------------------------------- Page 01

const page01 = (): LessonBlock[] => [
  {
    ...base,
    id: "w2d1l1-b01-hero",
    type: "rich-text",
    layout: { ...DEFAULT_LAYOUT, width: "wide", spacing: "small" },
    data: {
      emphasis: "hero",
      markdown:
        "# 고객을 모르면\n# AI는 틀린 방향을 더 빨리 확장합니다\n\n**빠르게 만드는 것보다, 누구를 위해 만드는지가 먼저입니다.**",
    },
  },
  {
    ...wide,
    id: "w2d1l1-b01-image",
    type: "image",
    // 실제 히어로 사진은 아직 없다. 원고의 촬영 가이드를 화면과 캡션에 남긴 placeholder 상태다.
    data: {
      url: HERO_PLACEHOLDER,
      alt: "이번 주 흐름: 고객 증거 → 세그먼트 → 가치제안 → 콘텐츠 → 랜딩페이지 → 문의 → FAQ·응대",
      display: "hero",
      objectFit: "cover",
      aspectRatio: "21/9",
      mobileRatio: "4/3",
      caption:
        "히어로 이미지 준비 중 — 제작 가이드: 창업자 또는 작은 팀이 고객 인터뷰 메모, 후기, 대시보드, 포스트잇을 분석하는 현대적인 실제 업무 장면. AI 로봇·뇌·마법봉 이미지 금지.",
    },
  },
  {
    ...wide,
    id: "w2d1l1-b01-flow",
    type: "rich-text",
    data: {
      emphasis: "lead",
      markdown:
        "이번 주에는 다음 흐름을 하나씩 완성합니다.\n\n**고객 증거 → 세그먼트 → 가치제안 → 콘텐츠 → 랜딩페이지 → 문의 → FAQ·응대**\n\n오늘은 그 시작점인 **고객 분석**을 다룹니다.\n\nAI는 콘텐츠와 초안을 빠르게 만들 수 있습니다. 그러나 **누구의 어떤 문제를 해결해야 하는가**는 고객 자료에서 찾아야 합니다.\n\n> 오늘의 질문 — 우리는 누구의 어떤 문제를 해결하고 있는가?",
    },
  },
  {
    ...wide,
    id: "w2d1l1-b01-goals",
    type: "infographic",
    title: "오늘의 목표",
    theme: { background: "muted" },
    data: {
      variant: "checklist",
      items: [
        { label: "고객 증거가 먼저인 이유 이해" },
        { label: "AI와 사람의 역할 구분" },
        { label: "STP 전체 흐름 이해" },
        { label: "다음 Lesson에 사용할 자료 준비" },
      ],
    },
  },
  {
    ...wide,
    id: "w2d1l1-b01-instructor",
    type: "rich-text",
    title: "강사 멘트",
    // 학생 화면에는 보이지 않고, 강사 모드에서만 노출된다.
    visibility: "instructor-only",
    theme: { background: "primary-soft", bordered: true },
    data: {
      markdown:
        "“이번 주는 AI로 콘텐츠를 많이 만드는 수업이 아닙니다. 그 전에 누구를 위해 만들 것인지부터 정합니다. 고객을 모른 채 자동화하면 잘못된 방향을 더 빠르게 반복하게 됩니다.”",
    },
  },
];

// ---------------------------------------------------------------- Page 02

const page02 = (assets: Day1Lesson1Assets): LessonBlock[] => [
  {
    ...full,
    id: "w2d1l1-b02-visual",
    type: "infographic",
    data: {
      variant: "image",
      items: [],
      imageUrl: assets.aiMarketingShift,
      alt: "AI 활용이 기본이 되면서 마케팅의 질문이 생성량에서 고객 이해로 옮겨가는 흐름",
      fit: "contain",
      display: "fullscreen",
      aspectRatio: "16/9",
    },
  },
  {
    ...wide,
    id: "w2d1l1-b02-stat",
    type: "infographic",
    title: "AI 활용은 기본이 되었습니다",
    theme: { background: "primary-soft" },
    data: {
      variant: "stats",
      items: [
        {
          label: "AI로 최근 20년 중 가장 큰 마케팅 변화가 일어나고 있다고 응답",
          value: "61%",
          description:
            "HubSpot의 2026년 조사에서 마케터의 61%가 그렇게 답했습니다. 해당 조사 표본의 응답이며 국내 모든 창업자에게 일반화하지 않습니다.",
        },
      ],
    },
  },
  {
    ...wide,
    id: "w2d1l1-b02-shift",
    type: "infographic",
    theme: { background: "muted" },
    data: {
      variant: "comparison",
      items: [
        {
          label: "과거의 질문",
          description:
            "AI로 얼마나 많이 만들 수 있는가?\n제작 시간을 얼마나 줄일 수 있는가?\n몇 개 채널에 동시에 올릴 수 있는가?",
        },
        {
          label: "지금의 질문",
          description:
            "어떤 고객 증거를 근거로 만들었는가?\n메시지에 브랜드 관점과 신뢰가 있는가?\nAI 결과를 누가 검수했는가?\n고객의 다음 행동과 연결되는가?",
        },
      ],
    },
  },
  {
    ...wide,
    id: "w2d1l1-b02-note",
    type: "rich-text",
    data: {
      markdown:
        "> 생성량보다 **고객 이해 → 일관된 메시지 → 검수 가능한 결과물**이 중요합니다.\n\n출처: `HubSpot, 2026 State of Marketing — 내부 딥리서치 수록`",
    },
  },
];

// ---------------------------------------------------------------- Page 03

const page03 = (assets: Day1Lesson1Assets): LessonBlock[] => [
  {
    ...wide,
    id: "w2d1l1-b03-title",
    type: "rich-text",
    layout: { ...DEFAULT_LAYOUT, width: "wide", spacing: "small" },
    data: {
      emphasis: "hero",
      markdown: "# 어느 쪽이 실제로 팔 수 있는\n# 고객처럼 보이나요?",
    },
  },
  {
    ...full,
    id: "w2d1l1-b03-visual",
    type: "infographic",
    data: {
      variant: "image",
      items: [],
      imageUrl: assets.imaginedVsEvidence,
      alt: "상상 속 고객과 증거 기반 고객 정의를 나란히 비교한 도식",
      fit: "contain",
      display: "fullscreen",
      aspectRatio: "16/9",
    },
  },
  {
    ...wide,
    id: "w2d1l1-b03-imagined",
    type: "rich-text",
    title: "상상 속 고객",
    theme: { background: "muted", bordered: true },
    data: {
      markdown:
        "**“SNS를 자주 쓰는 30대 직장인”**\n\n알 수 없는 것:\n\n- 정확히 어떤 문제가 있는가?\n- 문제가 언제 심해지는가?\n- 지금 무엇으로 해결하는가?\n- 왜 기존 방식을 바꾸려 하는가?\n- 돈을 쓸 만큼 심각한가?",
    },
  },
  {
    ...wide,
    id: "w2d1l1-b03-evidence",
    type: "rich-text",
    title: "증거 기반 고객",
    theme: { background: "primary-soft", bordered: true },
    data: {
      markdown:
        "**“월말마다 수작업 보고서 작성에 약 4시간이 걸리고, 팀장 보고 전 오류를 걱정하는 5~20인 기업 운영담당자”**\n\n보이는 것:\n\n- 반복 문제: 수작업 보고서\n- 촉발 사건: 월말 보고\n- 현재 대안: 엑셀·복사 붙여넣기·수작업 검수\n- 기대 결과: 시간 절감·오류 감소\n- 구매 장벽: 기존 방식 변경 부담·데이터 보안 우려",
    },
  },
  {
    ...wide,
    id: "w2d1l1-b03-note",
    type: "rich-text",
    data: {
      markdown:
        "`교육용 비교 사례 — 실제 시장 통계가 아님`\n\n> 고객을 나이로 설명하지 말고 **문제·상황·행동·현재 대안**으로 설명합니다.",
    },
  },
];

// ---------------------------------------------------------------- Page 04

const page04 = (): LessonBlock[] => [
  {
    ...full,
    id: "w2d1l1-b04-interactive",
    type: "html-file",
    // 안에 작은 인터랙션 스크립트가 있어 관리자가 명시적으로 승인한 상태로 둔다.
    // 외부 CDN·fetch·부모 창 접근이 없는 것을 확인했다.
    data: {
      src: INTERACTIVE_HTML,
      trustedScript: true,
      designWidth: 1280,
      designHeight: 720,
      // 이 HTML은 자체 @media (max-width:640px)를 갖고 있다.
      // 폰에서 29%로 축소하면 글씨를 읽을 수 없으므로 반응형 모드로 넘긴다.
      mobileRenderMode: "responsive",
    },
  },
  {
    ...wide,
    id: "w2d1l1-b04-baseline",
    type: "rich-text",
    data: {
      markdown:
        "> 수업 기본선 — AI가 초안을 만들고, 사람이 마지막 버튼을 누릅니다.\n\n출처: `Anthropic 소기업용 워크플로 사례 — 내부 딥리서치 수록`",
    },
  },
];

// ---------------------------------------------------------------- Page 05

const page05 = (): LessonBlock[] => [
  {
    ...base,
    id: "w2d1l1-b05-title",
    type: "rich-text",
    layout: { ...DEFAULT_LAYOUT, spacing: "small" },
    data: { emphasis: "hero", markdown: "# 그럴듯함과 사실은 다릅니다" },
  },
  {
    ...base,
    id: "w2d1l1-b05-levels",
    type: "infographic",
    data: {
      variant: "steps",
      items: [
        {
          label: "근거 있음",
          description:
            "고객 원문이나 승인된 자료에서 직접 확인되는 내용 — 예) 후기 03: “월말 보고서 작성에 4시간이 걸립니다.”",
        },
        {
          label: "합리적 추론",
          description:
            "여러 근거를 함께 보면 가능성이 있지만 직접 확인되지는 않은 내용 — 예) 여러 후기에서 오류 재검수가 반복됨 → 보고 전 품질 불안이 클 수 있음",
        },
        {
          label: "검증 필요",
          description:
            "AI가 제안했지만 원문이나 승인된 자료에서 확인되지 않는 내용 — 예) “이 고객은 월 10만 원까지 지불할 것이다.”",
        },
      ],
    },
  },
  {
    ...base,
    id: "w2d1l1-b05-rules",
    type: "rich-text",
    title: "판정 규칙",
    theme: { background: "muted", bordered: true },
    data: {
      markdown:
        "- 숫자에는 출처·기준일·정의가 필요하다.\n- 고객 발언에는 원문 번호가 필요하다.\n- 없는 정보는 채우지 않는다.\n- 불확실한 내용은 다음 인터뷰 질문으로 바꾼다.\n- AI가 만든 페르소나는 실제 고객이 아니라 가설이다.",
    },
  },
  {
    ...base,
    id: "w2d1l1-b05-quiz",
    type: "quiz",
    title: "이해도 확인",
    data: {
      questions: [
        {
          id: "w2d1l1-q1",
          question: "“이 고객은 복잡한 설정을 싫어할 것이다.” — 이 문장은 어디에 해당할까요?",
          choices: [
            { id: "q1c1", text: "근거 있음" },
            { id: "q1c2", text: "합리적 추론" },
            { id: "q1c3", text: "검증 필요" },
          ],
          correctChoiceId: "q1c3",
          explanation:
            "고객 원문에서 직접 확인되지 않았습니다. 이런 문장은 지우지 말고 ‘검증 필요’로 남겨 다음 인터뷰 질문으로 바꿉니다.",
        },
        {
          id: "w2d1l1-q2",
          question: "AI가 고객의 예상 지불의사를 월 10만원으로 제안했다. 가장 적절한 행동은?",
          choices: [
            { id: "q2c1", text: "바로 가격정책으로 사용" },
            { id: "q2c2", text: "문구만 수정" },
            { id: "q2c3", text: "검증 필요로 표시하고 인터뷰·가격 테스트로 확인" },
            { id: "q2c4", text: "경쟁사보다 낮게 설정" },
          ],
          correctChoiceId: "q2c3",
          explanation:
            "지불의사는 자료에 없는 숫자입니다. 숫자에는 출처·기준일·정의가 필요하므로 검증 대상으로 넘깁니다.",
        },
      ],
    },
  },
];

// ---------------------------------------------------------------- Page 06

const page06 = (assets: Day1Lesson1Assets): LessonBlock[] => [
  {
    ...wide,
    id: "w2d1l1-b06-title",
    type: "rich-text",
    layout: { ...DEFAULT_LAYOUT, width: "wide", spacing: "small" },
    data: { emphasis: "hero", markdown: "# 나누고, 선택하고,\n# 선택 이유를 설명합니다" },
  },
  {
    ...full,
    id: "w2d1l1-b06-visual",
    type: "infographic",
    data: {
      variant: "image",
      items: [],
      imageUrl: assets.stpMap,
      alt: "Segmentation · Targeting · Positioning 전체 지도",
      fit: "contain",
      display: "fullscreen",
      aspectRatio: "16/9",
    },
  },
  {
    ...wide,
    id: "w2d1l1-b06-stp",
    type: "infographic",
    data: {
      variant: "steps",
      items: [
        {
          label: "S — Segmentation",
          value: "나눈다",
          description: "비슷한 문제·상황·행동을 가진 고객군을 구분",
        },
        {
          label: "T — Targeting",
          value: "고른다",
          description: "지금 가장 먼저 검증할 고객을 선택",
        },
        {
          label: "P — Positioning",
          value: "설명한다",
          description: "선택한 고객에게 우리 제품의 의미와 차이를 설명",
        },
      ],
    },
  },
  {
    ...wide,
    id: "w2d1l1-b06-questions",
    type: "rich-text",
    title: "각 단계에서 던지는 질문",
    theme: { background: "muted", bordered: true },
    data: {
      markdown:
        "**S — Segmentation**\n\n- 어떤 문제가 반복되는가?\n- 어떤 사건이 문제를 심각하게 만드는가?\n- 지금 어떤 대안을 쓰는가?\n- 무엇 때문에 구매를 미루는가?\n\n**T — Targeting**\n\n- 문제의 빈도와 심각도는?\n- 이미 시간·비용을 쓰고 있는가?\n- 새 해결책을 시도할 이유가 있는가?\n- 우리가 접근 가능한가?\n- 우리와 맞지 않는 조건은?\n\n**P — Positioning**\n\n- 고객이 해야 할 일은 무엇인가?\n- 어떤 고충을 줄이는가?\n- 어떤 결과를 얻는가?\n- 현재 대안과 무엇이 다른가?\n- 왜 믿을 수 있는가?",
    },
  },
  {
    ...wide,
    id: "w2d1l1-b06-connect",
    type: "rich-text",
    data: {
      markdown:
        "Day1 연결: `고객 증거 → 세그먼트 → ECP/ICP → 페르소나·여정 → 가치제안`\n\n> 세분화 없이 타깃이 없고, 타깃 없이 포지셔닝이 없습니다.",
    },
  },
];

// ---------------------------------------------------------------- Page 07

const page07 = (): LessonBlock[] => [
  {
    ...base,
    id: "w2d1l1-b07-title",
    type: "rich-text",
    layout: { ...DEFAULT_LAYOUT, spacing: "small" },
    data: {
      emphasis: "hero",
      markdown: "# 고객 ‘설명’이 아니라\n# 고객 ‘증거’를 준비합니다",
    },
  },
  {
    ...base,
    id: "w2d1l1-b07-sources",
    type: "infographic",
    theme: { background: "muted" },
    data: {
      variant: "comparison",
      items: [
        {
          label: "실제 자료가 있는 경우",
          description:
            "고객 인터뷰 5건 이상\n리뷰·문의·상담 메모\n경쟁 상품 리뷰\n기존 서비스 소개문\n현재 고객이 쓰는 대안",
        },
        {
          label: "실제 고객이 아직 없는 경우",
          description:
            "경쟁 상품 공개 리뷰 약 20건\n공개 커뮤니티 질문\n지인 또는 동료와 진행한 모의 인터뷰\n자신의 가설",
        },
      ],
    },
  },
  {
    ...base,
    id: "w2d1l1-b07-tagging",
    type: "rich-text",
    title: "자료 유형은 반드시 표시합니다",
    data: {
      markdown:
        "- 실제 고객 자료\n- 공개 대체 자료\n- 교육용 모의 자료\n- 창업자 가설",
    },
  },
  {
    ...base,
    id: "w2d1l1-b07-privacy",
    type: "infographic",
    title: "개인정보 체크",
    theme: { background: "primary-soft", bordered: true },
    data: {
      variant: "checklist",
      items: [
        { label: "실명 제거" },
        { label: "이메일 제거" },
        { label: "전화번호 제거" },
        { label: "주문·계약번호 제거" },
        { label: "회사 내부정보 제거" },
        { label: "필요한 경우 고객이 특정되지 않도록 요약" },
      ],
    },
  },
  {
    ...base,
    id: "w2d1l1-b07-form",
    type: "input-form",
    title: "실습 전 자료 준비",
    description: "여기에 적은 내용은 다음 페이지 프롬프트에 그대로 옮겨 넣습니다.",
    data: {
      inputArtifactTypes: ["business-idea", "customer-evidence"],
      fields: [
        {
          id: "businessIdea",
          label: "사업 아이디어 한 문장",
          kind: "long-text",
          required: false,
          placeholder: "무엇을, 누구에게, 어떤 방식으로 제공하나요?",
        },
        {
          id: "customerDefinition",
          label: "현재 생각하는 고객 한 문장",
          kind: "long-text",
          required: false,
          placeholder: "지금 시점의 가설이어도 괜찮습니다.",
        },
        {
          id: "evidenceSource",
          label: "자료 출처 유형",
          kind: "select",
          required: false,
          options: [
            "실제 고객 인터뷰",
            "고객 리뷰·문의",
            "경쟁상품 리뷰",
            "공개 커뮤니티",
            "모의 인터뷰",
            "아직 없음",
          ],
        },
        {
          id: "currentAlternative",
          label: "고객은 지금 이 문제를 어떻게 해결하는가?",
          kind: "long-text",
          required: false,
          placeholder: "엑셀, 수작업, 다른 서비스, 아예 방치 등",
        },
        {
          id: "knownTrigger",
          label: "문제가 특히 심해지는 순간·사건",
          kind: "long-text",
          required: false,
          placeholder: "월말 보고, 성수기, 인원 변동 등",
        },
        {
          id: "unknowns",
          label: "아직 모르는 점",
          kind: "long-text",
          required: false,
          placeholder: "모르는 것을 적는 칸입니다. 비워두지 말고 솔직하게 적으세요.",
        },
      ],
    },
  },
];

// ---------------------------------------------------------------- Page 08

const page08 = (): LessonBlock[] => [
  {
    ...base,
    id: "w2d1l1-b08-title",
    type: "rich-text",
    layout: { ...DEFAULT_LAYOUT, spacing: "small" },
    data: {
      emphasis: "hero",
      markdown: "# ChatGPT에게 고객을 만들라고 하지 말고,\n# 자료를 분석하게 합니다",
    },
  },
  {
    ...base,
    id: "w2d1l1-b08-prompt",
    type: "prompt",
    title: "고객 증거 1차 분석 프롬프트",
    description:
      "복사한 뒤 {{ }} 부분을 앞 페이지에 적은 내 답으로 바꿔 넣으세요. [고객 자료] 자리에는 익명화한 인터뷰·리뷰·문의를 붙여넣습니다.",
    data: {
      targetTool: "ChatGPT",
      copyable: true,
      prompt: `당신은 초기 창업자의 고객 분석 보조자다.

아래 자료만을 근거로 분석하라.
자료에 없는 인구통계, 성격, 지불의사, 고객 발언, 통계는 만들지 마라.

[사업 아이디어]
{{businessIdea}}

[현재 생각하는 고객]
{{customerDefinition}}

[현재 대안]
{{currentAlternative}}

[알고 있는 촉발 사건]
{{knownTrigger}}

[고객 자료]
여기에 익명화한 고객 인터뷰, 리뷰, 문의, 공개 대체자료를 붙여넣는다.

분석 규칙:
1. 자료에 직접 등장한 사실과 추론을 분리한다.
2. 각 인사이트에 근거가 된 원문 번호를 표시한다.
3. 다음 항목을 추출한다.
   - 반복되는 문제
   - 구매 또는 탐색 촉발 사건
   - 현재 대안
   - 기대 결과
   - 구매·변경 반대 이유
4. 근거가 부족한 내용은 '검증 필요'로 표시한다.
5. 근거가 없는 나이·성별·소득·성격 특성은 만들지 않는다.

출력:
A. 근거 있음
B. 합리적 추론
C. 검증 필요
D. 다음 인터뷰에서 확인할 질문 5개`,
    },
  },
  {
    ...base,
    id: "w2d1l1-b08-link",
    type: "external-link",
    description:
      "실제 고객의 이름·전화번호·이메일·주문번호·회사 내부정보는 입력하지 않습니다.",
    data: {
      url: "https://chatgpt.com/",
      buttonLabel: "ChatGPT에서 분석 실행",
      openInNewTab: true,
      showSecurityNotice: true,
      requireCompletionCheck: true,
      practiceName: "ChatGPT에서 분석 실행",
      practiceDescription:
        "위 프롬프트를 붙여넣고, 내 자료를 넣어 A/B/C/D 네 가지 출력을 받아옵니다.",
      estimatedMinutes: 12,
    },
  },
];

// ---------------------------------------------------------------- Page 09

const page09 = (): LessonBlock[] => [
  {
    ...base,
    id: "w2d1l1-b09-title",
    type: "rich-text",
    layout: { ...DEFAULT_LAYOUT, spacing: "small" },
    data: {
      emphasis: "hero",
      markdown: "# AI의 답을 그대로 저장하지 말고,\n# 검토한 결과만 남깁니다",
    },
  },
  {
    ...base,
    id: DAY1_LESSON1_RESULT_FORM_ID,
    type: "input-form",
    title: "오늘의 분석 결과",
    // save-artifact가 참조하는 단일 폼이다. 저장 결과에 앞 페이지 값도 함께 남아야 해서,
    // Page07에 적은 내용을 여기로 옮겨 적는 칸을 뒤에 붙였다(구조 변경 대신 안내로 해결).
    description: "여기에 적은 내용이 다음 페이지에서 결과물로 저장됩니다.",
    data: {
      inputArtifactTypes: ["customer-evidence", "customer-analysis-foundation"],
      fields: [
        {
          id: "evidenceFacts",
          label: "근거 있음",
          kind: "long-text",
          required: false,
          placeholder: "원문에서 직접 확인된 사실만. 원문 번호를 함께 적습니다.",
        },
        {
          id: "inferences",
          label: "합리적 추론",
          kind: "long-text",
          required: false,
          placeholder: "가능성은 있지만 직접 확인되지 않은 내용",
        },
        {
          id: "needsValidation",
          label: "검증 필요",
          kind: "long-text",
          required: false,
          placeholder: "확인되지 않은 내용. 비워두지 말고 솔직하게 남기세요.",
        },
        {
          id: "nextQuestions",
          label: "다음 인터뷰에서 확인할 질문",
          kind: "long-text",
          required: false,
          placeholder: "검증 필요 항목을 질문 문장으로 바꿔 적습니다.",
        },
        {
          id: "foundationSummary",
          label: "현재까지의 고객 분석 요약 (3~5문장)",
          kind: "long-text",
          required: false,
        },
        {
          id: "businessIdea",
          label: "사업 아이디어 한 문장 (앞 페이지에서 옮겨 적기)",
          kind: "long-text",
          required: false,
        },
        {
          id: "customerDefinition",
          label: "현재 생각하는 고객 한 문장 (앞 페이지에서 옮겨 적기)",
          kind: "long-text",
          required: false,
        },
        {
          id: "evidenceSource",
          label: "자료 출처 유형 (앞 페이지에서 옮겨 적기)",
          kind: "select",
          required: false,
          options: [
            "실제 고객 인터뷰",
            "고객 리뷰·문의",
            "경쟁상품 리뷰",
            "공개 커뮤니티",
            "모의 인터뷰",
            "아직 없음",
          ],
        },
        {
          id: "currentAlternative",
          label: "현재 대안 (앞 페이지에서 옮겨 적기)",
          kind: "long-text",
          required: false,
        },
        {
          id: "knownTrigger",
          label: "촉발 사건 (앞 페이지에서 옮겨 적기)",
          kind: "long-text",
          required: false,
        },
      ],
    },
  },
  {
    ...base,
    id: "w2d1l1-b09-note",
    type: "rich-text",
    theme: { background: "muted", bordered: true },
    data: {
      markdown:
        "좋은 결과는 칸이 모두 꽉 찬 결과가 아닙니다. **모르는 것을 ‘검증 필요’로 남길 수 있는 결과가 좋은 분석입니다.**",
    },
  },
];

// ---------------------------------------------------------------- Page 10

const page10 = (): LessonBlock[] => [
  {
    ...wide,
    id: "w2d1l1-b10-title",
    type: "rich-text",
    layout: { ...DEFAULT_LAYOUT, width: "wide", spacing: "small" },
    data: {
      emphasis: "hero",
      markdown: "# 오늘 만든 것은 ‘고객 정답’이 아니라\n# 분석의 출발점입니다",
    },
  },
  {
    ...wide,
    id: "w2d1l1-b10-preview",
    type: "result-preview",
    title: "지금까지 저장된 고객 분석 기초",
    data: {
      artifactType: "customer-analysis-foundation",
      emptyMessage: "아직 저장된 결과가 없습니다. 아래에서 오늘 정리한 내용을 저장해보세요.",
    },
  },
  {
    ...wide,
    id: "w2d1l1-b10-save",
    type: "save-artifact",
    data: {
      artifactType: "customer-analysis-foundation",
      artifactTitle: "Day1 Lesson1 — 고객 분석 기초",
      sourceBlockId: DAY1_LESSON1_RESULT_FORM_ID,
      buttonLabel: "내 프로젝트에 저장",
    },
  },
  {
    ...wide,
    id: "w2d1l1-b10-checklist",
    type: "infographic",
    title: "오늘 확인한 것",
    theme: { background: "muted" },
    data: {
      variant: "checklist",
      items: [
        { label: "AI는 고객을 상상하는 도구가 아니라 분석 보조 도구다." },
        { label: "고객은 문제·상황·행동·현재 대안으로 본다." },
        { label: "AI 결과는 근거·추론·검증 필요로 구분한다." },
        { label: "외부 행동 전에는 사람이 승인한다." },
      ],
    },
  },
  {
    ...wide,
    id: "w2d1l1-b10-reflection",
    type: "reflection",
    data: {
      questions: [
        "오늘 분석 전후로 고객을 설명하는 방식에서 가장 크게 달라진 점은 무엇인가요?",
      ],
      placeholder: "한두 문장이면 충분합니다.",
    },
  },
  {
    ...wide,
    id: "w2d1l1-b10-workspace",
    type: "internal-app",
    data: {
      route: "/workspace",
      practiceName: "내 프로젝트에서 저장 결과 보기",
      inputArtifactTypes: ["customer-analysis-foundation"],
      completionNote: "저장한 결과물은 다음 Lesson의 입력으로 다시 불러올 수 있습니다.",
      requireCompletionCheck: false,
    },
  },
  {
    ...wide,
    id: "w2d1l1-b10-next",
    type: "rich-text",
    data: {
      markdown: "**다음 Lesson — 고객 증거를 태깅하고 세그먼트 후보를 만든다**",
    },
  },
];

export function buildDay1Lesson1(assets: Day1Lesson1Assets): LessonContent {
  const now = Date.now();
  const pages = [
    { id: "w2d1l1-p01", title: "왜 고객 분석이 먼저인가", layout: "wide" as const, blocks: page01() },
    {
      id: "w2d1l1-p02",
      title: "AI 활용은 기본, 차별점은 고객 이해",
      layout: "wide" as const,
      blocks: page02(assets),
    },
    {
      id: "w2d1l1-p03",
      title: "상상 속 고객 vs 증거 기반 고객",
      layout: "wide" as const,
      blocks: page03(assets),
    },
    { id: "w2d1l1-p04", title: "AI와 사람의 역할", layout: "fullscreen" as const, blocks: page04() },
    {
      id: "w2d1l1-p05",
      title: "근거 있음 / 추론 / 검증 필요",
      layout: "standard" as const,
      blocks: page05(),
    },
    { id: "w2d1l1-p06", title: "STP 전체 지도", layout: "wide" as const, blocks: page06(assets) },
    { id: "w2d1l1-p07", title: "실습 전 자료 준비", layout: "practice" as const, blocks: page07() },
    { id: "w2d1l1-p08", title: "ChatGPT 실습", layout: "practice" as const, blocks: page08() },
    { id: "w2d1l1-p09", title: "분석 결과 기록", layout: "practice" as const, blocks: page09() },
    { id: "w2d1l1-p10", title: "결과 저장 / Lesson 완료", layout: "wide" as const, blocks: page10() },
  ];

  return {
    id: DAY1_LESSON1_ID,
    courseId: "default-course",
    week: 2,
    day: 1,
    lesson: 1,
    title: "왜 고객 분석이 먼저인가",
    description:
      "AI는 고객을 만들어내는 도구가 아니라, 고객을 이해하도록 돕는 분석 도구다. 이 Lesson에서는 ICP·ECP·페르소나를 완성하지 않고, 이후 분석의 기준을 만든다.",
    durationMinutes: 60,
    status: "published",
    version: 1,
    createdAt: now,
    updatedAt: now,
    pages,
  };
}
