"use client";

import { useState } from "react";
import { Bot, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { cn } from "@/lib/utils";

export interface CommentLike {
  id: string;
  authorNickname: string;
  body: string;
  isAI?: boolean;
  createdAt: number;
}

export function CommentSection({
  comments,
  onAdd,
}: {
  comments: CommentLike[];
  onAdd: (body: string) => Promise<void>;
}) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!value.trim()) return;
    setSubmitting(true);
    try {
      await onAdd(value);
      setValue("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold text-foreground">댓글 {comments.length}개</h2>

      <div className="space-y-3">
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground">첫 댓글을 남겨보세요.</p>
        )}
        {comments.map((c) => (
          <div
            key={c.id}
            className={cn(
              "rounded-xl border p-3",
              c.isAI ? "border-violet/30 bg-violet/5" : "border-border bg-card"
            )}
          >
            <div className="flex items-center justify-between">
              <p
                className={cn(
                  "flex items-center gap-1.5 text-sm font-semibold",
                  c.isAI ? "text-violet" : "text-foreground"
                )}
              >
                {c.isAI && <Bot className="size-3.5" />}
                {c.authorNickname}
              </p>
              <span className="text-xs text-muted-foreground">{formatRelativeTime(c.createdAt)}</span>
            </div>
            <p className="mt-1 text-sm whitespace-pre-line text-foreground/90">{c.body}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="댓글을 입력하세요"
          rows={2}
          className="flex-1"
        />
        <Button onClick={handleSubmit} disabled={submitting || !value.trim()} className="self-end">
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </div>
    </div>
  );
}
