import type { DayMeta, LessonMeta, Step } from "../../types";

const S = (label: string) => ({ label });

const step1: Step = {
  id: "w2-d1-s1",
  week: 2,
  day: 1,
  stepNumber: 1,
  title: "왜 고객분석부터 시작해야 하는가",
  summary: "AI를 고객분석에 쓸 때 지켜야 할 세 가지 원칙을 배웁니다.",
  keyMessage: "AI는 고객을 만드는 도구가 아니라 분석하는 도구다.",
  instructorScript:
    "마케터의 61퍼센트가 AI로 인해 지난 20년 중 가장 큰 변화를 겪고 있다고 답했습니다. 그런데 같은 조사는 AI 생성량보다 브랜드의 관점, 신뢰, 품질관리가 진짜 차별화 요소라고 말합니다. 오늘 우리는 화려한 콘텐츠를 빠르게 만드는 법이 아니라, AI를 고객분석에 안전하게 쓰는 세 가지 원칙부터 배웁니다. 첫째 AI는 분석 도구다, 둘째 사람이 마지막에 승인한다, 셋째 근거·추론·검증필요를 구분한다. 이 세 가지만 지키면 오늘 이후 실습에서 만드는 모든 결과물을 안전하게 다룰 수 있습니다.",
  blocks: [
    {
      kind: "theory",
      heading: "2026년, AI는 마케팅의 기본 역량이 되었다",
      bullets: [
        "마케터의 61%가 'AI로 인해 최근 20년 중 가장 큰 마케팅 변화가 일어나고 있다'고 응답했습니다.",
        "동시에 AI 생성량보다 브랜드의 관점·신뢰·품질관리가 차별화 요소로 강조됩니다.",
        "AI는 고객을 만드는 도구가 아니라, 이미 있는 자료를 분석하는 도구입니다.",
        "Anthropic의 2026년 소기업 사례: 마케팅·영업·고객지원 등 15개 업무를 AI로 연결하되, 게시·발송·지급 전에는 반드시 사람이 승인합니다(Human-in-the-loop).",
        "AI의 모든 결과물은 근거있음 / 추론 / 검증필요 3단계로 나눠서 봐야 합니다.",
      ],
      sources: [S("HubSpot, 2026 State of Marketing"), S("Anthropic, Claude for Small Business, 2026")],
    },
    {
      kind: "visual",
      heading: "상상 속 고객 vs 증거 기반 고객",
      visualKind: "comparison",
      caption: "같은 AI가 만든 두 페르소나, 근거의 차이가 결과를 완전히 바꿉니다.",
      data: {
        left: {
          label: "AI가 상상한 페르소나",
          text: "30대 직장인, SNS를 자주 사용함",
          tone: "muted",
        },
        right: {
          label: "증거 기반 페르소나",
          text: "월말마다 수작업 보고서 작성에 4시간이 걸리고, 팀장 보고 전 오류를 걱정하는 5~20인 기업 운영담당자",
          tone: "vivid",
        },
      },
    },
    {
      kind: "case",
      heading: "문의 없이 자동화부터 만들면 벌어지는 일",
      body: [
        "문의가 한 번도 들어오지 않은 상태에서 복잡한 자동화를 구축하면, 잘못된 프로세스를 빠르게 반복하게 됩니다.",
        "2026년 기업 조사에서도 데이터와 기반 시스템이 준비되지 않은 상태가 에이전틱 AI 도입의 주요 장애물로 지적됩니다.",
      ],
      sources: [S("생성형 AI 기반 고객 확보·자동화 마케팅 딥리서치, 2026")],
    },
    {
      kind: "takeaway",
      message: "근거 없는 페르소나는 그럴듯해 보일 뿐, 아무것도 알려주지 않는다.",
    },
  ],
  quiz: [
    {
      id: "w2-d1-s1-q1",
      question: "AI를 고객분석에 쓸 때 지켜야 할 원칙으로 옳지 않은 것은?",
      options: [
        "AI는 분석 도구로 사용한다",
        "결과물은 근거있음 / 추론 / 검증필요로 구분한다",
        "게시·발송 전 사람이 반드시 승인한다",
        "AI가 만든 결과는 검토 없이 바로 게시해도 된다",
      ],
      correctIndex: 3,
      explanation: "AI 결과는 게시·발송·지급 전 반드시 사람이 승인해야 합니다(Human-in-the-loop).",
    },
    {
      id: "w2-d1-s1-q2",
      question: "다음 중 '증거 기반 페르소나'에 해당하는 설명은?",
      options: [
        "30대 직장인, SNS를 자주 사용함",
        "월말마다 수작업 보고서 작성에 4시간이 걸리는 5~20인 기업 운영담당자",
        "감성적이고 트렌디한 소비자",
        "정확한 나이와 소득 수준이 명시된 고객",
      ],
      correctIndex: 1,
      explanation: "막연한 인상이 아니라 구체적인 상황·행동에 근거한 설명이 증거 기반 페르소나입니다.",
    },
  ],
  practice: {
    kind: "evidenceQuiz",
    title: "이 문장은 근거있음일까, 추론일까, 검증필요일까?",
    instruction:
      "아래 문장들을 읽고 근거있음 / 추론 / 검증필요 중 하나로 분류해보세요. 완벽한 정답보다, 왜 그렇게 분류했는지 판단 기준을 몸에 익히는 게 목표입니다.",
    estimatedMinutes: 5,
  },
};

const step2: Step = {
  id: "w2-d1-s2",
  week: 2,
  day: 1,
  stepNumber: 2,
  title: "고객 증거부터 모은다",
  summary: "모든 분석의 출발점이 되는 고객 증거를 수집하고 정리하는 법을 배웁니다.",
  keyMessage: "출발점은 언제나 고객 증거다.",
  instructorScript:
    "오늘 배울 모든 개념의 출발점은 딱 하나, 고객 증거입니다. 인터뷰, 리뷰, 문의 기록, 경쟁사 페이지, 검색 결과처럼 이미 존재하는 자료를 말합니다. 아직 고객이 없다면 경쟁 상품의 리뷰나 지인과의 모의 인터뷰도 쓸 수 있습니다. 다만 '이건 교육용 가설'이라고 반드시 표시해야 합니다. 강사 시연에서는 고객 후기 15개를 AI에 넣고 반복 문제, 구매 촉발 사건, 현재 대안, 반대 이유를 표로 뽑아냅니다. 이때 각 항목 옆에 어느 후기에서 나온 내용인지 원문 번호를 반드시 표시하게 합니다.",
  blocks: [
    {
      kind: "theory",
      heading: "고객 증거란 무엇인가",
      bullets: [
        "고객 증거 = 실제 고객 인터뷰, 리뷰, 문의, 경쟁사 페이지, 검색 결과 등 이미 존재하는 자료입니다.",
        "아직 고객이 없다면 경쟁 상품 리뷰, 공개 커뮤니티 질문, 지인 모의 인터뷰도 사용할 수 있습니다(단, 실제 고객 데이터가 아님을 표시).",
        "증거는 문제 · 촉발 사건 · 현재 대안 · 기대 결과 · 반대 이유 다섯 갈래로 나눠 기록합니다.",
      ],
    },
    {
      kind: "visual",
      heading: "고객 증거 수집 워크시트",
      visualKind: "table",
      data: {
        columns: ["자료번호", "출처유형", "문제", "촉발사건", "해석상태"],
        rows: [
          ["인터뷰-01", "인터뷰", "월말 보고서 작성에 4시간 소요", "팀장 질책 이후", "근거있음"],
          ["리뷰-03", "경쟁사 리뷰", "수작업 오류로 재작업 반복", "확인 필요", "검증필요"],
        ],
      },
    },
    {
      kind: "case",
      heading: "후기 15개에서 반복 문제를 뽑아내는 법",
      body: [
        "강사 시연에서는 고객 후기 15개와 기존 소개문을 AI에 넣고, 반복 문제·구매 촉발 사건·현재 대안·반대 이유를 표로 추출합니다.",
        "결과가 나오면 각 항목 옆에 어느 후기에서 나온 내용인지 원문 번호를 표시해, 나중에 근거를 바로 확인할 수 있게 합니다.",
      ],
      sources: [S("생성형 AI 기반 고객 확보·자동화 마케팅 딥리서치, 2026")],
    },
    {
      kind: "takeaway",
      message: "증거 없이 시작하지 말고, 증거부터 모아라.",
    },
  ],
  quiz: [
    {
      id: "w2-d1-s2-q1",
      question: "고객 증거로 적절하지 않은 것은?",
      options: ["실제 고객 인터뷰", "경쟁 상품 리뷰", "AI가 상상으로 만든 페르소나", "문의 기록"],
      correctIndex: 2,
      explanation: "증거는 이미 존재하는 실제 자료여야 합니다. AI가 상상으로 만든 내용은 증거가 아닙니다.",
    },
    {
      id: "w2-d1-s2-q2",
      question: "증거를 기록할 때 반드시 함께 남겨야 하는 것은?",
      options: ["고객의 나이와 성별", "어느 원문(후기·인터뷰 번호)에서 나온 내용인지", "예상 매출액", "경쟁사 이름"],
      correctIndex: 1,
      explanation: "원문 출처 번호를 남겨야 나중에 근거를 바로 확인할 수 있습니다.",
    },
  ],
  practice: {
    kind: "evidenceExtract",
    title: "내 사업의 고객 증거 뽑아보기",
    instruction:
      "사업 아이디어를 입력하고, 있다면 고객 후기·인터뷰·문의 원문을 붙여넣으세요. 없다면 경쟁 상품 리뷰나 모의 인터뷰도 괜찮습니다(교육용 가설로 표시됩니다).",
    estimatedMinutes: 8,
  },
};

const lesson1: LessonMeta = {
  lessonNumber: 1,
  title: "고객 증거로 시작하기",
  goal: "AI를 고객분석에 안전하게 쓰는 원칙을 이해하고, 모든 분석의 출발점인 고객 증거를 수집한다.",
  steps: [step1, step2],
};

const step3: Step = {
  id: "w2-d1-s3",
  week: 2,
  day: 1,
  stepNumber: 3,
  title: "STP로 세그먼트 나누기",
  summary: "세분화·타겟팅·포지셔닝(STP)의 구조를 이해하고 세그먼트 후보를 만듭니다.",
  keyMessage: "세분화 → 타겟팅 → 포지셔닝. 오늘의 모든 개념은 이 세 칸 중 하나에 들어간다.",
  instructorScript:
    "마케팅에서는 고객에게 다가가는 순서를 STP라고 부릅니다. 세분화, 타겟팅, 포지셔닝의 앞글자입니다. 세분화는 비슷한 문제나 상황을 가진 고객군을 나누는 작업입니다. 2025년에서 2026년 사이 흐름을 보면, 나이나 성별 같은 인구통계 중심 페르소나에서 행동·상황·문제 중심 세분화로 이동하고 있습니다. 오늘은 STEP2에서 모은 증거를 가지고 실제로 세그먼트 후보를 나눠보겠습니다.",
  blocks: [
    {
      kind: "theory",
      heading: "STP — 마케팅이 고객에게 다가가는 세 단계",
      bullets: [
        "S(세분화): 비슷한 문제·상황·행동을 보이는 고객군을 나눈다.",
        "T(타겟팅): 지금 집중할 대상을 정한다 — 다음 STEP에서 ICP와 ECP로 구체화한다.",
        "P(포지셔닝): 그 대상에게 우리를 어떻게 보여줄지 정한다 — STEP5의 가치제안으로 연결한다.",
        "2025~2026년 흐름: 인구통계 중심 페르소나 → 행동·상황·문제 중심 세분화.",
      ],
    },
    {
      kind: "visual",
      heading: "S → T → P",
      visualKind: "staircase",
      data: {
        steps: [
          { label: "세분화", detail: "세그먼트 후보" },
          { label: "타겟팅", detail: "ICP · ECP · 안티ICP" },
          { label: "포지셔닝", detail: "페르소나 · 여정 · 가치제안" },
        ],
      },
    },
    {
      kind: "case",
      heading: "근거 기반 세분화의 실제 결과 형태",
      body: [
        "근거 기반 세분화는 세그먼트 후보마다 반복 문제, 촉발 사건, 현재 대안, 반대 이유, 접근 채널, 근거, 반증을 함께 정리합니다.",
        "증거가 부족한 항목은 '검증 필요'로 표시하고, 다음 인터뷰에서 확인할 질문을 남깁니다.",
      ],
      sources: [S("생성형 AI 기반 고객 확보·자동화 마케팅 딥리서치, 2026")],
    },
    {
      kind: "takeaway",
      message: "세그먼트는 나이가 아니라 문제와 상황으로 나눈다.",
    },
  ],
  quiz: [
    {
      id: "w2-d1-s3-q1",
      question: "STP에서 '세분화(S)'가 하는 일은?",
      options: ["지금 집중할 대상을 정한다", "비슷한 문제·상황을 가진 고객군을 나눈다", "고객에게 어떻게 보여줄지 정한다", "가격을 결정한다"],
      correctIndex: 1,
      explanation: "세분화는 비슷한 문제·상황·행동을 보이는 고객군을 나누는 작업입니다.",
    },
    {
      id: "w2-d1-s3-q2",
      question: "2025~2026년 세분화 흐름의 변화 방향은?",
      options: [
        "인구통계 중심 → 행동·상황·문제 중심",
        "행동 중심 → 인구통계 중심",
        "세분화를 아예 하지 않는 방향",
        "가격 중심 세분화로 전환",
      ],
      correctIndex: 0,
      explanation: "나이·성별 같은 인구통계 중심에서 행동·상황·문제 중심 세분화로 이동하고 있습니다.",
    },
  ],
  practice: {
    kind: "segmentBuilder",
    title: "세그먼트 후보 만들기",
    instruction:
      "STEP2에서 모은 증거를 바탕으로 세그먼트 후보 3개를 만들어봅니다. 각 후보에는 반드시 근거와 반증이 함께 표시됩니다.",
    estimatedMinutes: 8,
  },
};

const step4: Step = {
  id: "w2-d1-s4",
  week: 2,
  day: 1,
  stepNumber: 4,
  title: "ICP·ECP·페르소나·고객여정 정의하기",
  summary: "타겟팅을 구체화하는 네 가지 도구 — ICP, ECP, 페르소나, 고객여정을 배우고 직접 만들어봅니다.",
  keyMessage: "완벽한 고객을 찾지 말고, 지금 시도해볼 고객부터 찾아라.",
  instructorScript:
    "ICP는 Ideal Customer Profile, 회사·조직 수준의 특성을 정의합니다. ZoomInfo 자료는 ICP를 회사 수준 특성, 페르소나를 사람 수준 특성으로 구분합니다. PostHog 창업자 자료는 ICP가 제품, 메시지, 영업 방식, 시장 진입 전략을 좌우하는 핵심 선택이라고 설명합니다. 그런데 아직 제품시장적합성을 찾지 못한 초기 단계라면 ICP보다 ECP, 즉 지금 이 불완전한 제품도 시도해볼 초기 고객을 정의하는 게 더 현실적입니다. 여기에 안티 ICP, 페르소나, 고객여정까지 더하면 타겟팅이 완성됩니다. 이번 실습이 오늘의 메인입니다. 사업명과 문제, 고객 정보를 입력하면 AI가 이 네 가지를 한 번에 정리해드립니다.",
  blocks: [
    {
      kind: "theory",
      heading: "ICP — 우리에게 가장 잘 맞는 고객",
      bullets: [
        "ICP(Ideal Customer Profile)는 회사·조직 수준의 특성을 정의합니다. ICP를 먼저 정하고, 그 안의 사람(페르소나)을 나중에 연결합니다(ZoomInfo).",
        "실제 창업자 관점: ICP는 제품, 메시지, 영업 방식, 시장 진입 전략을 좌우하는 핵심 선택입니다(PostHog).",
        "ECP(Early Customer Profile): '이상적인 장기 고객'이 아니라 '지금 시도할 가능성이 높은 초기 고객'. 제품시장적합성을 아직 찾지 못한 단계에서는 ICP보다 실용적입니다.",
        "안티 ICP: 우리와 맞지 않는 고객 조건도 함께 정의해야 나중에 시간을 낭비하지 않습니다.",
        "페르소나는 구매자·사용자·영향자로 나누며, 근거·반증·미확인 필드를 반드시 남깁니다. 증거 없는 민감한 속성(성별·나이·소득·건강 등)은 임의로 부여하지 않습니다.",
        "고객여정 지도는 행위자, 상황과 기대, 단계, 행동·생각·감정, 개선 기회로 구성됩니다(Nielsen Norman Group, Journey Mapping 101).",
      ],
      sources: [
        S("ZoomInfo, Ideal Customer Profile"),
        S("PostHog, Ideal Customer Profile Framework"),
        S("Nielsen Norman Group, Journey Mapping 101"),
      ],
    },
    {
      kind: "visual",
      heading: "ICP vs ECP vs 페르소나 vs 고객여정",
      visualKind: "table",
      data: {
        columns: ["프레임워크", "답하는 질문", "대표 산출물"],
        rows: [
          ["ECP", "지금 불완전한 제품도 시험할 고객은 누구인가", "초기 고객 조건"],
          ["ICP", "장기적으로 가장 높은 적합성을 갖는 고객·조직은 누구인가", "적합·부적합 기준"],
          ["페르소나", "그 조직·세그먼트 안에서 누가 결정하고 사용하는가", "구매자·사용자 카드"],
          ["고객여정", "목표를 달성하는 동안 무엇을 하고 생각하고 느끼는가", "단계별 행동·질문·접점"],
        ],
      },
    },
    {
      kind: "case",
      heading: "ICP가 좌우하는 것",
      body: [
        "PostHog 창업자 자료는 ICP를 어떻게 정하느냐가 제품의 방향, 메시지, 영업 방식, 시장 진입 전략 전체를 좌우하는 핵심 선택이라고 설명합니다.",
        "'누가 살 것인가'를 막연히 생각하는 대신, '어떤 상황에서 지금 바꿀 이유가 있는가'를 좁히는 작업이 ICP·ECP입니다.",
      ],
      sources: [S("PostHog, Ideal Customer Profile Framework")],
    },
    {
      kind: "takeaway",
      message: "네 가지 도구는 경쟁하는 개념이 아니라, 서로 다른 질문에 답하는 도구다.",
    },
  ],
  quiz: [
    {
      id: "w2-d1-s4-q1",
      question: "ECP(Early Customer Profile)에 대한 설명으로 옳은 것은?",
      options: [
        "장기적으로 가장 이상적인 고객",
        "지금 이 불완전한 제품도 시도해볼 초기 고객",
        "절대 고객이 될 수 없는 대상",
        "페르소나와 동일한 개념",
      ],
      correctIndex: 1,
      explanation: "ECP는 제품시장적합성을 아직 찾지 못한 단계에서 지금 시도해볼 가능성이 높은 초기 고객을 뜻합니다.",
    },
    {
      id: "w2-d1-s4-q2",
      question: "페르소나를 만들 때 지켜야 할 원칙은?",
      options: [
        "증거 없는 민감한 속성(나이·성별·소득 등)도 자유롭게 채운다",
        "근거·반증·미확인 필드를 반드시 남긴다",
        "반드시 1명만 정의한다",
        "고객여정과는 무관하게 독립적으로 만든다",
      ],
      correctIndex: 1,
      explanation: "페르소나는 가설이므로 근거·반증·미확인 필드를 남겨 검증 상태를 표시해야 합니다.",
    },
  ],
  practice: {
    kind: "fullAnalysis",
    title: "AI로 ICP · ECP · 페르소나 · 고객여정 한 번에 만들기",
    instruction:
      "사업명, 핵심 문제, 고객에 대해 알고 있는 정보를 입력하고 '분석하기'를 눌러보세요. AI가 근거를 표시하며 ICP, ECP, 안티ICP, 페르소나, 고객여정을 구조화합니다.",
    estimatedMinutes: 15,
  },
};

const lesson2: LessonMeta = {
  lessonNumber: 2,
  title: "세분화와 타겟팅",
  goal: "STP의 세분화·타겟팅을 이해하고, 세그먼트 후보와 ICP·ECP·페르소나·고객여정을 직접 만든다.",
  steps: [step3, step4],
};

const step5: Step = {
  id: "w2-d1-s5",
  week: 2,
  day: 1,
  stepNumber: 5,
  title: "가치제안으로 연결하고 오늘 정리하기",
  summary: "STEP4 결과를 가치제안 캔버스로 압축하고, 오늘 배운 전체 흐름을 정리합니다.",
  keyMessage: "오늘 만든 가치제안 한 문장이, 다음 시간 모든 콘텐츠의 원천이 된다.",
  instructorScript:
    "드디어 STP의 마지막, 포지셔닝입니다. 가치제안 캔버스는 고객이 해야 할 일, 고충, 기대하는 이득을 한쪽에 놓고, 우리 제품이 그것을 어떻게 해결하는지를 다른 한쪽에 놓아서 서로 얼마나 잘 맞는지 점검하는 도구입니다(Strategyzer). 오늘 우리가 만든 고객 증거, 세그먼트, ICP·ECP, 페르소나, 고객여정—이 모든 게 결국 이 한 장의 캔버스를 채우기 위한 재료였습니다. 이 캔버스가 채워지면 한 문장의 가치제안 메시지가 완성됩니다. 다음 2교시부터는 바로 이 문장을 원천으로 삼아 블로그, 뉴스레터, SNS 콘텐츠로 재가공하는 법을 배웁니다.",
  blocks: [
    {
      kind: "theory",
      heading: "가치제안 — 고객의 일·고충·기대이득과 우리의 해결책 잇기",
      bullets: [
        "가치제안 캔버스(Strategyzer): 고객의 해야 할 일(Jobs)·고충(Pains)·기대 이득(Gains)과 제품의 해결 방식 사이의 적합성을 점검합니다.",
        "오늘 만든 증거·세그먼트·ICP/ECP·페르소나·고객여정은 모두 이 한 장의 캔버스를 채우는 재료입니다.",
        "이 캔버스가 채워지면 '이런 고객이, 이런 문제 때문에, 우리 제품으로, 이런 결과를 얻는다'는 한 문장이 완성됩니다.",
      ],
      sources: [S("Strategyzer, Value Proposition Canvas")],
    },
    {
      kind: "visual",
      heading: "가치제안 캔버스",
      visualKind: "canvas",
      data: {
        customer: {
          title: "고객",
          fields: ["해야 할 일", "기능적 문제", "감정적 문제", "기대 이득", "현재 대안"],
        },
        product: {
          title: "우리 제품",
          fields: ["제공 서비스", "문제를 줄이는 방식", "불안을 낮추는 방식", "이득을 만드는 방식", "차이점"],
        },
      },
    },
    {
      kind: "visual",
      heading: "오늘 배운 흐름 한 장으로 정리하기",
      visualKind: "flow",
      data: {
        nodes: [
          "고객 원문",
          "증거 태그",
          "세그먼트 후보",
          "ICP/ECP/안티ICP",
          "페르소나·고객여정",
          "가치제안",
        ],
      },
    },
    {
      kind: "takeaway",
      message: "가치제안은 고객의 고충과 우리의 해결책이 만나는 지점이다.",
    },
  ],
  quiz: [
    {
      id: "w2-d1-s5-q1",
      question: "가치제안 캔버스가 점검하는 것은?",
      options: [
        "고객의 일·고충·기대이득과 제품 해결방식의 적합성",
        "제품의 가격 경쟁력",
        "경쟁사의 시장점유율",
        "광고 예산 규모",
      ],
      correctIndex: 0,
      explanation: "가치제안 캔버스는 고객의 Jobs·Pains·Gains와 제품의 해결 방식이 서로 얼마나 잘 맞는지를 점검합니다.",
    },
    {
      id: "w2-d1-s5-q2",
      question: "오늘 배운 흐름에서 가치제안 바로 앞에 오는 것은?",
      options: ["블로그 콘텐츠", "페르소나·고객여정", "SNS 광고 소재", "결제 시스템"],
      correctIndex: 1,
      explanation: "고객 원문 → 증거 태그 → 세그먼트 후보 → ICP/ECP/안티ICP → 페르소나·고객여정 → 가치제안 순서입니다.",
    },
  ],
  practice: {
    kind: "valueProposition",
    title: "가치제안 한 문장 완성하기",
    instruction:
      "STEP4에서 만든 ICP·페르소나·고객여정을 바탕으로 가치제안 캔버스와 한 문장 메시지를 완성합니다.",
    estimatedMinutes: 10,
  },
};

const lesson3: LessonMeta = {
  lessonNumber: 3,
  title: "가치제안으로 포지셔닝 완성하기",
  goal: "STP의 포지셔닝을 가치제안 한 문장으로 완성하고, 오늘 배운 전체 흐름을 정리한다.",
  steps: [step5],
};

export const week2day1: DayMeta = {
  week: 2,
  day: 1,
  title: "DAY 1 — AI로 타깃 고객 정의하기",
  goal: "왜 고객분석부터 시작해야 하는지 이해하고, 내 사업의 ICP·ECP·페르소나·고객여정·가치제안을 완성한다.",
  lessons: [lesson1, lesson2, lesson3],
};
