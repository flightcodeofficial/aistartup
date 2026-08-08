"use client";

import { useState } from "react";
import { Loader2, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { PostCategory } from "@/features/community/types";
import { cn } from "@/lib/utils";

const CATEGORIES: PostCategory[] = ["공지사항", "질문하기", "학습토론"];

export function NewPostDialog({
  onCreate,
  defaultCategory = "질문하기",
}: {
  onCreate: (input: { title: string; body: string; category: PostCategory }) => Promise<void>;
  defaultCategory?: PostCategory;
}) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<PostCategory>(defaultCategory);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    try {
      await onCreate({ title, body, category });
      setTitle("");
      setBody("");
      setCategory(defaultCategory);
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PenSquare className="size-4" />
          새 글 작성
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 글 작성</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>카테고리</Label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    category === c
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="post-title">제목</Label>
            <Input
              id="post-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="post-body">내용</Label>
            <Textarea
              id="post-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="내용을 입력하세요"
              rows={5}
              className="mt-1.5"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={submitting || !title.trim() || !body.trim()}>
            {submitting ? <Loader2 className="size-4 animate-spin" /> : "게시하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
