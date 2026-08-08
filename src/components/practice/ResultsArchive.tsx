"use client";

import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { findStepByKind } from "@/features/curriculum/data";
import { usePracticeStore } from "@/features/practice/store";
import { EvidenceBadge } from "@/components/common/EvidenceBadge";
import { GlassCard } from "@/components/common/GlassCard";
import { Button } from "@/components/ui/button";
import { ExportMenu } from "@/components/export/ExportMenu";
import { routes } from "@/lib/routes";

const CAPTURE_ID = "results-archive-content";

export function ResultsArchive({
  week,
  day,
  dayTitle,
}: {
  week: number;
  day: number;
  dayTitle: string;
}) {
  const evStep = findStepByKind(week, day, "evidenceExtract");
  const segStep = findStepByKind(week, day, "segmentBuilder");
  const analysisStep = findStepByKind(week, day, "fullAnalysis");
  const vpStep = findStepByKind(week, day, "valueProposition");

  const evidence = usePracticeStore((s) => (evStep ? s.evidence[evStep.id] : undefined));
  const segments = usePracticeStore((s) => (segStep ? s.segments[segStep.id] : undefined));
  const analysis = usePracticeStore((s) => (analysisStep ? s.analyses[analysisStep.id] : undefined));
  const vp = usePracticeStore((s) => (vpStep ? s.valueProps[vpStep.id] : undefined)) ?? analysis?.valueProposition;

  const hasAnything = Boolean(evidence?.length || segments?.length || analysis || vp);

  if (!hasAnything) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
        <FileQuestion className="size-10 text-muted-foreground" />
        <p className="mt-4 text-base font-semibold text-foreground">
          아직 저장된 실습 결과가 없습니다
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Day{day} STEP을 진행하면 여기에서 결과를 모아볼 수 있어요.
        </p>
        <Button asChild className="mt-5">
          <Link href={routes.day(week, day)}>Day{day} 시작하기</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <ExportMenu
          captureElementId={CAPTURE_ID}
          bundle={{ week, day, dayTitle, evidence, segments, analysis, valueProposition: vp }}
        />
      </div>
      <div id={CAPTURE_ID} className="space-y-6">
      {analysis && (
        <GlassCard className="bg-card">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            사업 개요
          </p>
          <p className="mt-1 text-lg font-bold text-foreground">{analysis.input.businessIdea}</p>
          <p className="text-sm text-muted-foreground">현재 단계: {analysis.input.stage}</p>
        </GlassCard>
      )}

      {segments && segments.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-bold text-foreground">세그먼트 후보</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {segments.map((seg) => (
              <div key={seg.id} className="rounded-xl border border-border bg-card p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-foreground">{seg.name}</p>
                  <EvidenceBadge tag={seg.tag} className="shrink-0" />
                </div>
                <p className="text-xs text-muted-foreground">{seg.repeatedProblem}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {analysis && (
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="mb-2 text-sm font-bold text-primary">ICP</p>
            <p className="text-sm text-foreground/90">{analysis.icp.fitConditions}</p>
          </div>
          <div className="rounded-xl border border-warning/30 bg-card p-4">
            <p className="mb-2 text-sm font-bold text-warning-foreground">ECP</p>
            <p className="text-sm text-foreground/90">{analysis.ecp.description}</p>
          </div>
          {analysis.personas.map((p) => (
            <div key={p.role} className="rounded-xl border border-border bg-card p-4">
              <p className="mb-2 text-sm font-bold text-foreground">페르소나 · {p.role}</p>
              <p className="text-sm text-foreground/90">{p.situation}</p>
            </div>
          ))}
        </section>
      )}

      {analysis && (
        <section>
          <h3 className="mb-3 text-sm font-bold text-foreground">고객 여정</h3>
          <div className="scrollbar-thin flex gap-3 overflow-x-auto">
            {analysis.journey.map((stage) => (
              <div key={stage.stage} className="w-40 shrink-0 rounded-xl border border-border bg-card p-3">
                <p className="text-xs font-bold text-primary">{stage.stage}</p>
                <p className="mt-1 text-xs text-foreground/90">{stage.action}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {vp && (
        <div className="bg-hero-gradient rounded-2xl p-6 text-center text-white sm:p-8">
          <p className="text-xs font-medium tracking-wide text-white/50 uppercase">가치제안</p>
          <p className="mx-auto mt-2 max-w-xl text-lg font-bold sm:text-xl">{vp.oneLiner}</p>
        </div>
      )}
      </div>
    </div>
  );
}
