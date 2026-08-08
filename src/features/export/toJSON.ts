import type { ExportBundle } from "./types";
import { downloadBlob } from "./download";

export function downloadJSON(bundle: ExportBundle) {
  const payload = {
    exportedAt: new Date().toISOString(),
    week: bundle.week,
    day: bundle.day,
    dayTitle: bundle.dayTitle,
    evidence: bundle.evidence ?? [],
    segments: bundle.segments ?? [],
    analysis: bundle.analysis ?? null,
    valueProposition: bundle.valueProposition ?? bundle.analysis?.valueProposition ?? null,
  };
  downloadBlob(
    JSON.stringify(payload, null, 2),
    `week${bundle.week}-day${bundle.day}-결과.json`,
    "application/json;charset=utf-8"
  );
}
