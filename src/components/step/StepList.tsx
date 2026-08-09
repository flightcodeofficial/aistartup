"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Layers } from "lucide-react";
import { getLessonCards } from "@/features/curriculum/canonicalLessons";
import { viewRelease, SCHEDULED_NOTICE } from "@/features/curriculum/release";
import { useIsStaff } from "@/features/curriculum/useRelease";
import { ScheduledBadge } from "@/components/curriculum/ScheduledNotice";
import { useProgressStore } from "@/features/progress/store";
import { staggerContainer } from "@/lib/animations";
import { routes } from "@/lib/routes";

const listVariants = staggerContainer(0.08);

// Day 화면의 정식 Lesson 목록. canonical Block Lesson(getLessonCards) 기준으로
// Lesson 카드 하나씩만 보여준다 — STEP1/STEP2를 별도 교시 구조처럼 늘어놓지 않는다.
// 입장은 항상 canonical Lesson URL(/lesson/[l]/page/1)로 보낸다. Block Lesson이
// published인지, legacy로 fallback할지는 그 라우트의 resolver가 정한다.

export function StepList({ week, day }: { week: number; day: number }) {
  const stepsProgress = useProgressStore((s) => s.steps);
  const staff = useIsStaff();
  const cards = getLessonCards(week, day);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={listVariants}
      className="space-y-3"
    >
      {cards.map((card) => {
        const release = viewRelease(card.release, staff);
        if (!release.visible) return null;

        const href = routes.lessonPage(week, day, card.lessonNumber, 1);
        const isDone =
          card.legacySteps.length > 0 && card.legacySteps.every((s) => stepsProgress[s.id]?.completed);

        return (
          <div
            key={card.lessonNumber}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-4"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-foreground">
                Lesson {card.lessonNumber} · {card.title}
                {release.locked && <ScheduledBadge />}
                {release.canEnter && isDone && (
                  <span className="text-xs font-medium text-success">완료</span>
                )}
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{card.description}</p>
            </div>

            {release.canEnter ? (
              <Link
                href={href}
                className="flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {isDone ? "다시 보기" : "학습 시작"}
                <ChevronRight className="size-3.5" />
              </Link>
            ) : (
              <span className="shrink-0 text-xs font-medium text-muted-foreground">
                {SCHEDULED_NOTICE.badge}
              </span>
            )}
          </div>
        );
      })}
    </motion.div>
  );
}
