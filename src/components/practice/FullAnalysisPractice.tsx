"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIResultLabel } from "@/components/common/AIResultLabel";
import { aiProvider } from "@/features/practice/ai";
import { usePracticeStore } from "@/features/practice/store";
import type { Day1AnalysisResult } from "@/features/practice/types";
import { cn } from "@/lib/utils";

const STAGES: Array<"아이디어" | "인터뷰" | "MVP" | "초기매출"> = [
  "아이디어",
  "인터뷰",
  "MVP",
  "초기매출",
];

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/60 p-3">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-foreground/90">{value}</p>
    </div>
  );
}

export function FullAnalysisPractice({ stepId }: { stepId: string }) {
  const profile = usePracticeStore(useShallow((s) => s.profile));
  const setProfile = usePracticeStore((s) => s.setProfile);
  const saved = usePracticeStore((s) => s.analyses[stepId]);
  const saveAnalysis = usePracticeStore((s) => s.saveAnalysis);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Day1AnalysisResult | null>(saved ?? null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const analysis = await aiProvider.analyzeCustomer({
        businessIdea: profile.businessIdea,
        stage: profile.stage,
        rawCustomerText: profile.rawCustomerText || undefined,
        isHypothetical: profile.isHypothetical,
      });
      setResult(analysis);
      saveAnalysis(stepId, analysis);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div>
          <Label htmlFor="fa-idea">사업명 / 아이디어 한 문장</Label>
          <Input
            id="fa-idea"
            value={profile.businessIdea}
            onChange={(e) => setProfile({ businessIdea: e.target.value })}
            placeholder="예: 소규모 카페를 위한 재고·발주 자동화 서비스"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label>현재 단계</Label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {STAGES.map((stage) => (
              <button
                key={stage}
                type="button"
                onClick={() => setProfile({ stage })}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  profile.stage === stage
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40"
                )}
              >
                {stage}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="fa-raw">고객에 대해 알고 있는 정보 (선택)</Label>
          <Textarea
            id="fa-raw"
            rows={4}
            value={profile.rawCustomerText}
            onChange={(e) => setProfile({ rawCustomerText: e.target.value })}
            placeholder="문제, 상황, 반응 등 아는 만큼만 적어주세요."
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

      <Button onClick={handleAnalyze} disabled={loading || !profile.businessIdea} className="gap-2">
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            AI가 ICP·ECP·페르소나·고객여정을 정리하는 중...
          </>
        ) : (
          <>
            <Sparkles className="size-4" />
            분석하기
          </>
        )}
      </Button>

      {result && (
        <div className="space-y-3">
        <AIResultLabel />
        <Tabs defaultValue="icp" className="w-full">
          <TabsList className="grid w-full grid-cols-4 sm:grid-cols-4">
            <TabsTrigger value="icp">ICP·ECP</TabsTrigger>
            <TabsTrigger value="persona">페르소나</TabsTrigger>
            <TabsTrigger value="journey">고객여정</TabsTrigger>
            <TabsTrigger value="verify">검증 질문</TabsTrigger>
          </TabsList>

          <TabsContent value="icp" className="mt-4 space-y-4">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="mb-3 text-sm font-bold text-primary">ICP</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="고객 유형" value={result.icp.customerType} />
                <Field label="핵심 상황" value={result.icp.keySituation} />
                <Field label="문제 강도" value={result.icp.problemIntensity} />
                <Field label="현재 대안" value={result.icp.currentAlternative} />
                <Field label="시도 의향" value={result.icp.willingnessToTry} />
                <Field label="의사결정자" value={result.icp.decisionMaker} />
                <Field label="적합 조건" value={result.icp.fitConditions} />
                <Field label="부적합 조건" value={result.icp.unfitConditions} />
              </div>
            </div>
            <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
              <p className="mb-2 text-sm font-bold text-warning-foreground">ECP — 지금 시도할 초기 고객</p>
              <p className="text-sm text-foreground/90">{result.ecp.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">{result.ecp.reason}</p>
            </div>
            <div className="rounded-xl border border-danger/30 bg-danger/5 p-4">
              <p className="mb-2 text-sm font-bold text-danger">안티 ICP — 맞지 않는 고객</p>
              <ul className="list-inside list-disc space-y-1 text-sm text-foreground/90">
                {result.antiIcp.conditions.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="persona" className="mt-4 grid gap-4 sm:grid-cols-2">
            {result.personas.map((p) => (
              <div key={p.role} className="rounded-xl border border-border bg-background p-4">
                <p className="mb-2 text-sm font-bold text-foreground">{p.role}</p>
                <Field label="상황" value={p.situation} />
                <div className="mt-2 grid grid-cols-1 gap-2">
                  <Field label="근거" value={p.evidence} />
                  <Field label="반증" value={p.counterEvidence} />
                  <Field label="미확인" value={p.unknown} />
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="journey" className="mt-4">
            <div className="scrollbar-thin overflow-x-auto">
              <div className="flex min-w-[720px] gap-3">
                {result.journey.map((stage) => (
                  <div
                    key={stage.stage}
                    className="w-44 shrink-0 rounded-xl border border-border bg-background p-3"
                  >
                    <p className="text-xs font-bold text-primary">{stage.stage}</p>
                    <p className="mt-1.5 text-xs font-medium text-foreground">{stage.action}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">&ldquo;{stage.question}&rdquo;</p>
                    <p className="mt-2 text-[11px] text-danger">이탈위험: {stage.churnRisk}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="verify" className="mt-4">
            <ul className="space-y-2">
              {result.verificationQuestions.map((q, i) => (
                <li
                  key={i}
                  className="rounded-lg bg-muted/60 px-3 py-2 text-sm text-foreground/90"
                >
                  {i + 1}. {q}
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
        </div>
      )}
    </div>
  );
}
