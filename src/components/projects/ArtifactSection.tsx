"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ARTIFACT_LABELS, type ProjectArtifacts } from "@/features/projects/types";

export function ArtifactSection({
  field,
  value,
  editable,
  onChange,
}: {
  field: keyof ProjectArtifacts;
  value: string;
  editable: boolean;
  onChange?: (value: string) => void;
}) {
  const [localValue, setLocalValue] = useState(value);
  const [saved, setSaved] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setLocalValue(value), [value]);

  const handleChange = (next: string) => {
    setLocalValue(next);
    setSaved(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      onChange?.(next);
      setSaved(true);
    }, 600);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-bold text-foreground">{ARTIFACT_LABELS[field]}</p>
        {editable && (
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
        )}
      </div>
      {editable ? (
        <Textarea
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={`${ARTIFACT_LABELS[field]} 내용을 작성해보세요.`}
          rows={4}
        />
      ) : (
        <p className="text-sm whitespace-pre-line text-foreground/90">
          {value || "아직 작성되지 않았습니다."}
        </p>
      )}
    </div>
  );
}
