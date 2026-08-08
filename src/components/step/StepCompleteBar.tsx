"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { CheckCircle2, ChevronLeft, ChevronRight, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProgressStore } from "@/features/progress/store";

export function StepCompleteBar({
  stepId,
  stepTitle,
  prevHref,
  nextHref,
}: {
  stepId: string;
  stepTitle: string;
  prevHref?: string;
  nextHref?: string;
}) {
  const progress = useProgressStore(useShallow((s) => s.getStep(stepId)));
  const markComplete = useProgressStore((s) => s.markComplete);

  const handleToggle = () => {
    const next = !progress.completed;
    markComplete(stepId, next);
    if (next) {
      toast.success(`"${stepTitle}" 완료로 저장했습니다`, {
        description: "대시보드에서 진행률을 확인할 수 있어요.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <Button
        variant={progress.completed ? "outline" : "default"}
        className="gap-2"
        onClick={handleToggle}
      >
        {progress.completed ? (
          <>
            <CheckCircle2 className="size-4 text-success" />
            완료됨 · 취소하려면 클릭
          </>
        ) : (
          <>
            <Circle className="size-4" />이 STEP 완료 표시
          </>
        )}
      </Button>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" disabled={!prevHref} asChild={Boolean(prevHref)}>
          {prevHref ? (
            <Link href={prevHref}>
              <ChevronLeft className="size-4" />
              이전
            </Link>
          ) : (
            <span>
              <ChevronLeft className="size-4" />
              이전
            </span>
          )}
        </Button>
        <Button size="sm" disabled={!nextHref} asChild={Boolean(nextHref)}>
          {nextHref ? (
            <Link href={nextHref}>
              다음
              <ChevronRight className="size-4" />
            </Link>
          ) : (
            <span>
              다음
              <ChevronRight className="size-4" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
