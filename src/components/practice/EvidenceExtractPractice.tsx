"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { EvidenceBadge } from "@/components/common/EvidenceBadge";
import { AIResultLabel } from "@/components/common/AIResultLabel";
import { aiProvider } from "@/features/practice/ai";
import { usePracticeStore } from "@/features/practice/store";
import type { EvidenceRow } from "@/features/practice/types";

export function EvidenceExtractPractice({ stepId }: { stepId: string }) {
  const profile = usePracticeStore(useShallow((s) => s.profile));
  const setProfile = usePracticeStore((s) => s.setProfile);
  const savedRows = usePracticeStore((s) => s.evidence[stepId]);
  const saveEvidence = usePracticeStore((s) => s.saveEvidence);

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<EvidenceRow[] | null>(savedRows ?? null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await aiProvider.extractEvidence({
        businessIdea: profile.businessIdea,
        rawCustomerText: profile.rawCustomerText,
      });
      setRows(result);
      saveEvidence(stepId, result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4">
        <div>
          <Label htmlFor="businessIdea">사업 아이디어 한 문장</Label>
          <Input
            id="businessIdea"
            placeholder="예: 소규모 카페를 위한 재고·발주 자동화 서비스"
            value={profile.businessIdea}
            onChange={(e) => setProfile({ businessIdea: e.target.value })}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="rawText">고객 후기·인터뷰·문의 원문 (선택)</Label>
          <Textarea
            id="rawText"
            rows={5}
            placeholder="있는 만큼만 붙여넣으세요. 없다면 경쟁 상품 리뷰나 모의 인터뷰도 괜찮습니다."
            value={profile.rawCustomerText}
            onChange={(e) => setProfile({ rawCustomerText: e.target.value })}
            className="mt-1.5"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox
            checked={profile.isHypothetical}
            onCheckedChange={(v) => setProfile({ isHypothetical: Boolean(v) })}
          />
          이 자료는 실제 고객 데이터가 아닙니다 (교육용 가설)
        </label>
      </div>

      <Button onClick={handleAnalyze} disabled={loading} className="gap-2">
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            AI가 분석 중...
          </>
        ) : (
          <>
            <Sparkles className="size-4" />
            분석하기
          </>
        )}
      </Button>

      {rows && (
        <div className="space-y-3">
          <AIResultLabel />
          {profile.isHypothetical && (
            <p className="rounded-lg bg-warning/10 px-3 py-2 text-xs font-medium text-warning-foreground">
              교육용 가설 데이터로 표시됨 — 실제 고객 데이터가 아닙니다.
            </p>
          )}
          {rows.map((row) => (
            <div key={row.id} className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-foreground">{row.sourceLine}</p>
                <EvidenceBadge tag={row.tag} className="shrink-0" />
              </div>
              <dl className="mt-3 grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
                {row.problem && (
                  <div>
                    <dt className="inline font-semibold">문제: </dt>
                    <dd className="inline">{row.problem}</dd>
                  </div>
                )}
                {row.triggerEvent && (
                  <div>
                    <dt className="inline font-semibold">촉발사건: </dt>
                    <dd className="inline">{row.triggerEvent}</dd>
                  </div>
                )}
                {row.currentAlternative && (
                  <div>
                    <dt className="inline font-semibold">현재대안: </dt>
                    <dd className="inline">{row.currentAlternative}</dd>
                  </div>
                )}
                {row.objection && (
                  <div>
                    <dt className="inline font-semibold">반대이유: </dt>
                    <dd className="inline">{row.objection}</dd>
                  </div>
                )}
              </dl>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
