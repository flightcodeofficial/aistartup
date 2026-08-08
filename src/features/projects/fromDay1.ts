import type { Day1AnalysisResult, ValueProposition } from "@/features/practice/types";
import type { ProjectArtifacts } from "./types";

/** Day1 실습 결과를 프로젝트 산출물(텍스트 요약)로 변환한다. */
export function buildArtifactsFromDay1(
  analysis: Day1AnalysisResult,
  valueProposition?: ValueProposition
): Partial<ProjectArtifacts> {
  const vp = valueProposition ?? analysis.valueProposition;

  const icp = [
    `고객 유형: ${analysis.icp.customerType}`,
    `핵심 상황: ${analysis.icp.keySituation}`,
    `문제 강도: ${analysis.icp.problemIntensity}`,
    `적합 조건: ${analysis.icp.fitConditions}`,
    `부적합 조건: ${analysis.icp.unfitConditions}`,
  ].join("\n");

  const ecp = `${analysis.ecp.description}\n\n${analysis.ecp.reason}`;

  const persona = analysis.personas
    .map((p) => `[${p.role}] ${p.situation}\n근거: ${p.evidence} / 반증: ${p.counterEvidence}`)
    .join("\n\n");

  const journey = analysis.journey
    .map((s) => `${s.stage}: ${s.action} (이탈위험: ${s.churnRisk})`)
    .join("\n");

  const valuePropositionText = vp
    ? `${vp.oneLiner}\n\n고충: ${vp.customerPains.join(", ")}\n기대 이득: ${vp.customerGains.join(", ")}`
    : "";

  return {
    icp,
    ecp,
    persona,
    journey,
    valueProposition: valuePropositionText,
  };
}
