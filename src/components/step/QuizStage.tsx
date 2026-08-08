"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import type { QuizQuestion } from "@/features/curriculum/types";
import { useProgressStore } from "@/features/progress/store";
import { SectionHeading } from "@/components/common/SectionHeading";
import { fadeUp } from "@/lib/animations";
import { cn } from "@/lib/utils";

/** ③ Quiz 단계 — 방금 배운 Theory/Example 내용을 이해했는지 확인하는 4지선다.
 *  실제 산출물을 만드는 ④ Practice와는 다른, 이해 확인용 단계다. */
export function QuizStage({ stepId, quiz }: { stepId: string; quiz: QuizQuestion[] }) {
  const setQuizScore = useProgressStore((s) => s.setQuizScore);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const answeredCount = Object.keys(answers).length;
  const correctCount = useMemo(
    () => quiz.filter((q) => answers[q.id] === q.correctIndex).length,
    [quiz, answers]
  );
  const allAnswered = answeredCount === quiz.length && quiz.length > 0;

  useEffect(() => {
    if (allAnswered) setQuizScore(stepId, correctCount, quiz.length);
  }, [allAnswered, correctCount, quiz.length, stepId, setQuizScore]);

  return (
    <section>
      <SectionHeading icon={HelpCircle} eyebrow="③ Quiz" title="배운 내용 확인하기" />
      <div className="mt-4 space-y-4">
        {quiz.map((q, i) => {
          const selected = answers[q.id];
          const isAnswered = selected !== undefined;
          const isCorrect = selected === q.correctIndex;

          return (
            <motion.div
              key={q.id}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card p-4"
            >
              <p className="text-sm leading-relaxed font-medium text-foreground">{q.question}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {q.options.map((option, optionIndex) => {
                  const isThisSelected = selected === optionIndex;
                  const isThisCorrect = optionIndex === q.correctIndex;
                  return (
                    <button
                      key={optionIndex}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: optionIndex }))}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                        !isAnswered && "border-border hover:border-primary/40 hover:bg-primary/5",
                        isAnswered && isThisCorrect && "border-success/40 bg-success/10 text-success",
                        isAnswered &&
                          isThisSelected &&
                          !isThisCorrect &&
                          "border-danger/40 bg-danger/10 text-danger",
                        isAnswered && !isThisSelected && !isThisCorrect && "border-border text-muted-foreground/70"
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {isAnswered && (
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
                  <span>{q.explanation}</span>
                </div>
              )}
            </motion.div>
          );
        })}

        {allAnswered && (
          <div className="rounded-xl bg-primary/10 p-4 text-center text-sm font-semibold text-primary">
            {quiz.length}문항 중 {correctCount}개 정답
          </div>
        )}
      </div>
    </section>
  );
}
