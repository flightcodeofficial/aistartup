"use client";

import Link from "next/link";
import { CalendarDays, FolderOpenDot, ListChecks } from "lucide-react";
import type { DayMeta } from "@/features/curriculum/types";
import { flattenSteps } from "@/features/curriculum/data";
import { displayDayTitle } from "@/features/curriculum/release";
import { useProgressStore, calcProgressPercent } from "@/features/progress/store";
import { ProgressRing } from "@/components/common/ProgressRing";
import { routes } from "@/lib/routes";

export function DayHero({ day }: { day: DayMeta }) {
  const steps = useProgressStore((s) => s.steps);
  const allSteps = flattenSteps(day);
  const stepIds = allSteps.map((s) => s.id);
  const percent = calcProgressPercent(steps, stepIds);
  const totalMinutes = allSteps.reduce((sum, s) => sum + s.practice.estimatedMinutes, 0);

  return (
    <div className="bg-hero-gradient rounded-3xl p-6 text-white sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            <CalendarDays className="size-3.5" />
            {day.week}주차 · Day{day.day}
          </span>
          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">{displayDayTitle(day)}</h1>
          <p className="mt-2 text-sm text-white/70 sm:text-base">{day.goal}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-white/60">
            <span className="flex items-center gap-2">
              <ListChecks className="size-3.5" />
              STEP {allSteps.length}개 · 총 약 {totalMinutes}분
            </span>
            <Link
              href={routes.results(day.week, day.day)}
              className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 font-medium text-white transition-colors hover:bg-white/20"
            >
              <FolderOpenDot className="size-3.5" />
              내 결과 모아보기
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3 self-start rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-sm">
          <ProgressRing percent={percent} size={64} />
          <div className="text-sm">
            <p className="font-semibold">오늘 진행률</p>
            <p className="text-white/60">
              {stepIds.filter((id) => steps[id]?.completed).length}/{stepIds.length} STEP 완료
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
