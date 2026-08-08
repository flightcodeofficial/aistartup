"use client";

import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// 인스펙터에서 반복 사용하는 작은 입력 조각들.
// 관리자가 JSON을 직접 편집하지 않아도 되도록, 모든 설정은 이 폼 요소로 노출한다.

export function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  rows = 4,
  hint,
  mono,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  hint?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {multiline ? (
        <Textarea
          value={value}
          rows={rows}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={mono ? "mt-1.5 font-mono text-xs" : "mt-1.5"}
        />
      ) : (
        <Input
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1.5"
        />
      )}
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value?: number;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        type="number"
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        className="mt-1.5"
      />
    </div>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  hint,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  hint?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** 반복 항목(퀴즈 문항, 폼 필드 등)을 감싸는 카드. */
export function RepeaterItem({
  title,
  onRemove,
  onMoveUp,
  onMoveDown,
  children,
}: {
  title: string;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-2.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold text-muted-foreground">{title}</p>
        <div className="flex gap-1">
          {onMoveUp && (
            <button onClick={onMoveUp} className="text-[11px] text-muted-foreground hover:text-foreground">
              ↑
            </button>
          )}
          {onMoveDown && (
            <button onClick={onMoveDown} className="text-[11px] text-muted-foreground hover:text-foreground">
              ↓
            </button>
          )}
          <button onClick={onRemove} className="text-[11px] text-muted-foreground hover:text-danger">
            삭제
          </button>
        </div>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export const MEDIA_DISPLAY_OPTIONS = [
  { value: "half" as const, label: "절반 폭" },
  { value: "large" as const, label: "크게" },
  { value: "hero" as const, label: "히어로(전체 폭)" },
  { value: "fullscreen" as const, label: "화면 가득" },
];

export const MEDIA_FIT_OPTIONS = [
  { value: "contain" as const, label: "전체 보이기 (contain)" },
  { value: "cover" as const, label: "영역 채우기 (cover)" },
];

export const MEDIA_RATIO_OPTIONS = [
  { value: "auto" as const, label: "원본 비율" },
  { value: "16/9" as const, label: "16:9" },
  { value: "4/3" as const, label: "4:3" },
  { value: "3/2" as const, label: "3:2" },
  { value: "1/1" as const, label: "정사각형" },
  { value: "21/9" as const, label: "21:9 와이드" },
];
