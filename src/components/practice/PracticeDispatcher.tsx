import type { Step } from "@/features/curriculum/types";
import { findNearestStepByKind } from "@/features/curriculum/data";
import { routes } from "@/lib/routes";
import { EvidenceQuizPractice } from "@/components/practice/EvidenceQuizPractice";
import { EvidenceExtractPractice } from "@/components/practice/EvidenceExtractPractice";
import { SegmentBuilderPractice } from "@/components/practice/SegmentBuilderPractice";
import { FullAnalysisPractice } from "@/components/practice/FullAnalysisPractice";
import { ValuePropositionPractice } from "@/components/practice/ValuePropositionPractice";

export function PracticeDispatcher({ step }: { step: Step }) {
  switch (step.practice.kind) {
    case "evidenceQuiz":
      return <EvidenceQuizPractice />;

    case "evidenceExtract":
      return <EvidenceExtractPractice stepId={step.id} />;

    case "segmentBuilder": {
      const source = findNearestStepByKind(step.week, step.day, step.stepNumber, "evidenceExtract");
      return (
        <SegmentBuilderPractice
          stepId={step.id}
          sourceStepId={source?.id}
          sourceHref={
            source ? routes.step(step.week, step.day, source.stepNumber) : routes.day(step.week, step.day)
          }
        />
      );
    }

    case "fullAnalysis":
      return <FullAnalysisPractice stepId={step.id} />;

    case "valueProposition": {
      const source = findNearestStepByKind(step.week, step.day, step.stepNumber, "fullAnalysis");
      return (
        <ValuePropositionPractice
          stepId={step.id}
          sourceStepId={source?.id}
          sourceHref={
            source ? routes.step(step.week, step.day, source.stepNumber) : routes.day(step.week, step.day)
          }
        />
      );
    }

    default:
      return null;
  }
}
