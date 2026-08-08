"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import type {
  InputFormBlock,
  QuizBlock,
  ReflectionBlock,
} from "@/features/lesson-builder/types";
import {
  registerFormFieldLabels,
  selectFormValues,
  selectQuizAnswers,
  useBlockResponseStore,
} from "@/features/lesson-builder/blockResponseStore";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArtifactSelector } from "./ArtifactSelector";
import { cn } from "@/lib/utils";

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
                      answered && isThisCorrect && "border-success/40 bg-success/10 text-success",
                      answered &&
                        isThisSelected &&
                        !isThisCorrect &&
                        "border-danger/40 bg-danger/10 text-danger",
                      answered &&
                        !isThisSelected &&
                        !isThisCorrect &&
                        "border-border text-muted-foreground/70"
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
                  isCorrect ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
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
            <Label htmlFor={inputId}>
              {field.label}
              {field.required && <span className="ml-1 text-danger">*</span>}
            </Label>
            {field.kind === "long-text" ? (
              <Textarea
                id={inputId}
                rows={4}
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
