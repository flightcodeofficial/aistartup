// AI Provider 인터페이스
// 지금은 MockAIProvider만 구현되어 있고, 나중에 ChatGPT API로 교체할 때
// 이 인터페이스만 그대로 구현하면 STEP/실습 화면 코드는 수정할 필요가 없다.

import type {
  CustomerAnalysisInput,
  Day1AnalysisResult,
  EvidenceQuizItem,
  EvidenceRow,
  EvidenceTag,
  SegmentCandidate,
} from "../types";

export interface AIProvider {
  readonly name: string;

  /** STEP1 실습: 문장을 근거있음/추론/검증필요로 분류 (정답 채점용 기준 세트) */
  getEvidenceQuiz(): Promise<EvidenceQuizItem[]>;

  /** STEP2 실습: 사업 아이디어 + (선택)고객 원문 -> 고객 증거 행 추출 */
  extractEvidence(input: {
    businessIdea: string;
    rawCustomerText?: string;
  }): Promise<EvidenceRow[]>;

  /** STEP3 실습: 증거 행 -> 세그먼트 후보 생성 */
  buildSegments(input: {
    businessIdea: string;
    evidence: EvidenceRow[];
  }): Promise<SegmentCandidate[]>;

  /** STEP4 실습: 통합 분석 (ICP/ECP/안티ICP/페르소나/고객여정) */
  analyzeCustomer(input: CustomerAnalysisInput): Promise<Day1AnalysisResult>;

  /** STEP5 실습: STEP4 결과 -> 가치제안 캔버스 (이미 result에 포함되지만 재생성용으로 노출) */
  regenerateValueProposition(
    result: Day1AnalysisResult
  ): Promise<Day1AnalysisResult["valueProposition"]>;
}

export type { EvidenceTag };
