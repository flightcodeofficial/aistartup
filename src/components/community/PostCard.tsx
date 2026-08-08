import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import type { Post } from "@/features/community/types";

export function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/community/${post.id}`}
      className="block rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md sm:p-5"
    >
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
          {post.category}
        </Badge>
        <span className="text-xs text-muted-foreground">{formatRelativeTime(post.createdAt)}</span>
      </div>
      <h3 className="mt-2 text-base font-bold text-foreground">{post.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.body}</p>
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span>{post.authorNickname}</span>
        <span className="flex items-center gap-1">
          <Heart className="size-3.5" />
          {post.likeCount}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="size-3.5" />
          {post.commentCount}
        </span>
      </div>
    </Link>
  );
}
