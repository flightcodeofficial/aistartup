"use client";

import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import type { LessonMeta } from "@/features/curriculum/types";
import { useProgressStore } from "@/features/progress/store";
import { StepCard } from "@/components/step/StepCard";
import { staggerContainer } from "@/lib/animations";

const listVariants = staggerContainer(0.08);

export function StepList({ lessons }: { lessons: LessonMeta[] }) {
  const stepsProgress = useProgressStore((s) => s.steps);
  const allSteps = lessons.flatMap((l) => l.steps);
  const nextStepId = allSteps.find((s) => !stepsProgress[s.id]?.completed)?.id ?? allSteps[0]?.id;

  return (
    <div className="space-y-8">
      {lessons.map((lesson) => (
        <div key={lesson.lessonNumber}>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
              <Layers className="size-3.5" />
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">
                Lesson {lesson.lessonNumber} · {lesson.title}
              </p>
              <p className="text-xs text-muted-foreground">{lesson.goal}</p>
            </div>
          </div>
          <motion.div initial="hidden" animate="show" variants={listVariants} className="space-y-4">
            {lesson.steps.map((step) => (
              <StepCard key={step.id} step={step} isNext={step.id === nextStepId} />
            ))}
          </motion.div>
        </div>
      ))}
    </div>
  );
}
