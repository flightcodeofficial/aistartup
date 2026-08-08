"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { curriculum, getAllStepIdsForDay } from "@/features/curriculum/data";
import { useProgressStore, calcProgressPercent } from "@/features/progress/store";
import { Progress } from "@/components/ui/progress";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function WeekOverviewGrid() {
  const steps = useProgressStore((s) => s.steps);

  return (
    <div className="space-y-6">
      {curriculum.map((week) => (
        <section key={week.week}>
          <h2 className="mb-3 text-sm font-bold tracking-wide text-muted-foreground uppercase">
            {week.week}주차 · {week.title}
          </h2>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {week.days.map((day) => {
              const isComingSoon = day.status === "coming-soon";
              const stepIds = getAllStepIdsForDay(week.week, day.day);
              const percent = calcProgressPercent(steps, stepIds);
              const card = (
                <div
                  className={cn(
                    "flex h-full flex-col rounded-2xl border p-4 transition-shadow",
                    isComingSoon
                      ? "border-dashed border-border bg-muted/40 text-muted-foreground"
                      : "border-border bg-card hover:shadow-md"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground">Day{day.day}</p>
                    {isComingSoon && <Lock className="size-3.5" />}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{day.title}</p>
                  {!isComingSoon && (
                    <div className="mt-auto pt-3">
                      <Progress value={percent} className="h-1.5" />
                      <p className="mt-1 text-[11px] text-muted-foreground">{percent}% 완료</p>
                    </div>
                  )}
                </div>
              );

              return isComingSoon ? (
                <div key={day.day}>{card}</div>
              ) : (
                <Link key={day.day} href={routes.day(week.week, day.day)}>
                  {card}
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
