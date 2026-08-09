"use client";

import Link from "next/link";
import { curriculum, getAllStepIdsForDay } from "@/features/curriculum/data";
import { dayRelease, viewRelease } from "@/features/curriculum/release";
import { useIsStaff } from "@/features/curriculum/useRelease";
import { ScheduledBadge } from "@/components/curriculum/ScheduledNotice";
import { useProgressStore, calcProgressPercent } from "@/features/progress/store";
import { Progress } from "@/components/ui/progress";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function WeekOverviewGrid() {
  const steps = useProgressStore((s) => s.steps);
  const staff = useIsStaff();

  return (
    <div className="space-y-6">
      {curriculum.map((week) => (
        <section key={week.week}>
          <h2 className="mb-3 text-sm font-bold tracking-wide text-muted-foreground uppercase">
            {week.week}주차 · {week.title}
          </h2>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {week.days.map((day) => {
              const release = viewRelease(dayRelease(day), staff);
              // hidden은 학생 목록에 아예 그리지 않는다.
              if (!release.visible) return null;

              const stepIds = getAllStepIdsForDay(week.week, day.day);
              const percent = calcProgressPercent(steps, stepIds);

              return (
                // 잠긴 Day도 눌러서 들어갈 수 있다 — 들어가면 "오픈 예정" 안내가 나온다.
                // 아무 반응 없는 카드보다 왜 못 들어가는지 알려주는 편이 낫다.
                <Link key={day.day} href={routes.day(week.week, day.day)}>
                  <div
                    className={cn(
                      "flex h-full flex-col rounded-2xl border p-4 transition-shadow hover:shadow-md",
                      release.locked
                        ? "border-dashed border-border bg-muted/40"
                        : "border-border bg-card"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-foreground">Day{day.day}</p>
                      {release.locked && <ScheduledBadge />}
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{day.title}</p>
                    {!release.locked && (
                      <div className="mt-auto pt-3">
                        <Progress value={percent} className="h-1.5" />
                        <p className="mt-1 text-[11px] text-muted-foreground">{percent}% 완료</p>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
