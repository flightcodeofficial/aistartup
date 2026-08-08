"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EvidenceBadge } from "@/components/common/EvidenceBadge";
import { aiProvider } from "@/features/practice/ai";
import type { EvidenceQuizItem, EvidenceTag } from "@/features/practice/types";
import { fadeUp } from "@/lib/animations";
import { cn } from "@/lib/utils";

const TAGS: EvidenceTag[] = ["근거있음", "추론", "검증필요"];

export function EvidenceQuizPractice() {
  const [items, setItems] = useState<EvidenceQuizItem[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, EvidenceTag>>({});

  useEffect(() => {
    aiProvider.getEvidenceQuiz().then(setItems);
  }, []);

  if (!items) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const correctCount = items.filter((it) => answers[it.id] === it.correctTag).length;

  return (
    <div className="space-y-4">
      {items.map((item, i) => {
        const selected = answers[item.id];
        const isCorrect = selected === item.correctTag;

        return (
          <motion.div
            key={item.id}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-background p-4"
          >
            <p className="text-sm leading-relaxed font-medium text-foreground">
              {item.sentence}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  disabled={Boolean(selected)}
                  onClick={() => setAnswers((prev) => ({ ...prev, [item.id]: tag }))}
                  className={cn(
                    "rounded-full transition-opacity",
                    selected && selected !== tag && "opacity-40",
                    !selected && "hover:opacity-80"
                  )}
                >
                  <EvidenceBadge tag={tag} />
                </button>
              ))}
            </div>
            {selected && (
              <div
                className={cn(
                  "mt-3 flex items-start gap-2 rounded-lg p-3 text-sm",
                  isCorrect ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                )}
              >
                {isCorrect ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                ) : (
                  <XCircle className="mt-0.5 size-4 shrink-0" />
                )}
                <span>
                  {isCorrect ? "정답입니다. " : `아쉽지만 정답은 "${item.correctTag}"입니다. `}
                  {item.explanation}
                </span>
              </div>
            )}
          </motion.div>
        );
      })}

      {answeredCount === items.length && (
        <div className="rounded-xl bg-primary/10 p-4 text-center text-sm font-semibold text-primary">
          {items.length}문항 중 {correctCount}개 정답 — 완벽한 정답보다 판단 기준을 익히는 게
          목표였다는 걸 기억하세요.
        </div>
      )}
    </div>
  );
}
