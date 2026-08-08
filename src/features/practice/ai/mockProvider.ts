import type {
  CustomerAnalysisInput,
  Day1AnalysisResult,
  EvidenceQuizItem,
  EvidenceRow,
  SegmentCandidate,
} from "../types";
import type { AIProvider } from "./provider";
import { extractEvidenceFromText } from "./textHeuristics";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let genId = 0;
function nid(prefix: string) {
  genId += 1;
  return `${prefix}-${genId}`;
}

const QUIZ_ITEMS: EvidenceQuizItem[] = [
  {
    id: "q1",
    sentence:
      "고객 인터뷰에서 \"월말마다 보고서 때문에 야근한다\"고 직접 말했다.",
    correctTag: "근거있음",
    explanation: "고객이 실제로 한 말을 그대로 인용했으므로 근거있음입니다.",
  },
  {
    id: "q2",
    sentence:
      "고객이 \"매번 다른 담당자에게 물어봐야 한다\"고 했으니, 사내에 표준 매뉴얼이 없을 가능성이 높다.",
    correctTag: "추론",
    explanation: "원문에 직접 등장하진 않지만, 말한 내용에서 합리적으로 유추한 내용이라 추론입니다.",
  },
  {
    id: "q3",
    sentence: "이 서비스는 이미 대기명단 1,000명을 확보했다.",
    correctTag: "검증필요",
    explanation: "출처 없는 수치입니다. AI가 만들어낸 그럴듯한 숫자일 뿐 근거가 없어 검증필요입니다.",
  },
  {
    id: "q4",
    sentence: "30대 여성이고 SNS를 즐겨 사용할 것이다.",
    correctTag: "검증필요",
    explanation: "증거 없이 임의로 부여한 인구통계 속성입니다. 근거가 없으므로 검증필요입니다.",
  },
  {
    id: "q5",
    sentence: "리뷰 3건 모두 \"가격표를 못 찾겠다\"는 문의였다.",
    correctTag: "근거있음",
    explanation: "실제 리뷰 원문에서 반복적으로 확인된 사실이므로 근거있음입니다.",
  },
];

function buildSegmentsFromEvidence(
  businessIdea: string,
  evidence: EvidenceRow[]
): SegmentCandidate[] {
  const withProblem = evidence.filter((e) => e.problem || e.currentAlternative || e.objection);
  const source = withProblem.length > 0 ? withProblem : evidence;

  const chunkSize = Math.max(1, Math.ceil(source.length / 3));
  const chunks: EvidenceRow[][] = [];
  for (let i = 0; i < source.length; i += chunkSize) {
    chunks.push(source.slice(i, i + chunkSize));
  }
  while (chunks.length < 1) chunks.push([]);

  return chunks.slice(0, 3).map((chunk, i) => {
    const hasEvidence = chunk.some((c) => c.tag === "근거있음");
    const label = ["핵심 세그먼트", "보조 세그먼트", "확장 세그먼트"][i] ?? `세그먼트 ${i + 1}`;
    return {
      id: nid("seg"),
      name: `${label} — ${businessIdea || "우리 사업"}의 잠재 고객군 ${i + 1}`,
      repeatedProblem:
        chunk.find((c) => c.problem)?.problem ?? "증거 부족 — 반복 문제를 확인할 인터뷰가 더 필요합니다.",
      triggerEvent:
        chunk.find((c) => c.triggerEvent)?.triggerEvent ?? "확인 필요 — 어떤 계기로 해결책을 찾기 시작했는지 물어보세요.",
      currentAlternative:
        chunk.find((c) => c.currentAlternative)?.currentAlternative ?? "확인 필요",
      objection: chunk.find((c) => c.objection)?.objection ?? "확인 필요",
      channel: "확인 필요 — 실제 접근 가능한 채널을 인터뷰로 검증하세요.",
      evidenceRefs: chunk.map((c) => c.id),
      counterEvidence: "아직 반증 없음 — 다음 인터뷰에서 반대 사례를 찾아보세요.",
      tag: hasEvidence ? "근거있음" : "검증필요",
    };
  });
}

function buildAnalysis(input: CustomerAnalysisInput): Day1AnalysisResult {
  const evidence = extractEvidenceFromText(input.rawCustomerText);
  const segments = buildSegmentsFromEvidence(input.businessIdea, evidence);
  const primary = segments[0];
  const hasRealEvidence = evidence.some((e) => e.tag === "근거있음");

  return {
    id: nid("analysis"),
    input,
    segments,
    icp: {
      customerType: input.rawCustomerText
        ? "증거 기반 — 입력 자료에서 확인된 역할군을 참고하세요 (검증 필요)"
        : "검증 필요 — 회사 규모·역할·산업을 인터뷰로 좁혀보세요.",
      keySituation: primary?.triggerEvent ?? "검증 필요",
      problemIntensity: hasRealEvidence
        ? "입력 자료에서 반복적으로 언급됨 (근거있음)"
        : "검증 필요 — 빈도·심각도를 추가 인터뷰로 확인하세요.",
      currentAlternative: primary?.currentAlternative ?? "검증 필요",
      willingnessToTry: "검증 필요 — 실제 신청/결제 의향을 물어봐야 합니다.",
      decisionMaker: "검증 필요 — 구매를 승인하는 사람이 누구인지 확인하세요.",
      accessibility: "검증 필요 — 실제로 인터뷰·영업 접촉이 가능한 채널인지 확인하세요.",
      fitConditions: primary
        ? `${primary.repeatedProblem} 문제를 겪고 있는 경우`
        : "검증 필요",
      unfitConditions: "이미 대안에 만족하거나, 문제 빈도가 매우 낮은 경우",
    },
    ecp: {
      description: primary
        ? `지금 이 사업의 검증 단계(${input.stage})에서 시도해볼 첫 고객은, ${primary.repeatedProblem}`
        : "검증 필요 — 초기 고객 조건을 정의할 증거가 부족합니다.",
      reason: "제품시장적합성을 아직 찾지 못한 단계에서는 완벽한 ICP보다 지금 시도할 의향이 있는 고객이 더 중요합니다.",
    },
    antiIcp: {
      conditions: [
        "이미 기존 대안에 충분히 만족하는 경우",
        "문제 발생 빈도가 매우 낮아 개선 의지가 없는 경우",
        "의사결정 권한이 없어 구매로 이어지기 어려운 경우",
      ],
      reason: "이 조건에 해당하면 초기 자원을 쓰지 않는 것이 안전합니다.",
    },
    personas: [
      {
        role: "구매자",
        situation: primary?.repeatedProblem ?? "검증 필요",
        evidence: hasRealEvidence ? "입력 자료 원문에서 확인됨" : "아직 없음",
        counterEvidence: "아직 없음 — 반대 사례 인터뷰 필요",
        unknown: "예산 규모, 최종 결재권자",
      },
      {
        role: "사용자",
        situation: primary?.triggerEvent ?? "검증 필요",
        evidence: hasRealEvidence ? "입력 자료 원문에서 확인됨" : "아직 없음",
        counterEvidence: "아직 없음",
        unknown: "일일 사용 빈도, 대체 도구 사용 여부",
      },
    ],
    journey: [
      {
        stage: "인지",
        action: "문제를 처음 자각함",
        question: "이 문제가 나만 겪는 걸까?",
        emotion: "neutral",
        touchpoint: "검색, 커뮤니티",
        churnRisk: "문제를 심각하게 여기지 않고 넘어감",
        neededContent: "문제 공감형 콘텐츠",
      },
      {
        stage: "탐색",
        action: "해결책을 찾아봄",
        question: "어떤 대안들이 있을까?",
        emotion: "neutral",
        touchpoint: "검색, SNS",
        churnRisk: "정보 부족으로 탐색을 포기",
        neededContent: "비교 체크리스트",
      },
      {
        stage: "비교",
        action: primary?.currentAlternative ?? "기존 대안과 비교",
        question: "지금 방식과 뭐가 다른가?",
        emotion: "neutral",
        touchpoint: "랜딩페이지, 후기",
        churnRisk: "차별점이 명확하지 않음",
        neededContent: "사례·데모·FAQ",
      },
      {
        stage: "신청",
        action: primary?.objection ?? "신청을 망설임",
        question: "지금 시작해도 안전할까?",
        emotion: "negative",
        touchpoint: "랜딩페이지, 문의 폼",
        churnRisk: "반대 이유가 해소되지 않음",
        neededContent: "위험 제거 문구, 신뢰 근거",
      },
      {
        stage: "사용",
        action: "실제로 사용해봄",
        question: "생각한 대로 문제가 해결되는가?",
        emotion: "positive",
        touchpoint: "온보딩, 이메일",
        churnRisk: "초기 사용법을 몰라 이탈",
        neededContent: "온보딩 가이드",
      },
      {
        stage: "재구매",
        action: "지속 사용 또는 추천",
        question: "계속 쓸 만한 가치가 있는가?",
        emotion: "positive",
        touchpoint: "이메일, 커뮤니티",
        churnRisk: "가치를 재확인하지 못함",
        neededContent: "활용 팁, 성과 요약",
      },
    ],
    valueProposition: buildValueProposition(input, primary),
    verificationQuestions: [
      "이 문제는 얼마나 자주, 얼마나 심각하게 발생하나요?",
      "지금은 이 문제를 어떻게 해결하고 있나요?",
      "새로운 방법을 시도해볼 의향이 있나요? 무엇이 있으면 시도하겠습니까?",
      "구매나 신청을 결정하는 사람은 누구인가요?",
      "이 문제를 해결하지 못하면 어떤 일이 생기나요?",
    ],
    generatedAt: 0,
  };
}

function buildValueProposition(
  input: CustomerAnalysisInput,
  primary?: SegmentCandidate
): Day1AnalysisResult["valueProposition"] {
  const problem = primary?.repeatedProblem ?? "반복되는 핵심 문제(검증 필요)";
  const outcome = "문제 해결과 시간 절약";
  return {
    customerJobs: ["반복 업무를 빠르고 정확하게 처리하기", "담당자 보고 전 오류를 줄이기"],
    customerPains: [problem, primary?.objection ?? "새로운 도구 도입에 대한 부담"],
    customerGains: ["시간 절약", "오류 감소", "심리적 부담 감소"],
    productServices: [input.businessIdea || "우리 서비스"],
    painRelievers: ["반복 작업 자동화", "검증된 절차 제공"],
    gainCreators: ["빠른 처리 속도", "안심할 수 있는 검토 단계"],
    oneLiner: `${problem} 때문에 어려움을 겪는 고객이, ${input.businessIdea || "우리 서비스"}(으)로 ${outcome}을 얻습니다.`,
  };
}

export const mockAIProvider: AIProvider = {
  name: "Mock AI Provider (데모용)",

  async getEvidenceQuiz() {
    await delay(300);
    return QUIZ_ITEMS;
  },

  async extractEvidence({ rawCustomerText }) {
    await delay(600);
    return extractEvidenceFromText(rawCustomerText);
  },

  async buildSegments({ businessIdea, evidence }) {
    await delay(700);
    return buildSegmentsFromEvidence(businessIdea, evidence);
  },

  async analyzeCustomer(input) {
    await delay(1000);
    return { ...buildAnalysis(input), generatedAt: Date.now() };
  },

  async regenerateValueProposition(result) {
    await delay(500);
    return buildValueProposition(result.input, result.segments[0]);
  },
};
