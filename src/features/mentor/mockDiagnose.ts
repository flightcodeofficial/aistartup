// AI Mentor Mock 진단기.
// "질문에 답하는" 수준을 넘어 "사업 코치"로 확장한다 — 학생이 진단 버튼을 누르면
// 프로젝트의 실제 draftArtifacts 텍스트를 읽어서 현재상태/강점/약점/우선순위/추천액션/다음실습을
// 만들어낸다. 규칙 기반이라 정직하게 "길이·키워드 기반의 초안 점검"이라는 한계를 벗어나지
// 않는다 — 진짜 LLM으로 교체할 때는 이 파일의 diagnoseProject() 본문만 API 호출로 바꾸면 된다.

import { ARTIFACT_FIELD_ORDER, ARTIFACT_LABELS, DIAGNOSIS_SCOPE_LABELS } from "@/features/projects/types";
import type { DiagnosisReport, DiagnosisScope, Project, ProjectArtifacts } from "@/features/projects/types";

const SCOPE_FIELDS: Record<DiagnosisScope, (keyof ProjectArtifacts)[]> = {
  idea: ["icp", "ecp", "valueProposition"],
  icp: ["icp", "ecp", "persona"],
  landingPage: ["landingPage", "valueProposition"],
  marketing: ["marketing", "valueProposition"],
  ir: ["ir", "businessModel"],
  pitch: ["pitch", "valueProposition"],
  faq: ["faq"],
  full: ARTIFACT_FIELD_ORDER,
};

const SHORT_THRESHOLD = 40;
const SOLID_THRESHOLD = 150;

function qualityOf(text: string): "empty" | "short" | "solid" {
  const trimmed = text.trim();
  if (!trimmed) return "empty";
  if (trimmed.length < SHORT_THRESHOLD) return "short";
  return trimmed.length >= SOLID_THRESHOLD ? "solid" : "short";
}

const NEXT_PRACTICE_HINT: Record<keyof ProjectArtifacts, string> = {
  icp: "Day1 STEP4에서 ICP·ECP·페르소나·고객여정을 다시 다듬어보세요.",
  ecp: "Day1 STEP4에서 지금 시도해볼 수 있는 초기 고객(ECP) 조건을 더 좁혀보세요.",
  persona: "Day1 STEP4 페르소나 카드에 근거·반증 필드를 채워 가설을 검증해보세요.",
  journey: "Day1 STEP4 고객여정 지도에서 이탈 위험이 큰 단계를 다시 점검해보세요.",
  valueProposition: "Day1 STEP5 가치제안 캔버스로 고충·기대이득과 제품을 다시 연결해보세요.",
  landingPage: "랜딩페이지 섹션에 헤드라인·핵심 혜택 3가지·CTA 문구를 먼저 채워보세요.",
  marketing: "마케팅 섹션에 채널별(SNS/이메일/콘텐츠) 핵심 메시지를 정리해보세요.",
  ir: "IR 섹션에 문제-해결책-시장규모-비즈니스모델을 한 페이지로 요약해보세요.",
  pitch: "피치 섹션에 30초 안에 설명할 수 있는 핵심 한 문장을 먼저 써보세요.",
  faq: "FAQ 섹션에 고객이 가장 자주 물을 질문 5개와 답변을 정리해보세요.",
  businessModel: "비즈니스 모델 섹션에 수익원·비용구조·핵심 파트너를 정리해보세요.",
  automation: "자동화 섹션에 반복 업무 중 가장 먼저 자동화할 작업 1가지를 정해보세요.",
};

function currentStateFor(project: Project, fields: (keyof ProjectArtifacts)[]): string {
  const filled = fields.filter((f) => qualityOf(project.draftArtifacts[f]).length && project.draftArtifacts[f].trim());
  if (filled.length === 0) {
    return `${fields.map((f) => ARTIFACT_LABELS[f]).join("/")} 항목이 아직 비어 있습니다. 진단보다 먼저 초안을 채우는 것이 우선입니다.`;
  }
  if (filled.length === fields.length) {
    return `${fields.map((f) => ARTIFACT_LABELS[f]).join("/")} 항목이 모두 작성되어 있습니다. 내용의 구체성과 근거를 점검할 차례입니다.`;
  }
  return `${filled.map((f) => ARTIFACT_LABELS[f]).join("/")}는 작성됐지만, ${fields
    .filter((f) => !filled.includes(f))
    .map((f) => ARTIFACT_LABELS[f])
    .join("/")}가 비어 있어 전체 그림이 아직 이어지지 않습니다.`;
}

export function diagnoseProject(
  project: Project,
  scope: DiagnosisScope
): Omit<DiagnosisReport, "id" | "projectId" | "createdAt"> {
  const fields = SCOPE_FIELDS[scope];
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const priorities: string[] = [];
  const recommendedActions: string[] = [];

  for (const field of fields) {
    const quality = qualityOf(project.draftArtifacts[field]);
    const label = ARTIFACT_LABELS[field];
    if (quality === "solid") {
      strengths.push(`${label}: 근거로 삼을 만큼 구체적으로 작성됨 (${project.draftArtifacts[field].trim().length}자)`);
    } else if (quality === "short") {
      weaknesses.push(`${label}: 작성은 됐지만 근거·구체적 사례가 부족해 보임 (검증필요)`);
      priorities.push(label);
      recommendedActions.push(NEXT_PRACTICE_HINT[field]);
    } else {
      weaknesses.push(`${label}: 아직 작성되지 않음`);
      priorities.push(label);
      recommendedActions.push(NEXT_PRACTICE_HINT[field]);
    }
  }

  if (scope === "full") {
    const emptyFields = ARTIFACT_FIELD_ORDER.filter((f) => !project.draftArtifacts[f]?.trim());
    if (emptyFields.length > 0 && emptyFields.length < ARTIFACT_FIELD_ORDER.length) {
      priorities.length = 0;
      priorities.push(...emptyFields.slice(0, 3).map((f) => ARTIFACT_LABELS[f]));
    }
  }

  const nextPracticeField = priorities.length > 0
    ? (fields.find((f) => ARTIFACT_LABELS[f] === priorities[0]) ?? fields[0])
    : fields[0];

  return {
    scope,
    currentState: currentStateFor(project, fields),
    strengths: strengths.length > 0 ? strengths : ["아직 강점으로 꼽을 만큼 채워진 섹션이 없습니다."],
    weaknesses: weaknesses.length > 0 ? weaknesses : ["뚜렷한 약점은 보이지 않습니다."],
    priorities: priorities.length > 0 ? priorities.slice(0, 3) : ["현재 우선순위 없음 — 다음 실습으로 진행하세요."],
    recommendedActions:
      recommendedActions.length > 0
        ? Array.from(new Set(recommendedActions)).slice(0, 3)
        : [`${DIAGNOSIS_SCOPE_LABELS[scope]} 관련 섹션은 이미 잘 채워져 있습니다. 강사 피드백을 요청해보세요.`],
    nextPractice: NEXT_PRACTICE_HINT[nextPracticeField],
  };
}
