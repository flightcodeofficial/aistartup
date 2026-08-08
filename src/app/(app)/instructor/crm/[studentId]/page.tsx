"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Clock,
  FileEdit,
  FolderKanban,
  MessageCircleQuestion,
  NotebookPen,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { loadStudentDetail } from "@/features/instructor/studentSummary";
import type { StudentDetail } from "@/features/instructor/studentSummary";
import { communityRepository } from "@/features/community";
import { assignmentRepository } from "@/features/assignments";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { routes } from "@/lib/routes";

const TIMELINE_ICON: Record<StudentDetail["timeline"][number]["type"], typeof Sparkles> = {
  post: MessageCircleQuestion,
  submission: FileEdit,
  booking: CalendarCheck,
  note: NotebookPen,
  diagnosis: Sparkles,
  feedback: MessageCircleQuestion,
  project: FolderKanban,
};

export default function StudentDetailPage() {
  const params = useParams<{ studentId: string }>();
  const router = useRouter();
  const [detail, setDetail] = useState<StudentDetail | null>(null);

  const refresh = useCallback(async () => {
    setDetail(await loadStudentDetail());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleApproveBooking = async (id: string) => {
    await communityRepository.confirmBooking(id);
    refresh();
  };

  const handleReviewSubmission = async (id: string) => {
    await assignmentRepository.markReviewed(id, "확인했습니다. 잘 정리했어요!");
    refresh();
  };

  if (!detail) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-6 sm:px-8 sm:py-10">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const { summary, projects, openQuestions, submissions, bookings, feedback, timeline } = detail;
  const isMatchingStudent = summary.studentId === params.studentId;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-8 sm:py-10">
      <Button variant="ghost" size="sm" className="-ml-2 gap-1.5" onClick={() => router.push(routes.instructorCrm())}>
        <ArrowLeft className="size-4" />
        학생 목록
      </Button>

      <div className="bg-hero-gradient rounded-3xl p-6 text-white sm:p-8">
        <h1 className="text-2xl font-bold sm:text-3xl">{summary.nickname}</h1>
        <p className="mt-1 text-sm text-white/70">{summary.lastStepLabel}</p>
        {!isMatchingStudent && (
          <p className="mt-2 text-xs text-white/60">
            로컬 데모라 URL의 학생 ID와 무관하게 현재 이 브라우저의 학생 데이터를 보여줍니다.
          </p>
        )}
        <dl className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <div className="rounded-lg bg-white/10 p-2">
            <dt className="text-xs text-white/60">진행률</dt>
            <dd className="font-medium">{summary.overallPercent}%</dd>
          </div>
          <div className="rounded-lg bg-white/10 p-2">
            <dt className="text-xs text-white/60">프로젝트</dt>
            <dd className="font-medium">{summary.projectCount}개</dd>
          </div>
          <div className="rounded-lg bg-white/10 p-2">
            <dt className="text-xs text-white/60">AI 사용</dt>
            <dd className="font-medium">{summary.aiUsageCount}회</dd>
          </div>
          <div className="rounded-lg bg-white/10 p-2">
            <dt className="text-xs text-white/60">노트</dt>
            <dd className="font-medium">{summary.noteCount}개</dd>
          </div>
        </dl>
      </div>

      <section>
        <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-foreground">
          <FolderKanban className="size-4 text-primary" />
          프로젝트
        </p>
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">아직 프로젝트가 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={routes.projectPublicView(p.id)}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-3 hover:bg-muted/50"
              >
                <span className="text-sm font-medium text-foreground">{p.title}</span>
                <Badge variant="outline" className="border-primary/30 bg-primary/10 text-xs text-primary">
                  v{p.versions.length || 1}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-foreground">
          <CalendarCheck className="size-4 text-primary" />
          승인 대기 컨설팅 예약
        </p>
        {bookings.length === 0 ? (
          <p className="text-sm text-muted-foreground">대기 중인 예약이 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {bookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{b.slotLabel}</p>
                  <p className="text-xs text-muted-foreground">{formatRelativeTime(b.createdAt)}</p>
                </div>
                <Button size="sm" onClick={() => handleApproveBooking(b.id)} className="gap-1.5">
                  <CheckCircle2 className="size-3.5" />
                  승인
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-foreground">
          <MessageCircleQuestion className="size-4 text-primary" />
          강사 확인이 필요한 질문
        </p>
        {openQuestions.length === 0 ? (
          <p className="text-sm text-muted-foreground">확인이 필요한 질문이 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {openQuestions.map((q) => (
              <Link key={q.id} href={`/community/${q.id}`} className="block rounded-xl border border-warning/30 bg-warning/5 p-3 hover:bg-warning/10">
                <p className="text-sm font-medium text-foreground">{q.title}</p>
                <p className="text-xs text-muted-foreground">{formatRelativeTime(q.createdAt)}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-foreground">
          <FileEdit className="size-4 text-primary" />
          확인 대기 과제
        </p>
        {submissions.length === 0 ? (
          <p className="text-sm text-muted-foreground">확인이 필요한 과제가 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {submissions.map((s) => (
              <div key={s.id} className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{s.title}</p>
                  <Button variant="outline" size="sm" onClick={() => handleReviewSubmission(s.id)} className="gap-1.5">
                    <CheckCircle2 className="size-3.5" />
                    확인 완료로 표시
                  </Button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(s.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {feedback.length > 0 && (
        <section>
          <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-foreground">
            <MessageCircleQuestion className="size-4 text-violet" />
            내가 남긴 프로젝트 피드백
          </p>
          <div className="space-y-2">
            {feedback.map((f) => (
              <div key={f.id} className="rounded-xl border border-violet/20 bg-violet/5 p-3">
                <p className="text-xs font-semibold text-violet">{f.projectTitle}</p>
                <p className="mt-1 text-sm text-foreground/90">{f.body}</p>
                {f.reply && <p className="mt-1 text-xs text-muted-foreground">학생 답변: {f.reply}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-foreground">
          <Clock className="size-4 text-primary" />
          학습 로그 · 타임라인
        </p>
        {timeline.length === 0 ? (
          <p className="text-sm text-muted-foreground">아직 활동 기록이 없습니다.</p>
        ) : (
          <div className="space-y-1">
            {timeline.slice(0, 20).map((event) => {
              const Icon = TIMELINE_ICON[event.type];
              const content = (
                <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted/50">
                  <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate text-foreground/90">{event.label}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeTime(event.at)}</span>
                </div>
              );
              return event.href ? (
                <Link key={event.id} href={event.href}>
                  {content}
                </Link>
              ) : (
                <div key={event.id}>{content}</div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
