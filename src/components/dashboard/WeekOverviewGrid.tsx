"use client";

import Link from "next/link";
import { curriculum } from "@/features/curriculum/data";
import { dayRelease, viewRelease, SCHEDULED_NOTICE } from "@/features/curriculum/release";
import { useIsStaff } from "@/features/curriculum/useRelease";
import { ScheduledBadge } from "@/components/curriculum/ScheduledNotice";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function WeekOverviewGrid() {
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
                    {/* 아직 주제를 배정하지 않은 Day는 title이 비어 있다 — 가짜 제목 대신
                        "수업 일정에 따라 순차 공개됩니다" 안내로 대체한다. */}
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {day.title.trim() || (release.locked ? SCHEDULED_NOTICE.hint : "")}
                    </p>
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
