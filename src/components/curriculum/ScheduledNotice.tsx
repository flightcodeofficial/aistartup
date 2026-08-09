"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarClock, ChevronLeft, Lock } from "lucide-react";
import { SCHEDULED_NOTICE } from "@/features/curriculum/release";
import { Button } from "@/components/ui/button";

// 아직 진도가 오지 않은 Day/Lesson에 들어왔을 때 보여주는 화면.
//
// "미완성"·"오류"·"권한 없음"이라고 말하지 않는다 — 학생 잘못도, 고장도 아니다.
// 아직 순서가 오지 않았을 뿐이라는 것만 분명히 전한다.

export function ScheduledNotice({
  title,
  goal,
  backHref,
}: {
  title: string;
  goal?: string;
  /** 돌아갈 곳. 없으면 브라우저 뒤로 간다. */
  backHref?: string;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card px-6 py-16 text-center sm:py-20">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Lock className="size-6" />
      </div>

      <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
        <CalendarClock className="size-3.5" />
        {SCHEDULED_NOTICE.badge}
      </span>

      <h1 className="mt-3 text-xl font-bold text-foreground">{title}</h1>
      {goal && <p className="mt-2 max-w-md text-sm text-muted-foreground">{goal}</p>}

      <p className="mt-5 text-sm font-medium text-foreground">{SCHEDULED_NOTICE.heading}</p>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{SCHEDULED_NOTICE.body}</p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {backHref ? (
          <Button asChild variant="outline" className="min-h-11 gap-1.5 sm:min-h-9">
            <Link href={backHref}>
              <ChevronLeft className="size-4" />
              이전 화면으로 돌아가기
            </Link>
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="min-h-11 gap-1.5 sm:min-h-9"
          >
            <ChevronLeft className="size-4" />
            이전 화면으로 돌아가기
          </Button>
        )}
        <Button asChild variant="ghost" className="min-h-11 sm:min-h-9">
          <Link href="/dashboard">대시보드</Link>
        </Button>
      </div>
    </div>
  );
}

/** 카드·목록에 붙이는 작은 표시. Day 카드와 Lesson 카드가 같은 것을 쓴다. */
export function ScheduledBadge({ className }: { className?: string }) {
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground " +
        (className ?? "")
      }
    >
      <Lock className="size-3" />
      {SCHEDULED_NOTICE.badge}
    </span>
  );
}

/** 강사·관리자가 잠긴 화면을 열었을 때, 학생에게는 안 보인다는 사실을 알려준다. */
export function StaffUnlockNotice({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-2.5 text-xs text-foreground">
      <b>강사 전용 미리보기</b> — 이 {label}는 지금 <b>{SCHEDULED_NOTICE.badge}</b> 상태입니다.
      학생 화면에는 잠금으로 표시되며 들어갈 수 없습니다.
    </div>
  );
}
