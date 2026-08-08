"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronRight, ShieldAlert, Sparkles, Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { loadStudentDetail } from "@/features/instructor/studentSummary";
import type { StudentSummary } from "@/features/instructor/studentSummary";
import { subscribeCommunityChange } from "@/features/community/realtimeChannel";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { routes } from "@/lib/routes";

const FLAG_LABEL: Record<StudentSummary["flag"], { label: string; className: string }> = {
  attention: { label: "주의 학생", className: "border-danger/30 bg-danger/10 text-danger" },
  excellent: { label: "우수 학생", className: "border-success/30 bg-success/10 text-success" },
  normal: { label: "진행 중", className: "border-muted-foreground/20 bg-muted text-muted-foreground" },
};

export default function InstructorCrmListPage() {
  const [students, setStudents] = useState<StudentSummary[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      const detail = await loadStudentDetail();
      if (!cancelled) setStudents([detail.summary]);
    };
    refresh();
    const unsubscribe = subscribeCommunityChange("posts", refresh);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-8 sm:py-10">
      <div className="bg-hero-gradient rounded-3xl p-6 text-white sm:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
          <ShieldAlert className="size-3.5" />
          강사 전용 · Student CRM
        </span>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">학생 목록</h1>
        <p className="mt-2 text-sm text-white/70">
          이 브라우저에 로그인이 없어 지금은 &ldquo;현재 접속 중인 나&rdquo; 한 명만 목록에
          표시됩니다. 실제 여러 학생은 Supabase 연결 이후 이 목록에 자동으로 채워지도록
          설계되어 있습니다.
        </p>
      </div>

      <section>
        <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-foreground">
          <Users className="size-4 text-primary" />
          전체 학생 {students ? `(${students.length})` : ""}
        </p>

        {!students ? (
          <Skeleton className="h-20 w-full rounded-2xl" />
        ) : (
          <div className="space-y-2">
            {students.map((s) => (
              <Link
                key={s.studentId}
                href={routes.instructorCrmStudent(s.studentId)}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-foreground">{s.nickname}</p>
                    <Badge variant="outline" className={FLAG_LABEL[s.flag].className}>
                      {s.flag === "attention" && <AlertTriangle className="mr-1 size-3" />}
                      {s.flag === "excellent" && <Star className="mr-1 size-3" />}
                      {FLAG_LABEL[s.flag].label}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {s.lastStepLabel} · 최근 접속 {formatRelativeTime(s.lastActiveAt)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>진행률 {s.overallPercent}%</span>
                    <span>프로젝트 {s.projectCount}개</span>
                    <span>질문 {s.openQuestionCount}개</span>
                    <span>과제 대기 {s.pendingSubmissionCount}개</span>
                    <span>예약 대기 {s.pendingBookingCount}개</span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="size-3" />
                      AI 사용 {s.aiUsageCount}회
                    </span>
                  </div>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
