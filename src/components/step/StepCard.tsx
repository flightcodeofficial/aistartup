"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, ArrowRight, Star } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import type { Step } from "@/features/curriculum/types";
import { useProgressStore } from "@/features/progress/store";
import { routes } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { cardHover, fadeUp } from "@/lib/animations";
import { cn } from "@/lib/utils";

const PRACTICE_LABEL: Record<Step["practice"]["kind"], string> = {
  evidenceQuiz: "실습 · 미니 퀴즈",
  evidenceExtract: "실습 · 증거 추출",
  segmentBuilder: "실습 · 세그먼트 생성",
  fullAnalysis: "실습 · AI 통합 분석",
  valueProposition: "실습 · 가치제안 완성",
};

export function StepCard({ step, isNext }: { step: Step; isNext?: boolean }) {
  const progress = useProgressStore(useShallow((s) => s.getStep(step.id)));
  const toggleFavorite = useProgressStore((s) => s.toggleFavorite);
  const href = routes.step(step.week, step.day, step.stepNumber);

  return (
    <motion.div variants={fadeUp}>
      <motion.div
        initial="rest"
        whileHover="hover"
        variants={cardHover}
        className={cn(
          "group relative rounded-2xl border bg-card p-5 sm:p-6",
          isNext ? "border-primary/40 ring-1 ring-primary/20" : "border-border"
        )}
      >
        {isNext && (
          <span className="absolute -top-3 left-5 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
            다음으로 이어하기
          </span>
        )}
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
              progress.completed
                ? "bg-success/15 text-success"
                : "bg-primary/10 text-primary"
            )}
          >
            {progress.completed ? (
              <CheckCircle2 className="size-6" />
            ) : (
              `S${step.stepNumber}`
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-bold text-foreground sm:text-lg">
                {step.title}
              </h3>
              <button
                type="button"
                aria-label="즐겨찾기"
                onClick={() => toggleFavorite(step.id)}
                className="shrink-0 text-muted-foreground transition-colors hover:text-warning"
              >
                <Star
                  className={cn(
                    "size-4.5",
                    progress.favorited && "fill-warning text-warning"
                  )}
                />
              </button>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{step.summary}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-secondary px-2.5 py-1 font-medium text-secondary-foreground">
                {PRACTICE_LABEL[step.practice.kind]}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                약 {step.practice.estimatedMinutes}분
              </span>
            </div>

            <Button
              asChild
              size="sm"
              variant={progress.completed ? "outline" : "default"}
              className="mt-4 gap-1.5"
            >
              <Link href={href}>
                {progress.completed ? "다시보기" : isNext ? "이어하기" : "시작하기"}
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
