"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarClock, ClipboardCheck, Download, MessageSquareWarning, Rocket, Sparkles, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useProjectDetail } from "@/features/projects/useProjectDetail";
import { getCurrentUser } from "@/features/community/currentUser";
import { ArtifactSection } from "@/components/projects/ArtifactSection";
import { VersionFeedbackPanel } from "@/components/projects/VersionFeedbackPanel";
import { NotesPanel } from "@/components/projects/NotesPanel";
import { FilesPanel } from "@/components/projects/FilesPanel";
import { ShareSettingsDialog } from "@/components/projects/ShareSettingsDialog";
import { LikeButton } from "@/components/community/LikeButton";
import { CommentSection } from "@/components/community/CommentSection";
import { ARTIFACT_FIELD_ORDER, ARTIFACT_LABELS } from "@/features/projects/types";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { routes } from "@/lib/routes";

export default function ProjectDashboardPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const {
    project,
    comments,
    feedback,
    notes,
    files,
    diagnoses,
    liked,
    loading,
    updateDraft,
    commitVersion,
    setVisibility,
    setShareSettings,
    toggleLike,
    addComment,
    addFeedback,
    replyFeedback,
    addNote,
    deleteNote,
    uploadFile,
    downloadFile,
    deleteFile,
  } = useProjectDetail(params.projectId);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-6 sm:px-8 sm:py-10">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-8">
        <p className="text-sm text-muted-foreground">프로젝트를 찾을 수 없습니다.</p>
        <Button variant="link" onClick={() => router.push(routes.myProjects())}>
          내 프로젝트로 돌아가기
        </Button>
      </div>
    );
  }

  const isOwner = getCurrentUser().id === project.ownerId;
  if (!isOwner) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-8">
        <p className="text-sm text-muted-foreground">이 프로젝트의 Workspace는 소유자만 볼 수 있습니다.</p>
        {project.visibility === "public" && (
          <Button variant="link" onClick={() => router.push(routes.projectPublicView(project.id))}>
            공개된 프로젝트 보기
          </Button>
        )}
      </div>
    );
  }

  const filledCount = ARTIFACT_FIELD_ORDER.filter((f) => project.draftArtifacts[f]?.trim()).length;
  const progressPercent = Math.round((filledCount / ARTIFACT_FIELD_ORDER.length) * 100);
  const latestFeedback = feedback.at(-1);

  const handleExport = async () => {
    const { projectRepository } = await import("@/features/projects");
    const markdown = await projectRepository.exportProjectMarkdown(project.id);
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title || "project"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-8 sm:py-10">
      <Button variant="ghost" size="sm" className="-ml-2 gap-1.5" onClick={() => router.push(routes.myProjects())}>
        <ArrowLeft className="size-4" />
        내 프로젝트
      </Button>

      {/* 통합 안내: 결과물의 정본은 이제 /workspace 다.
          다만 파일·노트·강사 피드백·공유설정은 아직 이 화면에만 있어서
          리다이렉트하지 않고 두 화면을 연결해둔다. */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-3">
        <p className="text-xs text-muted-foreground">
          결과물은 이제 <span className="font-semibold text-foreground">내 저장공간</span>에 모입니다.
          이 화면은 파일·노트·강사 피드백 보관용으로 유지됩니다.
        </p>
        <Button variant="outline" size="sm" asChild className="gap-1.5">
          <Link href={`/workspace/projects/${project.id}`}>저장공간에서 보기</Link>
        </Button>
      </div>

      <div className="bg-hero-gradient rounded-3xl p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          {project.isPrimary && (
            <Badge className="border-white/30 bg-white/10 text-white">메인 프로젝트</Badge>
          )}
          <Badge className="border-white/30 bg-white/10 text-white">
            {project.visibility === "public" ? "공개" : "비공개"}
          </Badge>
        </div>
        <h1 className="mt-3 flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <Rocket className="size-6" />
          {project.title}
        </h1>
        {project.summary && <p className="mt-1 text-sm text-white/70">{project.summary}</p>}

        <div className="mt-4 flex items-center gap-3">
          <Progress value={progressPercent} className="h-2 flex-1 bg-white/20" />
          <span className="text-sm font-semibold">{progressPercent}%</span>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          <div className="rounded-lg bg-white/10 p-2">
            <dt className="flex items-center gap-1 text-xs text-white/60">
              <CalendarClock className="size-3.5" />
              최근 수정
            </dt>
            <dd className="font-medium">{formatRelativeTime(project.updatedAt)}</dd>
          </div>
          <div className="rounded-lg bg-white/10 p-2">
            <dt className="flex items-center gap-1 text-xs text-white/60">
              <Sparkles className="size-3.5" />
              최근 AI 사용
            </dt>
            <dd className="font-medium">
              {project.lastAiUseAt ? formatRelativeTime(project.lastAiUseAt) : "아직 없음"}
            </dd>
          </div>
          <div className="rounded-lg bg-white/10 p-2">
            <dt className="flex items-center gap-1 text-xs text-white/60">
              <MessageSquareWarning className="size-3.5" />
              최근 피드백
            </dt>
            <dd className="font-medium">
              {latestFeedback ? formatRelativeTime(latestFeedback.createdAt) : "아직 없음"}
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" className="gap-1.5 border-white/30 bg-white/10 text-white hover:bg-white/20" onClick={handleExport}>
            <Download className="size-4" />
            Export
          </Button>
          <ShareSettingsDialog
            project={project}
            onSetVisibility={setVisibility}
            onSetShareSettings={setShareSettings}
          />
          <Button variant="outline" className="gap-1.5 border-white/30 bg-white/10 text-white hover:bg-white/20" asChild>
            <Link href={routes.communityBookings()}>
              <ClipboardCheck className="size-4" />
              컨설팅
            </Link>
          </Button>
          <Button className="gap-1.5 bg-white text-primary hover:bg-white/90" asChild>
            <Link href={routes.mentorForProject(project.id)}>
              <Wand2 className="size-4" />
              AI Mentor로 진단
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <Accordion type="multiple" defaultValue={["icp"]} className="px-4">
          {ARTIFACT_FIELD_ORDER.map((field) => (
            <AccordionItem key={field} value={field}>
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  {ARTIFACT_LABELS[field]}
                  {project.draftArtifacts[field]?.trim() ? (
                    <Badge variant="outline" className="border-success/30 bg-success/10 text-[10px] text-success">
                      작성됨
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-muted-foreground/20 text-[10px] text-muted-foreground">
                      비어있음
                    </Badge>
                  )}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <ArtifactSection
                  field={field}
                  value={project.draftArtifacts[field] ?? ""}
                  editable
                  onChange={(value) => updateDraft({ [field]: value })}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <FilesPanel files={files} editable onUpload={uploadFile} onDownload={downloadFile} onDelete={deleteFile} />
      <NotesPanel notes={notes} editable onAdd={addNote} onDelete={deleteNote} />

      {diagnoses.length > 0 && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-primary">
            <Sparkles className="size-4" />
            최근 AI 진단
          </p>
          <p className="text-sm text-foreground/90">{diagnoses[0].currentState}</p>
          <Link href={routes.mentorForProject(project.id)} className="mt-2 inline-block text-xs font-medium text-primary hover:underline">
            전체 진단 기록 보기 →
          </Link>
        </div>
      )}

      <VersionFeedbackPanel
        versions={project.versions}
        feedback={feedback}
        editable
        onCommitVersion={commitVersion}
        onAddFeedback={(versionNumber, body) => addFeedback(versionNumber, body, "강사")}
        onReplyFeedback={replyFeedback}
      />

      {project.visibility === "public" && (
        <>
          <LikeButton liked={liked} likeCount={project.likeCount} onToggle={toggleLike} />
          <CommentSection comments={comments} onAdd={addComment} />
        </>
      )}
    </div>
  );
}
