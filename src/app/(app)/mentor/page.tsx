"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Lightbulb, ListChecks, Loader2, Sparkles, Target, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyProjects } from "@/features/projects/useMyProjects";
import { projectRepository } from "@/features/projects";
import { DIAGNOSIS_SCOPE_LABELS } from "@/features/projects/types";
import type { DiagnosisReport, DiagnosisScope, Project } from "@/features/projects/types";
import { diagnoseProject } from "@/features/mentor/mockDiagnose";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const SCOPES: DiagnosisScope[] = ["idea", "icp", "landingPage", "marketing", "ir", "pitch", "faq", "full"];

function DiagnosisCard({ report }: { report: DiagnosisReport }) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm font-bold text-primary">
          <Sparkles className="size-4" />
          {DIAGNOSIS_SCOPE_LABELS[report.scope]}
        </p>
        <span className="text-xs text-muted-foreground">{formatRelativeTime(report.createdAt)}</span>
      </div>

      <p className="mt-2 text-sm text-foreground/90">{report.currentState}</p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-success">
            <CheckCircle2 className="size-3.5" />
            강점
          </p>
          <ul className="space-y-0.5 text-xs text-foreground/80">
            {report.strengths.map((s, i) => (
              <li key={i}>· {s}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-danger">
            <Target className="size-3.5" />
            약점
          </p>
          <ul className="space-y-0.5 text-xs text-foreground/80">
            {report.weaknesses.map((w, i) => (
              <li key={i}>· {w}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-3">
        <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-foreground">
          <ListChecks className="size-3.5" />
          우선순위 / 추천 액션
        </p>
        <div className="flex flex-wrap gap-1.5">
          {report.priorities.map((p, i) => (
            <Badge key={i} variant="outline" className="border-primary/30 bg-background text-xs text-primary">
              {p}
            </Badge>
          ))}
        </div>
        <ul className="mt-1.5 space-y-0.5 text-xs text-foreground/80">
          {report.recommendedActions.map((a, i) => (
            <li key={i}>· {a}</li>
          ))}
        </ul>
      </div>

      <div className="mt-3 rounded-lg bg-background p-2 text-xs">
        <span className="font-semibold text-foreground">다음 실습: </span>
        <span className="text-foreground/80">{report.nextPractice}</span>
      </div>
    </div>
  );
}

function AiMentorView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { projects, loading: loadingProjects } = useMyProjects();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [project, setProject] = useState<Project | undefined>(undefined);
  const [reports, setReports] = useState<DiagnosisReport[]>([]);
  const [running, setRunning] = useState<DiagnosisScope | null>(null);

  useEffect(() => {
    if (selectedId) return;
    const fromQuery = searchParams.get("project");
    if (fromQuery) {
      setSelectedId(fromQuery);
    } else if (!loadingProjects && projects.length > 0) {
      setSelectedId(projects.find((p) => p.isPrimary)?.id ?? projects[0].id);
    }
  }, [searchParams, loadingProjects, projects, selectedId]);

  const refresh = useCallback(async () => {
    if (!selectedId) return;
    const [p, d] = await Promise.all([
      projectRepository.getProject(selectedId),
      projectRepository.listDiagnoses(selectedId),
    ]);
    setProject(p);
    setReports(d);
  }, [selectedId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleRun = async (scope: DiagnosisScope) => {
    if (!project) return;
    setRunning(scope);
    try {
      const result = diagnoseProject(project, scope);
      await projectRepository.saveDiagnosis(project.id, result);
      await refresh();
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-8 sm:py-10">
      <Button variant="ghost" size="sm" className="-ml-2 gap-1.5" onClick={() => router.back()}>
        <ArrowLeft className="size-4" />
        뒤로
      </Button>

      <div className="bg-hero-gradient rounded-3xl p-6 text-white sm:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
          <Wand2 className="size-3.5" />
          AI Mentor
        </span>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">질문형 멘토에서 사업 코치로</h1>
        <p className="mt-2 text-sm text-white/70">
          현재 프로젝트에 실제로 적어둔 내용을 읽어서 진단합니다. 비어있는 섹션이 많으면 그 사실을
          그대로 알려드리고, 다음에 무엇을 채워야 할지 안내합니다.
        </p>
      </div>

      {loadingProjects ? (
        <Skeleton className="h-10 w-full rounded-xl" />
      ) : projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          아직 프로젝트가 없습니다. Day1 STEP4를 완료하면 메인 프로젝트가 자동으로 생깁니다.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                selectedId === p.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40"
              )}
            >
              {p.title}
            </button>
          ))}
        </div>
      )}

      {project && (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SCOPES.map((scope) => (
              <Button
                key={scope}
                variant="outline"
                className="h-auto flex-col gap-1 py-3 text-xs"
                disabled={running !== null}
                onClick={() => handleRun(scope)}
              >
                {running === scope ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Lightbulb className="size-4 text-primary" />
                )}
                {DIAGNOSIS_SCOPE_LABELS[scope]}
              </Button>
            ))}
          </div>

          <div className="space-y-3">
            {reports.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                위 버튼을 눌러 진단을 실행하면 여기에 결과가 쌓입니다.
              </p>
            ) : (
              reports.map((r) => <DiagnosisCard key={r.id} report={r} />)
            )}
          </div>

          <Button variant="link" className="px-0" onClick={() => router.push(routes.project(project.id))}>
            {project.title} Workspace로 이동 →
          </Button>
        </>
      )}
    </div>
  );
}

export default function AiMentorPage() {
  return (
    <Suspense fallback={null}>
      <AiMentorView />
    </Suspense>
  );
}
