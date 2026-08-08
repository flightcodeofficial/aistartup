"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { EvidenceBadge } from "@/components/common/EvidenceBadge";
import { AIResultLabel } from "@/components/common/AIResultLabel";
import { aiProvider } from "@/features/practice/ai";
import { usePracticeStore } from "@/features/practice/store";
import type { SegmentCandidate } from "@/features/practice/types";

export function SegmentBuilderPractice({
  stepId,
  sourceStepId,
  sourceHref,
}: {
  stepId: string;
  sourceStepId?: string;
  sourceHref: string;
}) {
  const profile = usePracticeStore(useShallow((s) => s.profile));
  const evidence = usePracticeStore((s) => (sourceStepId ? s.evidence[sourceStepId] : undefined));
  const savedSegments = usePracticeStore((s) => s.segments[stepId]);
  const saveSegments = usePracticeStore((s) => s.saveSegments);

  const [loading, setLoading] = useState(false);
  const [segments, setSegments] = useState<SegmentCandidate[] | null>(savedSegments ?? null);

  if (!evidence || evidence.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-background p-5 text-sm text-muted-foreground">
        아직 STEP2에서 만든 고객 증거가 없습니다. 먼저 STEP2를 완료해주세요.
        <Button variant="link" asChild className="ml-1 h-auto p-0">
          <Link href={sourceHref}>
            <ArrowLeft className="size-3.5" />
            STEP2로 이동
          </Link>
        </Button>
      </div>
    );
  }

  const handleBuild = async () => {
    setLoading(true);
    try {
      const result = await aiProvider.buildSegments({
        businessIdea: profile.businessIdea,
        evidence,
      });
      setSegments(result);
      saveSegments(stepId, result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <Button onClick={handleBuild} disabled={loading} className="gap-2">
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            세그먼트 생성 중...
          </>
        ) : (
          <>
            <Sparkles className="size-4" />
            세그먼트 후보 만들기
          </>
        )}
      </Button>

      {segments && (
        <div className="space-y-3">
          <AIResultLabel />
          <div className="grid gap-4 sm:grid-cols-3">
            {segments.map((seg) => (
              <div key={seg.id} className="flex flex-col rounded-xl border border-border bg-background p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-foreground">{seg.name}</p>
                  <EvidenceBadge tag={seg.tag} className="shrink-0" />
                </div>
                <dl className="space-y-1.5 text-xs text-muted-foreground">
                  <div>
                    <dt className="font-semibold text-foreground/80">반복 문제</dt>
                    <dd>{seg.repeatedProblem}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground/80">촉발 사건</dt>
                    <dd>{seg.triggerEvent}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground/80">현재 대안</dt>
                    <dd>{seg.currentAlternative}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground/80">반대 이유</dt>
                    <dd>{seg.objection}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground/80">반증</dt>
                    <dd>{seg.counterEvidence}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
