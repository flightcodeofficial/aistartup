import type {
  Day1AnalysisResult,
  EvidenceRow,
  SegmentCandidate,
  ValueProposition,
} from "@/features/practice/types";

export interface ExportBundle {
  week: number;
  day: number;
  dayTitle: string;
  evidence?: EvidenceRow[];
  segments?: SegmentCandidate[];
  analysis?: Day1AnalysisResult;
  valueProposition?: ValueProposition;
}
