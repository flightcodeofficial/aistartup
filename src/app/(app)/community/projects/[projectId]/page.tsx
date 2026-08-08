"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Rocket, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectDetail } from "@/features/projects/useProjectDetail";
import { getCurrentUser } from "@/features/community/currentUser";
import { ArtifactSection } from "@/components/projects/ArtifactSection";
import { LikeButton } from "@/components/community/LikeButton";
import { CommentSection } from "@/components/community/CommentSection";
import { ARTIFACT_FIELD_ORDER } from "@/features/projects/types";
import { routes } from "@/lib/routes";

export default function ProjectPublicViewPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const { project, comments, liked, loading, toggleLike, addComment } = useProjectDetail(params.projectId);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-6 sm:px-8 sm:py-10">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!project || project.visibility !== "public") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-8">
        <p className="text-sm text-muted-foreground">공개된 프로젝트를 찾을 수 없습니다.</p>
        <Button variant="link" onClick={() => router.push(routes.projects())}>
          프로젝트 공유로 돌아가기
        </Button>
      </div>
    );
  }

  const isOwner = getCurrentUser().id === project.ownerId;
  const visibleFields =
    project.shareMode === "partial"
      ? ARTIFACT_FIELD_ORDER.filter((f) => project.publicFieldKeys.includes(f))
      : ARTIFACT_FIELD_ORDER;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:px-8 sm:py-10">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="-ml-2 gap-1.5" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
          뒤로
        </Button>
        {isOwner && (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => router.push(routes.project(project.id))}>
            <Settings2 className="size-3.5" />
            내 Workspace에서 편집
          </Button>
        )}
      </div>

      <div>
        <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
          공개 {project.shareMode === "partial" ? `· 일부 공개 (${visibleFields.length}개 섹션)` : ""}
        </Badge>
        <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold text-foreground">
          <Rocket className="size-5 text-primary" />
          {project.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{project.summary}</p>
        <p className="mt-1 text-xs text-muted-foreground">{project.ownerNickname}</p>
      </div>

      <div className="space-y-3">
        {visibleFields.map((field) => (
          <ArtifactSection key={field} field={field} value={project.draftArtifacts[field] ?? ""} editable={false} />
        ))}
      </div>

      <LikeButton liked={liked} likeCount={project.likeCount} onToggle={toggleLike} />
      <CommentSection comments={comments} onAdd={addComment} />
    </div>
  );
}
