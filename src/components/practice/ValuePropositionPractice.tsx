"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Quote, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIResultLabel } from "@/components/common/AIResultLabel";
import { usePracticeStore } from "@/features/practice/store";
import { aiProvider } from "@/features/practice/ai";
import type { ValueProposition } from "@/features/practice/types";

export function ValuePropositionPractice({
  stepId,
  sourceStepId,
  sourceHref,
}: {
  stepId: string;
  sourceStepId?: string;
  sourceHref: string;
}) {
  const analysis = usePracticeStore((s) => (sourceStepId ? s.analyses[sourceStepId] : undefined));
  const saved = usePracticeStore((s) => s.valueProps[stepId]);
  const saveValueProposition = usePracticeStore((s) => s.saveValueProposition);

  const [loading, setLoading] = useState(false);
  const [vp, setVp] = useState<ValueProposition | null>(saved ?? analysis?.valueProposition ?? null);

  if (!analysis) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-background p-5 text-sm text-muted-foreground">
        아직 STEP4에서 만든 분석 결과가 없습니다. 먼저 STEP4를 완료해주세요.
        <Button variant="link" asChild className="ml-1 h-auto p-0">
          <Link href={sourceHref}>
            <ArrowLeft className="size-3.5" />
            STEP4로 이동
          </Link>
        </Button>
      </div>
    );
  }

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await aiProvider.regenerateValueProposition(analysis);
      setVp(result);
      saveValueProposition(stepId, result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <Button onClick={handleGenerate} disabled={loading} className="gap-2">
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            가치제안 정리 중...
          </>
        ) : (
          <>
            <Sparkles className="size-4" />
            가치제안 캔버스 만들기
          </>
        )}
      </Button>

      {vp && (
        <>
          <AIResultLabel />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="mb-2 text-sm font-bold text-primary">고객</p>
              <ValueList title="해야 할 일" items={vp.customerJobs} />
              <ValueList title="고충" items={vp.customerPains} />
              <ValueList title="기대 이득" items={vp.customerGains} />
            </div>
            <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
              <p className="mb-2 text-sm font-bold text-warning-foreground">우리 제품</p>
              <ValueList title="제공 서비스" items={vp.productServices} />
              <ValueList title="고충 해결 방식" items={vp.painRelievers} />
              <ValueList title="이득 창출 방식" items={vp.gainCreators} />
            </div>
          </div>

          <div className="bg-hero-gradient rounded-2xl p-6 text-center text-white sm:p-8">
            <Quote className="mx-auto size-5 text-white/40" />
            <p className="mx-auto mt-3 max-w-xl text-lg font-bold sm:text-xl">{vp.oneLiner}</p>
            <p className="mt-2 text-xs font-medium tracking-wide text-white/50 uppercase">
              오늘의 가치제안
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function ValueList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="text-xs font-semibold text-muted-foreground">{title}</p>
      <ul className="mt-1 space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-foreground/90">
            · {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
