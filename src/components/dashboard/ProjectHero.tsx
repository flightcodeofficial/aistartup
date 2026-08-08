"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  FolderKanban,
  ListChecks,
  MessageCircleQuestion,
  MessageSquareWarning,
  Rocket,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { useDashboardSummary } from "@/features/projects/useDashboardSummary";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { routes } from "@/lib/routes";

export function ProjectHero() {
  const summary = useDashboardSummary();

  if (summary.loading) {
    return <Skeleton className="h-56 w-full rounded-3xl" />;
  }

  const { primaryProject, recentProjects, progressPercent, todos, aiRecommendation, recentQuestion, recentFeedback, recentSaveAt } = summary;

  return (
    <div className="space-y-4">
      <div className="bg-hero-gradient rounded-3xl p-6 text-white sm:p-8">
        <p className="text-xs font-semibold tracking-wide text-white/60 uppercase">내 프로젝트</p>
        {primaryProject ? (
          <>
            <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold sm:text-3xl">
              <Rocket className="size-6" />
              {primaryProject.title}
            </h1>
            <div className="mt-4 flex items-center gap-3">
              <Progress value={progressPercent} className="h-2 flex-1 bg-white/20" />
              <span className="text-sm font-semibold">{progressPercent}%</span>
            </div>
            <Button size="lg" className="mt-4 gap-2 bg-white text-primary hover:bg-white/90" asChild>
              <Link href={routes.project(primaryProject.id)}>
                프로젝트 이어서 작업하기
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </>
        ) : (
          <>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">아직 프로젝트가 없습니다</h1>
            <p className="mt-2 text-sm text-white/70">Day1 STEP4를 완료하면 메인 프로젝트가 자동으로 생깁니다.</p>
            <Button size="lg" className="mt-4 gap-2 bg-white text-primary hover:bg-white/90" asChild>
              <Link href={routes.step(2, 1, 1)}>
                시작하기
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-foreground">
            <ListChecks className="size-4 text-primary" />
            오늘 할 일
          </p>
          <ul className="space-y-1 text-sm text-foreground/80">
            {todos.map((t, i) => (
              <li key={i}>· {t}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-primary">
            <Sparkles className="size-4" />
            AI 추천
          </p>
          <p className="text-sm text-foreground/80">{aiRecommendation}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-foreground">
            <MessageCircleQuestion className="size-4 text-primary" />
            최근 질문
          </p>
          {recentQuestion ? (
            <Link href={`/community/${recentQuestion.id}`} className="text-sm text-foreground/80 hover:underline">
              {recentQuestion.title}
              <span className="ml-1 text-xs text-muted-foreground">{formatRelativeTime(recentQuestion.createdAt)}</span>
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">아직 남긴 질문이 없습니다.</p>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-foreground">
            <MessageSquareWarning className="size-4 text-violet" />
            최근 피드백
          </p>
          {recentFeedback ? (
            <p className="text-sm text-foreground/80">
              [{recentFeedback.projectTitle}] {recentFeedback.body}
              <span className="ml-1 text-xs text-muted-foreground">{formatRelativeTime(recentFeedback.createdAt)}</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">아직 받은 피드백이 없습니다.</p>
          )}
        </div>
      </div>

      {recentSaveAt && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarClock className="size-3.5" />
          최근 저장: {formatRelativeTime(recentSaveAt)}
        </p>
      )}

      {recentProjects.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
              <FolderKanban className="size-4 text-primary" />
              최근 프로젝트
            </p>
            <Link href={routes.myProjects()} className="text-xs font-medium text-primary hover:underline">
              모두 보기 →
            </Link>
          </div>
          <div className="space-y-2">
            {recentProjects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
