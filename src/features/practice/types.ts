// 실습 결과 데이터 타입
// STP -> ICP/ECP -> Persona -> Customer Journey -> Value Proposition 흐름을 그대로 반영

export type EvidenceTag = "근거있음" | "추론" | "검증필요";

export interface EvidenceRow {
  id: string;
  sourceLine: string; // 원문에서 인용한 문장 (또는 mock 생성 문구)
  problem?: string;
  triggerEvent?: string;
  currentAlternative?: string;
  expectedOutcome?: string;
  objection?: string;
  tag: EvidenceTag;
}

export interface SegmentCandidate {
  id: string;
  name: string;
  repeatedProblem: string;
  triggerEvent: string;
  currentAlternative: string;
  objection: string;
  channel: string;
  evidenceRefs: string[];
  counterEvidence: string;
  tag: EvidenceTag;
}

export interface ICPProfile {
  customerType: string;
  keySituation: string;
  problemIntensity: string;
  currentAlternative: string;
  willingnessToTry: string;
  decisionMaker: string;
  accessibility: string;
  fitConditions: string;
  unfitConditions: string;
}

export interface ECPProfile {
  description: string;
  reason: string;
}

export interface AntiICP {
  conditions: string[];
  reason: string;
}

export interface PersonaCard {
  role: "구매자" | "사용자" | "영향자";
  situation: string;
  evidence: string;
  counterEvidence: string;
  unknown: string;
}

export interface JourneyStage {
  stage: "인지" | "탐색" | "비교" | "신청" | "사용" | "재구매";
  action: string;
  question: string;
  emotion: "positive" | "neutral" | "negative";
  touchpoint: string;
  churnRisk: string;
  neededContent: string;
}

export interface ValueProposition {
  customerJobs: string[];
  customerPains: string[];
  customerGains: string[];
  productServices: string[];
  painRelievers: string[];
  gainCreators: string[];
  oneLiner: string;
}

export interface CustomerAnalysisInput {
  businessIdea: string;
  stage: "아이디어" | "인터뷰" | "MVP" | "초기매출";
  rawCustomerText?: string; // 후기/인터뷰 원문 (선택)
  isHypothetical: boolean; // 실제 고객 데이터가 아니면 true (교육용 가설)
}

export interface Day1AnalysisResult {
  id: string;
  input: CustomerAnalysisInput;
  segments: SegmentCandidate[];
  icp: ICPProfile;
  ecp: ECPProfile;
  antiIcp: AntiICP;
  personas: PersonaCard[];
  journey: JourneyStage[];
  valueProposition: ValueProposition;
  verificationQuestions: string[];
  generatedAt: number;
}

export interface EvidenceQuizItem {
  id: string;
  sentence: string;
  correctTag: EvidenceTag;
  explanation: string;
}
