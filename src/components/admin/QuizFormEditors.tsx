"use client";

import { Plus } from "lucide-react";
import type {
  InputFieldKind,
  InputFormBlock,
  QuizBlock,
  QuizQuestionData,
  InputFormField,
} from "@/features/lesson-builder/types";
import { createBlockId } from "@/features/lesson-builder/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Field, RepeaterItem, SelectField } from "./inspectorFields";

// 퀴즈·입력폼을 JSON이 아니라 실제 폼으로 편집한다.
// (예전에는 JSON textarea라서, 관리자가 JSON 문법을 알아야만 문항을 추가할 수 있었다)

function move<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return items;
  const next = items.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function QuizEditor({
  block,
  onChange,
}: {
  block: QuizBlock;
  onChange: (next: QuizBlock) => void;
}) {
  const questions = block.data.questions;
  const setQuestions = (next: QuizQuestionData[]) =>
    onChange({ ...block, data: { ...block.data, questions: next } });

  const updateQuestion = (index: number, patch: Partial<QuizQuestionData>) =>
    setQuestions(questions.map((q, i) => (i === index ? { ...q, ...patch } : q)));

  const addQuestion = () =>
    setQuestions([
      ...questions,
      {
        id: createBlockId(),
        question: "새 문항",
        choices: [
          { id: `c-${Date.now()}-1`, text: "보기 1" },
          { id: `c-${Date.now()}-2`, text: "보기 2" },
        ],
        correctChoiceId: `c-${Date.now()}-1`,
      },
    ]);

  return (
    <div className="space-y-2">
      {questions.map((q, qi) => (
        <RepeaterItem
          key={q.id}
          title={`문항 ${qi + 1}`}
          onRemove={() => setQuestions(questions.filter((_, i) => i !== qi))}
          onMoveUp={qi > 0 ? () => setQuestions(move(questions, qi, qi - 1)) : undefined}
          onMoveDown={
            qi < questions.length - 1 ? () => setQuestions(move(questions, qi, qi + 1)) : undefined
          }
        >
          <Field
            label="질문"
            value={q.question}
            onChange={(question) => updateQuestion(qi, { question })}
          />

          <div>
            <Label>보기 (정답을 클릭해서 선택)</Label>
            <div className="mt-1.5 space-y-1.5">
              {q.choices.map((choice, ci) => (
                <div key={choice.id} className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateQuestion(qi, { correctChoiceId: choice.id })}
                    title="정답으로 지정"
                    className={
                      q.correctChoiceId === choice.id
                        ? "flex size-5 shrink-0 items-center justify-center rounded-full bg-success text-[10px] font-bold text-white"
                        : "flex size-5 shrink-0 items-center justify-center rounded-full border border-border text-[10px] text-muted-foreground"
                    }
                  >
                    {q.correctChoiceId === choice.id ? "✓" : ci + 1}
                  </button>
                  <input
                    value={choice.text}
                    onChange={(e) =>
                      updateQuestion(qi, {
                        choices: q.choices.map((c) =>
                          c.id === choice.id ? { ...c, text: e.target.value } : c
                        ),
                      })
                    }
                    className="h-8 flex-1 rounded-lg border border-border bg-background px-2 text-sm"
                  />
                  {q.choices.length > 2 && (
                    <button
                      onClick={() =>
                        updateQuestion(qi, { choices: q.choices.filter((c) => c.id !== choice.id) })
                      }
                      className="text-[11px] text-muted-foreground hover:text-danger"
                    >
                      삭제
                    </button>
                  )}
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-1.5 h-7 gap-1 text-xs"
              onClick={() =>
                updateQuestion(qi, {
                  choices: [
                    ...q.choices,
                    { id: `c-${Date.now()}-${q.choices.length + 1}`, text: `보기 ${q.choices.length + 1}` },
                  ],
                })
              }
            >
              <Plus className="size-3" />
              보기 추가
            </Button>
          </div>

          <Field
            label="해설 (선택)"
            value={q.explanation ?? ""}
            onChange={(explanation) => updateQuestion(qi, { explanation: explanation || undefined })}
          />
        </RepeaterItem>
      ))}

      <Button variant="outline" size="sm" onClick={addQuestion} className="w-full gap-1.5">
        <Plus className="size-3.5" />
        문항 추가
      </Button>
    </div>
  );
}

const FIELD_KIND_OPTIONS = [
  { value: "short-text" as const, label: "한 줄 입력" },
  { value: "long-text" as const, label: "여러 줄 입력" },
  { value: "number" as const, label: "숫자" },
  { value: "select" as const, label: "선택 목록" },
  { value: "checkbox" as const, label: "체크박스" },
];

export function InputFormEditor({
  block,
  onChange,
}: {
  block: InputFormBlock;
  onChange: (next: InputFormBlock) => void;
}) {
  const fields = block.data.fields;
  const setFields = (next: InputFormField[]) =>
    onChange({ ...block, data: { ...block.data, fields: next } });

  const updateField = (index: number, patch: Partial<InputFormField>) =>
    setFields(fields.map((f, i) => (i === index ? { ...f, ...patch } : f)));

  return (
    <div className="space-y-2">
      {fields.map((field, fi) => (
        <RepeaterItem
          key={field.id}
          title={`항목 ${fi + 1}`}
          onRemove={() => setFields(fields.filter((_, i) => i !== fi))}
          onMoveUp={fi > 0 ? () => setFields(move(fields, fi, fi - 1)) : undefined}
          onMoveDown={fi < fields.length - 1 ? () => setFields(move(fields, fi, fi + 1)) : undefined}
        >
          <Field label="라벨" value={field.label} onChange={(label) => updateField(fi, { label })} />
          <SelectField
            label="입력 방식"
            value={field.kind}
            options={FIELD_KIND_OPTIONS}
            onChange={(kind: InputFieldKind) => updateField(fi, { kind })}
          />
          {field.kind === "select" && (
            <Field
              label="선택지 (한 줄에 하나)"
              multiline
              rows={3}
              value={(field.options ?? []).join("\n")}
              onChange={(text) =>
                updateField(fi, { options: text.split("\n").filter((o) => o.trim()) })
              }
            />
          )}
          {field.kind !== "checkbox" && (
            <Field
              label="안내 문구 (선택)"
              value={field.placeholder ?? ""}
              onChange={(placeholder) => updateField(fi, { placeholder: placeholder || undefined })}
            />
          )}
          <label className="flex items-center gap-2 text-xs">
            <Checkbox
              checked={field.required}
              onCheckedChange={(v) => updateField(fi, { required: Boolean(v) })}
            />
            필수 입력
          </label>
        </RepeaterItem>
      ))}

      <Button
        variant="outline"
        size="sm"
        className="w-full gap-1.5"
        onClick={() =>
          setFields([
            ...fields,
            { id: createBlockId(), label: "새 항목", kind: "short-text", required: false },
          ])
        }
      >
        <Plus className="size-3.5" />
        입력 항목 추가
      </Button>
    </div>
  );
}
