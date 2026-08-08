"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, FileEdit, Loader2 } from "lucide-react";
import { assignmentRepository } from "@/features/assignments";
import type { AssignmentSubmission } from "@/features/assignments/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/formatRelativeTime";

export default function AssignmentsPage() {
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [relatedLabel, setRelatedLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    setSubmissions(await assignmentRepository.listMySubmissions());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const unsubscribe = assignmentRepository.subscribe(refresh);
    return unsubscribe;
  }, [refresh]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      await assignmentRepository.submit({ title, content, relatedLabel: relatedLabel || undefined });
      setTitle("");
      setContent("");
      setRelatedLabel("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:px-8 sm:py-10">
      <div>
        <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          <FileEdit className="size-3.5" />
          커뮤니티
        </p>
        <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">과제 제출</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Day별 실습 결과나 추가 과제를 제출하면 강사가 확인 후 피드백을 남깁니다.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <div>
          <Label htmlFor="a-related">관련 STEP (선택)</Label>
          <Input
            id="a-related"
            value={relatedLabel}
            onChange={(e) => setRelatedLabel(e.target.value)}
            placeholder="예: Day1 STEP4"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="a-title">제목</Label>
          <Input
            id="a-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="과제 제목"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="a-content">내용</Label>
          <Textarea
            id="a-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="제출 내용을 작성하거나, 결과물 링크를 붙여넣으세요."
            rows={4}
            className="mt-1.5"
          />
        </div>
        <Button onClick={handleSubmit} disabled={submitting || !title.trim() || !content.trim()}>
          {submitting ? <Loader2 className="size-4 animate-spin" /> : "제출하기"}
        </Button>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-bold text-foreground">내 제출 내역</p>
        {!loading && submissions.length === 0 && (
          <p className="text-sm text-muted-foreground">아직 제출한 과제가 없습니다.</p>
        )}
        {submissions.map((s) => (
          <div key={s.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">{s.title}</p>
              <Badge
                variant="outline"
                className={
                  s.status === "reviewed"
                    ? "border-success/30 bg-success/10 text-success"
                    : "border-warning/40 bg-warning/10 text-warning-foreground"
                }
              >
                {s.status === "reviewed" ? (
                  <>
                    <CheckCircle2 className="size-3" />
                    확인 완료
                  </>
                ) : (
                  "확인 대기중"
                )}
              </Badge>
            </div>
            {s.relatedLabel && (
              <p className="mt-1 text-xs text-muted-foreground">{s.relatedLabel}</p>
            )}
            <p className="mt-2 text-sm whitespace-pre-line text-foreground/90">{s.content}</p>
            {s.reviewNote && (
              <p className="mt-2 rounded-lg bg-violet/5 px-3 py-2 text-xs text-violet">
                강사 코멘트: {s.reviewNote}
              </p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">{formatRelativeTime(s.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
