"use client";

import { useState } from "react";
import { Loader2, NotebookPen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import type { ProjectNote } from "@/features/projects/types";

export function NotesPanel({
  notes,
  editable,
  onAdd,
  onDelete,
}: {
  notes: ProjectNote[];
  editable: boolean;
  onAdd: (body: string) => Promise<void>;
  onDelete: (noteId: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    try {
      await onAdd(draft);
      setDraft("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-foreground">
        <NotebookPen className="size-4 text-primary" />
        노트
      </p>
      <div className="space-y-2">
        {notes.length === 0 && <p className="text-sm text-muted-foreground">아직 노트가 없습니다.</p>}
        {notes.map((note) => (
          <div key={note.id} className="flex items-start justify-between gap-2 rounded-lg bg-muted/60 px-3 py-2">
            <div>
              <p className="text-sm whitespace-pre-line text-foreground/90">{note.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(note.updatedAt)}</p>
            </div>
            {editable && (
              <Button
                variant="ghost"
                size="icon"
                className="size-6 shrink-0 text-muted-foreground hover:text-danger"
                onClick={() => onDelete(note.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>
      {editable && (
        <div className="mt-3 flex gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="아이디어, 할 일, 참고할 내용을 적어두세요."
            rows={2}
            className="flex-1"
          />
          <Button onClick={handleAdd} disabled={saving || !draft.trim()} className="self-end">
            {saving ? <Loader2 className="size-4 animate-spin" /> : "추가"}
          </Button>
        </div>
      )}
    </div>
  );
}
