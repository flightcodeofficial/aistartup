import Link from "next/link";
import { Heart, MessageCircle, MessageSquareWarning, Rocket, Sparkles, Star, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { routes } from "@/lib/routes";
import type { Project } from "@/features/projects/types";

export function ProjectCard({
  project,
  href,
  onDelete,
}: {
  project: Project;
  /** 기본값은 소유자용 Workspace Dashboard. 공개 목록에서는 읽기 전용 뷰 경로를 넘긴다. */
  href?: string;
  onDelete?: (projectId: string) => void;
}) {
  return (
    <div className="group relative rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md sm:p-5">
      <Link href={href ?? routes.project(project.id)} className="block">
        <div className="flex flex-wrap items-center gap-2 pr-8">
          {project.isPrimary && (
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
              <Star className="mr-1 size-3" />
              메인
            </Badge>
          )}
          <Badge
            variant="outline"
            className={
              project.visibility === "public"
                ? "border-success/30 bg-success/10 text-success"
                : "border-muted-foreground/20 bg-muted text-muted-foreground"
            }
          >
            {project.visibility === "public" ? "공개" : "비공개"}
          </Badge>
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
            v{project.versions.length || 1}
          </Badge>
          <span className="text-xs text-muted-foreground">{formatRelativeTime(project.updatedAt)}</span>
        </div>
        <h3 className="mt-2 flex items-center gap-1.5 text-base font-bold text-foreground">
          <Rocket className="size-4 text-primary" />
          {project.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{project.summary}</p>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span>{project.ownerNickname}</span>
          <span className="flex items-center gap-1">
            <Heart className="size-3.5" />
            {project.likeCount}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="size-3.5" />
            {project.commentCount}
          </span>
          {project.feedbackCount > 0 && (
            <span className="flex items-center gap-1 text-violet">
              <MessageSquareWarning className="size-3.5" />
              피드백 {project.feedbackCount}
            </span>
          )}
          {project.lastAiUseAt && (
            <span className="flex items-center gap-1 text-primary">
              <Sparkles className="size-3.5" />
              AI 진단 {formatRelativeTime(project.lastAiUseAt)}
            </span>
          )}
        </div>
      </Link>
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 size-7 text-muted-foreground hover:text-danger"
          onClick={(e) => {
            e.preventDefault();
            onDelete(project.id);
          }}
        >
          <Trash2 className="size-4" />
        </Button>
      )}
    </div>
  );
}
