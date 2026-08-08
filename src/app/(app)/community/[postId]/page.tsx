"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePostDetail } from "@/features/community/usePostDetail";
import { LikeButton } from "@/components/community/LikeButton";
import { CommentSection } from "@/components/community/CommentSection";
import { formatRelativeTime } from "@/lib/formatRelativeTime";

export default function PostDetailPage() {
  const params = useParams<{ postId: string }>();
  const router = useRouter();
  const { post, comments, liked, loading, addComment, toggleLike, escalateToInstructor } =
    usePostDetail(params.postId);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-6 sm:px-8 sm:py-10">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-8">
        <p className="text-sm text-muted-foreground">게시글을 찾을 수 없습니다.</p>
        <Button variant="link" onClick={() => router.push("/community")}>
          게시판으로 돌아가기
        </Button>
      </div>
    );
  }

  const isQuestion = post.category === "질문하기";

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:px-8 sm:py-10">
      <Button variant="ghost" size="sm" className="gap-1.5 -ml-2" onClick={() => router.push("/community")}>
        <ArrowLeft className="size-4" />
        게시판
      </Button>

      <div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
            {post.category}
          </Badge>
          {post.needsInstructor && (
            <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning-foreground">
              강사 확인 대기중
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">{formatRelativeTime(post.createdAt)}</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-foreground">{post.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{post.authorNickname}</p>
        <p className="mt-4 text-sm leading-relaxed whitespace-pre-line text-foreground/90">
          {post.body}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <LikeButton liked={liked} likeCount={post.likeCount} onToggle={toggleLike} />
        {isQuestion && !post.needsInstructor && (
          <Button variant="outline" className="gap-1.5" onClick={escalateToInstructor}>
            <UserRound className="size-4" />
            강사에게 질문하기
          </Button>
        )}
      </div>

      <CommentSection comments={comments} onAdd={addComment} />
    </div>
  );
}
