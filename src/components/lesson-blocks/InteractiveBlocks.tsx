"use client";

import { useLayoutEffect, useRef } from "react";
import { toast } from "sonner";
import { CheckCircle2, Download, XCircle } from "lucide-react";
import type {
  ImportFromSource,
  InputFormBlock,
  QuizBlock,
  ReflectionBlock,
} from "@/features/lesson-builder/types";
import {
  getFormFieldLabels,
  registerFormFieldLabels,
  selectFormValues,
  selectQuizAnswers,
  useBlockResponseStore,
} from "@/features/lesson-builder/blockResponseStore";
import { workspaceRepository } from "@/features/workspace";
import { useActiveProjectStore } from "@/features/workspace/activeProjectStore";
import { isArtifactType } from "@/features/workspace/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArtifactSelector } from "./ArtifactSelector";
import { cn } from "@/lib/utils";

/**
 * "한국어 뜻 (English)" 라벨에서 괄호 안 영어 용어만 뽑아 비교 키로 쓴다.
 * 콘텐츠가 리팩토링되며 라벨이 "Primary Target" → "1순위 타겟 (Primary Target)"처럼
 * 바뀌어도, 예전에 저장된 아티팩트의 필드 키(예전 라벨 그대로)를 계속 찾을 수 있게 한다.
 */
function normalizeLabel(label: string): string {
  const match = label.match(/\(([^)]+)\)\s*$/);
  return (match ? match[1] : label).trim().toLowerCase();
}

/** 아티팩트에서 sourceLabel(또는 그 라벨의 예전 버전)에 해당하는 값을 찾는다. */
function resolveArtifactValue(
  artifact: { content: string; fields?: Record<string, string> },
  sourceLabel?: string
): string | undefined {
  if (!sourceLabel) return artifact.content || undefined;
  const exact = artifact.fields?.[sourceLabel];
  if (exact) return exact;
  if (!artifact.fields) return undefined;
  const target = normalizeLabel(sourceLabel);
  const fallbackKey = Object.keys(artifact.fields).find((key) => normalizeLabel(key) === target);
  return fallbackKey ? artifact.fields[fallbackKey] : undefined;
}

/** 필드 라벨 옆의 "가져오기" 버튼들. 같은 Lesson의 다른 페이지, 또는 이전 차시 저장물에서 값을 끌어온다. */
function ImportButtons({
  blockId,
  fieldId,
  sources,
}: {
  blockId: string;
  fieldId: string;
  sources: ImportFromSource[];
}) {
  const activeProjectId = useActiveProjectStore((s) => s.activeProjectId);

  const handleImport = async (source: ImportFromSource) => {
    let pulled = "";

    if (source.kind === "same-lesson" && source.sourceBlockId) {
      const values = useBlockResponseStore.getState().formValues[source.sourceBlockId] ?? {};
      const labels = getFormFieldLabels(source.sourceBlockId);
      const ids = source.sourceFieldIds ?? Object.keys(values);
      pulled = ids
        .map((id) => {
          const v = values[id];
          return v ? `${labels[id] ?? id}: ${v}` : null;
        })
        .filter((line): line is string => Boolean(line))
        .join("\n");
    } else if (source.kind === "prior-artifact" && activeProjectId) {
      const type = source.artifactType && isArtifactType(source.artifactType) ? source.artifactType : undefined;
      if (type) {
        // 최신순으로 정렬되어 온다 — 콘텐츠 리팩토링으로 같은 제목의 저장물이
        // 여러 개 생겨도(예: 저장 블록 ID가 바뀌어 새 빈 저장물이 생긴 경우),
        // 값이 실제로 있는 것 중 가장 최근 것을 찾는다.
        const artifacts = await workspaceRepository.listArtifactsByType(type, activeProjectId);
        const candidates = source.artifactTitle
          ? artifacts.filter((a) => a.title === source.artifactTitle)
          : artifacts.slice(0, 1);
        for (const candidate of candidates) {
          const value = resolveArtifactValue(candidate, source.sourceLabel);
          if (value) {
            pulled = value;
            break;
          }
        }
      }
    }

    if (!pulled) {
      toast.error("가져올 내용이 아직 없습니다", {
        description: "해당 페이지를 먼저 작성했는지 확인하세요.",
      });
      return;
    }

    const current = useBlockResponseStore.getState().formValues[blockId]?.[fieldId] ?? "";
    const next = current ? `${current}\n\n${pulled}` : pulled;
    useBlockResponseStore.getState().setFormValue(blockId, fieldId, next);
    toast.success("가져왔습니다");
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {sources.map((source, i) => (
        <button
          key={i}
          type="button"
          onClick={() => handleImport(source)}
          className="inline-flex min-h-8 items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/10"
        >
          <Download className="size-3" />
          {source.label}
        </button>
      ))}
    </div>
  );
}

export function QuizBlockRenderer({ block }: { block: QuizBlock }) {
  const answers = useBlockResponseStore(selectQuizAnswers(block.id));
  const setQuizAnswer = useBlockResponseStore((s) => s.setQuizAnswer);

  return (
    <div className="space-y-4">
      {block.data.questions.map((q, qi) => {
        const selected = answers[q.id];
        const answered = selected !== undefined;
        const isCorrect = selected === q.correctChoiceId;

        return (
          <div key={q.id} className="rounded-2xl border border-border bg-card p-4">
            <p className="text-sm font-medium text-foreground">
              {qi + 1}. {q.question}
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {q.choices.map((choice) => {
                const isThisSelected = selected === choice.id;
                const isThisCorrect = choice.id === q.correctChoiceId;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    disabled={answered}
                    onClick={() => setQuizAnswer(block.id, q.id, choice.id)}
                    className={cn(
                      // 모바일에서 손가락으로 고르는 버튼이라 최소 44px를 준다
                      "flex min-h-11 items-center rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                      !answered && "border-border hover:border-primary/40 hover:bg-primary/5",
                      answered &&
                        isThisCorrect &&
                        "border-success/40 bg-success/10 text-success-strong",
                      answered &&
                        isThisSelected &&
                        !isThisCorrect &&
                        "border-danger/40 bg-danger/10 text-danger",
                      // 고르지 않은 보기도 답을 확인한 뒤 다시 읽는다.
                      // /70까지 흐리면 흰 배경에서 2.7:1이라 잘 안 읽힌다.
                      answered &&
                        !isThisSelected &&
                        !isThisCorrect &&
                        "border-border text-muted-foreground"
                    )}
                  >
                    {choice.text}
                  </button>
                );
              })}
            </div>
            {answered && (
              <div
                className={cn(
                  "mt-3 flex items-start gap-2 rounded-lg p-3 text-sm",
                  isCorrect ? "bg-success/10 text-success-strong" : "bg-danger/10 text-danger"
                )}
              >
                {isCorrect ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                ) : (
                  <XCircle className="mt-0.5 size-4 shrink-0" />
                )}
                <span>{q.explanation ?? (isCorrect ? "정답입니다." : "다시 확인해보세요.")}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** 붙여넣은 긴 텍스트가 잘리지 않도록 내용에 맞춰 늘어나는 textarea. 최대 높이 이후엔 스크롤. */
function AutoGrowTextarea({
  id,
  value,
  placeholder,
  onChange,
  className,
}: {
  id: string;
  value: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 480)}px`;
  }, [value]);

  return (
    <Textarea
      ref={ref}
      id={id}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      className={cn(className, "overflow-y-auto")}
      style={{ minHeight: "6rem", maxHeight: "30rem" }}
    />
  );
}

/** 버튼을 누르면 필드 전체가 아니라 블록 전체(또는 아티팩트 전체) 내용이 통째로 들어오는지 — 그런 경우 "필요한 부분만 남기고 지우라"는 안내가 필요하다. */
function hasWholeBlockImport(field: InputFormBlock["data"]["fields"][number]): boolean {
  return (field.importFrom ?? []).some(
    (src) =>
      (src.kind === "same-lesson" && !src.sourceFieldIds) ||
      (src.kind === "prior-artifact" && !src.sourceLabel)
  );
}

export function InputFormBlockRenderer({ block }: { block: InputFormBlock }) {
  const values = useBlockResponseStore(selectFormValues(block.id));
  const setFormValue = useBlockResponseStore((s) => s.setFormValue);

  // 결과물로 저장될 때 내부 fieldId 대신 강사가 붙인 항목 이름이 쓰이도록 알려둔다.
  registerFormFieldLabels(
    block.id,
    Object.fromEntries(block.data.fields.map((f) => [f.id, f.label]))
  );

  // 이전 Lesson 결과를 첫 번째 긴 입력칸(없으면 첫 칸)에 채워 넣는다.
  const applyArtifact = (content: string) => {
    const target =
      block.data.fields.find((f) => f.kind === "long-text") ?? block.data.fields[0];
    if (target) setFormValue(block.id, target.id, content);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
      {block.data.inputArtifactTypes && block.data.inputArtifactTypes.length > 0 && (
        <ArtifactSelector
          inputArtifactTypes={block.data.inputArtifactTypes}
          onPick={(a) => applyArtifact(a.content)}
        />
      )}
      {block.data.fields.map((field) => {
        const value = values[field.id] ?? "";
        const inputId = `${block.id}-${field.id}`;
        return (
          <div key={field.id}>
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
              <Label htmlFor={inputId}>
                {field.label}
                {field.required && <span className="ml-1 text-danger">*</span>}
              </Label>
              {field.importFrom && field.importFrom.length > 0 && (
                <ImportButtons blockId={block.id} fieldId={field.id} sources={field.importFrom} />
              )}
            </div>
            {hasWholeBlockImport(field) && (
              <p className="mt-1 text-xs text-muted-foreground">
                버튼을 누르면 전체 내용이 들어옵니다 — 이 항목에 필요한 부분만 남기고 나머지는 지우세요.
              </p>
            )}
            {field.kind === "long-text" ? (
              <AutoGrowTextarea
                id={inputId}
                value={value}
                placeholder={field.placeholder}
                onChange={(e) => setFormValue(block.id, field.id, e.target.value)}
                className="mt-1.5"
              />
            ) : field.kind === "select" ? (
              <select
                id={inputId}
                value={value}
                onChange={(e) => setFormValue(block.id, field.id, e.target.value)}
                className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm sm:h-10"
              >
                <option value="">선택하세요</option>
                {(field.options ?? []).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : field.kind === "checkbox" ? (
              <label className="mt-1.5 flex items-center gap-2 text-sm">
                <Checkbox
                  checked={value === "true"}
                  onCheckedChange={(v) => setFormValue(block.id, field.id, v ? "true" : "false")}
                />
                {field.placeholder ?? "예"}
              </label>
            ) : (
              <Input
                id={inputId}
                type={field.kind === "number" ? "number" : "text"}
                value={value}
                placeholder={field.placeholder}
                onChange={(e) => setFormValue(block.id, field.id, e.target.value)}
                className="mt-1.5"
              />
            )}
          </div>
        );
      })}
      <p className="text-xs text-muted-foreground">입력 내용은 이 브라우저에 자동 저장됩니다.</p>
    </div>
  );
}

export function ReflectionBlockRenderer({ block }: { block: ReflectionBlock }) {
  const value = useBlockResponseStore((s) => s.reflections[block.id] ?? "");
  const setReflection = useBlockResponseStore((s) => s.setReflection);

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
      <ul className="mb-3 space-y-1">
        {block.data.questions.map((q, i) => (
          <li key={i} className="text-sm font-medium text-foreground">
            · {q}
          </li>
        ))}
      </ul>
      <Textarea
        rows={4}
        value={value}
        placeholder={block.data.placeholder ?? "떠오른 생각을 자유롭게 적어보세요."}
        onChange={(e) => setReflection(block.id, e.target.value)}
      />
    </div>
  );
}
