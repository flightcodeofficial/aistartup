"use client";

import { useState } from "react";
import { Loader2, MessageSquareWarning, Reply, Scale, Send, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { ARTIFACT_LABELS } from "@/features/projects/types";
import type { ProjectArtifacts, ProjectFeedback, ProjectVersion } from "@/features/projects/types";

function VersionCompare({ versions }: { versions: ProjectVersion[] }) {
  const [leftIdx, setLeftIdx] = useState(Math.max(0, versions.length - 2));
  const [rightIdx, setRightIdx] = useState(versions.length - 1);

  if (versions.length < 2) return null;

  const left = versions[leftIdx];
  const right = versions[rightIdx];
  const fields = Object.keys(ARTIFACT_LABELS) as (keyof ProjectArtifacts)[];
  const changedFields = fields.filter((f) => left.artifacts[f] !== right.artifacts[f]);

  return (
    <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
        <Scale className="size-3.5 text-primary" />
        버전 비교
      </p>
      <div className="flex items-center gap-2 text-xs">
        <select
          value={leftIdx}
          onChange={(e) => setLeftIdx(Number(e.target.value))}
          className="rounded-md border border-border bg-background px-2 py-1"
        >
          {versions.map((v, i) => (
            <option key={v.versionNumber} value={i}>
              v{v.versionNumber}
            </option>
          ))}
        </select>
        <span className="text-muted-foreground">vs</span>
        <select
          value={rightIdx}
          onChange={(e) => setRightIdx(Number(e.target.value))}
          className="rounded-md border border-border bg-background px-2 py-1"
        >
          {versions.map((v, i) => (
            <option key={v.versionNumber} value={i}>
              v{v.versionNumber}
            </option>
          ))}
        </select>
      </div>
      {changedFields.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">두 버전 사이에 변경된 섹션이 없습니다.</p>
      ) : (
        <div className="mt-2 space-y-2">
          {changedFields.map((field) => (
            <div key={field} className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md border border-danger/20 bg-danger/5 p-2">
                <p className="mb-1 font-semibold text-danger">v{left.versionNumber} · {ARTIFACT_LABELS[field]}</p>
                <p className="whitespace-pre-line text-foreground/80">{left.artifacts[field] || "(비어있음)"}</p>
              </div>
              <div className="rounded-md border border-success/20 bg-success/5 p-2">
                <p className="mb-1 font-semibold text-success">v{right.versionNumber} · {ARTIFACT_LABELS[field]}</p>
                <p className="whitespace-pre-line text-foreground/80">{right.artifacts[field] || "(비어있음)"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function VersionFeedbackPanel({
  versions,
  feedback,
  editable,
  onCommitVersion,
  onAddFeedback,
  onReplyFeedback,
}: {
  versions: ProjectVersion[];
  feedback: ProjectFeedback[];
  editable: boolean;
  onCommitVersion: (note: string) => Promise<void>;
  onAddFeedback: (versionNumber: number, body: string) => Promise<void>;
  onReplyFeedback?: (feedbackId: string, reply: string) => Promise<void>;
}) {
  const [note, setNote] = useState("");
  const [committing, setCommitting] = useState(false);
  const [feedbackDraft, setFeedbackDraft] = useState("");
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);

  const latestVersion = versions.at(-1)?.versionNumber ?? 1;

  const handleCommit = async () => {
    setCommitting(true);
    try {
      await onCommitVersion(note || `v${latestVersion + 1} 저장`);
      setNote("");
    } finally {
      setCommitting(false);
    }
  };

  const handleFeedback = async () => {
    if (!feedbackDraft.trim()) return;
    setSendingFeedback(true);
    try {
      await onAddFeedback(latestVersion, feedbackDraft);
      setFeedbackDraft("");
    } finally {
      setSendingFeedback(false);
    }
  };

  const handleReply = async (feedbackId: string) => {
    const reply = replyDraft[feedbackId];
    if (!reply?.trim() || !onReplyFeedback) return;
    setReplyingId(feedbackId);
    try {
      await onReplyFeedback(feedbackId, reply);
      setReplyDraft((prev) => ({ ...prev, [feedbackId]: "" }));
    } finally {
      setReplyingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-foreground">
          <Tag className="size-4 text-primary" />
          버전 기록
        </p>
        <div className="space-y-2">
          {versions.length === 0 && (
            <p className="text-sm text-muted-foreground">아직 저장된 버전이 없습니다.</p>
          )}
          {versions
            .slice()
            .reverse()
            .map((v) => (
              <div key={v.versionNumber} className="rounded-lg bg-muted/60 px-3 py-2 text-sm">
                <span className="font-semibold text-primary">v{v.versionNumber}</span>{" "}
                <span className="text-foreground/90">{v.note}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {formatRelativeTime(v.createdAt)}
                </span>
              </div>
            ))}
        </div>
        <VersionCompare versions={versions} />
        {editable && (
          <div className="mt-3 flex gap-2">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="이번 수정 사항을 간단히 적어주세요 (예: 강사 피드백 반영해 ICP 수정)"
              rows={2}
              className="flex-1"
            />
            <Button onClick={handleCommit} disabled={committing} className="self-end">
              {committing ? <Loader2 className="size-4 animate-spin" /> : `v${latestVersion + 1} 저장`}
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-violet/20 bg-violet/5 p-4">
        <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-violet">
          <MessageSquareWarning className="size-4" />
          강사 피드백
        </p>
        <div className="space-y-2">
          {feedback.length === 0 && (
            <p className="text-sm text-muted-foreground">아직 강사 피드백이 없습니다.</p>
          )}
          {feedback.map((f) => (
            <div key={f.id} className="rounded-lg border border-violet/20 bg-background p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  {f.authorNickname} · v{f.versionNumber}
                  {f.field && <span className="ml-1 text-xs font-normal text-muted-foreground">({ARTIFACT_LABELS[f.field]})</span>}
                </p>
                <span className="text-xs text-muted-foreground">{formatRelativeTime(f.createdAt)}</span>
              </div>
              <p className="mt-1 text-sm text-foreground/90">{f.body}</p>
              {f.reply && (
                <div className="mt-2 rounded-md bg-muted/60 p-2 text-sm">
                  <p className="text-xs font-semibold text-muted-foreground">학생 답변</p>
                  <p className="mt-0.5 text-foreground/90">{f.reply}</p>
                </div>
              )}
              {editable && !f.reply && onReplyFeedback && (
                <div className="mt-2 flex gap-1.5">
                  <Textarea
                    value={replyDraft[f.id] ?? ""}
                    onChange={(e) => setReplyDraft((prev) => ({ ...prev, [f.id]: e.target.value }))}
                    placeholder="답변을 남겨보세요"
                    rows={1}
                    className="flex-1 text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    disabled={replyingId === f.id || !replyDraft[f.id]?.trim()}
                    onClick={() => handleReply(f.id)}
                  >
                    <Reply className="size-3.5" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Textarea
            value={feedbackDraft}
            onChange={(e) => setFeedbackDraft(e.target.value)}
            placeholder="강사 피드백을 남겨보세요 (지금은 누구나 강사 역할로 남길 수 있는 데모 상태입니다)"
            rows={2}
            className="flex-1"
          />
          <Button
            variant="outline"
            onClick={handleFeedback}
            disabled={sendingFeedback || !feedbackDraft.trim()}
            className="self-end gap-1.5"
          >
            {sendingFeedback ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
