import type { ExportBundle } from "./types";
import { downloadBlob } from "./download";

export function buildMarkdown(bundle: ExportBundle): string {
  const { week, day, dayTitle, evidence, segments, analysis, valueProposition } = bundle;
  const vp = valueProposition ?? analysis?.valueProposition;
  const lines: string[] = [];

  lines.push(`# ${week}주차 Day${day} — ${dayTitle}`);
  lines.push("");
  lines.push(`_생성일: ${new Date().toLocaleString("ko-KR")}_`);
  lines.push("");

  if (analysis) {
    lines.push("## 사업 개요");
    lines.push(`- **사업 아이디어**: ${analysis.input.businessIdea}`);
    lines.push(`- **현재 단계**: ${analysis.input.stage}`);
    if (analysis.input.isHypothetical) {
      lines.push(`- 교육용 가설 데이터로 표시됨 (실제 고객 데이터 아님)`);
    }
    lines.push("");
  }

  if (evidence && evidence.length > 0) {
    lines.push("## 고객 증거");
    for (const row of evidence) {
      lines.push(`- [${row.tag}] ${row.sourceLine}`);
    }
    lines.push("");
  }

  if (segments && segments.length > 0) {
    lines.push("## 세그먼트 후보");
    for (const seg of segments) {
      lines.push(`### ${seg.name} (${seg.tag})`);
      lines.push(`- 반복 문제: ${seg.repeatedProblem}`);
      lines.push(`- 촉발 사건: ${seg.triggerEvent}`);
      lines.push(`- 현재 대안: ${seg.currentAlternative}`);
      lines.push(`- 반대 이유: ${seg.objection}`);
      lines.push(`- 반증: ${seg.counterEvidence}`);
      lines.push("");
    }
  }

  if (analysis) {
    lines.push("## ICP");
    lines.push(`- 고객 유형: ${analysis.icp.customerType}`);
    lines.push(`- 핵심 상황: ${analysis.icp.keySituation}`);
    lines.push(`- 문제 강도: ${analysis.icp.problemIntensity}`);
    lines.push(`- 현재 대안: ${analysis.icp.currentAlternative}`);
    lines.push(`- 시도 의향: ${analysis.icp.willingnessToTry}`);
    lines.push(`- 의사결정자: ${analysis.icp.decisionMaker}`);
    lines.push(`- 적합 조건: ${analysis.icp.fitConditions}`);
    lines.push(`- 부적합 조건: ${analysis.icp.unfitConditions}`);
    lines.push("");

    lines.push("## ECP");
    lines.push(analysis.ecp.description);
    lines.push(`\n> ${analysis.ecp.reason}`);
    lines.push("");

    lines.push("## 안티 ICP");
    for (const c of analysis.antiIcp.conditions) lines.push(`- ${c}`);
    lines.push("");

    lines.push("## 페르소나");
    for (const p of analysis.personas) {
      lines.push(`### ${p.role}`);
      lines.push(`- 상황: ${p.situation}`);
      lines.push(`- 근거: ${p.evidence}`);
      lines.push(`- 반증: ${p.counterEvidence}`);
      lines.push(`- 미확인: ${p.unknown}`);
      lines.push("");
    }

    lines.push("## 고객 여정");
    for (const stage of analysis.journey) {
      lines.push(`### ${stage.stage}`);
      lines.push(`- 행동: ${stage.action}`);
      lines.push(`- 질문: "${stage.question}"`);
      lines.push(`- 접점: ${stage.touchpoint}`);
      lines.push(`- 이탈 위험: ${stage.churnRisk}`);
      lines.push(`- 필요 콘텐츠: ${stage.neededContent}`);
      lines.push("");
    }

    lines.push("## 다음 인터뷰에서 검증할 질문");
    analysis.verificationQuestions.forEach((q, i) => lines.push(`${i + 1}. ${q}`));
    lines.push("");
  }

  if (vp) {
    lines.push("## 가치제안");
    lines.push("**고객**");
    lines.push(`- 해야 할 일: ${vp.customerJobs.join(", ")}`);
    lines.push(`- 고충: ${vp.customerPains.join(", ")}`);
    lines.push(`- 기대 이득: ${vp.customerGains.join(", ")}`);
    lines.push("");
    lines.push("**우리 제품**");
    lines.push(`- 제공 서비스: ${vp.productServices.join(", ")}`);
    lines.push(`- 고충 해결 방식: ${vp.painRelievers.join(", ")}`);
    lines.push(`- 이득 창출 방식: ${vp.gainCreators.join(", ")}`);
    lines.push("");
    lines.push(`> ${vp.oneLiner}`);
    lines.push("");
  }

  return lines.join("\n");
}

export function downloadMarkdown(bundle: ExportBundle) {
  const md = buildMarkdown(bundle);
  downloadBlob(md, `week${bundle.week}-day${bundle.day}-결과.md`, "text/markdown;charset=utf-8");
}
