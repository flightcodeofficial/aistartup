"use client";

import { useEffect, useRef, useState } from "react";
import { NotebookPen, Check } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { Textarea } from "@/components/ui/textarea";
import { useProgressStore } from "@/features/progress/store";

export function NoteEditor({ stepId }: { stepId: string }) {
  const savedNote = useProgressStore(useShallow((s) => s.getStep(stepId).note));
  const setNote = useProgressStore((s) => s.setNote);

  const [value, setValue] = useState(savedNote);
  const [saved, setSaved] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setValue(savedNote), [savedNote]);

  const handleChange = (next: string) => {
    setValue(next);
    setSaved(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setNote(stepId, next);
      setSaved(true);
    }, 500);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <NotebookPen className="size-4 text-primary" />
          내 노트
        </p>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          {saved ? (
            <>
              <Check className="size-3.5 text-success" />
              저장됨
            </>
          ) : (
            "저장 중..."
          )}
        </span>
      </div>
      <Textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="이 STEP에서 떠오른 생각이나 우리 사업에 적용할 아이디어를 자유롭게 적어보세요."
        rows={3}
      />
    </div>
  );
}
