"use client";

import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import type { DayMeta, LessonMeta } from "@/features/curriculum/types";
import { lessonRelease, viewRelease } from "@/features/curriculum/release";
import { useIsStaff } from "@/features/curriculum/useRelease";
import { ScheduledBadge } from "@/components/curriculum/ScheduledNotice";
import { useProgressStore } from "@/features/progress/store";
import { StepCard } from "@/components/step/StepCard";
import { staggerContainer } from "@/lib/animations";
import { SCHEDULED_NOTICE } from "@/features/curriculum/release";

const listVariants = staggerContainer(0.08);

export function StepList({ lessons, day }: { lessons: LessonMeta[]; day?: DayMeta }) {
  const stepsProgress = useProgressStore((s) => s.steps);
  const staff = useIsStaff();

  // 잠긴 Lesson의 STEP은 "다음 학습"으로 제안하지 않는다.
  const openSteps = lessons
    .filter((l) => viewRelease(lessonRelease(day, l), staff).canEnter)
    .flatMap((l) => l.steps);
  const nextStepId =
    openSteps.find((s) => !stepsProgress[s.id]?.completed)?.id ?? openSteps[0]?.id;

  return (
    <div className="space-y-8">
      {lessons.map((lesson) => {
        const release = viewRelease(lessonRelease(day, lesson), staff);
        if (!release.visible) return null;

        return (
          <div key={lesson.lessonNumber}>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                <Layers className="size-3.5" />
              </span>
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-foreground">
                  Lesson {lesson.lessonNumber} · {lesson.title}
                  {release.locked && <ScheduledBadge />}
                </p>
                <p className="text-xs text-muted-foreground">{lesson.goal}</p>
              </div>
            </div>

            {release.canEnter ? (
              <motion.div
                initial="hidden"
                animate="show"
                variants={listVariants}
                className="space-y-4"
              >
                {lesson.steps.map((step) => (
                  <StepCard key={step.id} step={step} isNext={step.id === nextStepId} />
                ))}
              </motion.div>
            ) : (
              // 잠긴 Lesson은 STEP 목록을 펼치지 않는다. 제목만 남겨
              // "이런 수업이 온다"는 것만 보이게 한다.
              <div className="rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-5 text-center">
                <p className="text-sm font-medium text-foreground">
                  {SCHEDULED_NOTICE.heading}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{SCHEDULED_NOTICE.hint}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
