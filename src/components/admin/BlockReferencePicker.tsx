"use client";

import { AlertTriangle } from "lucide-react";
import type { BlockType, LessonContent } from "@/features/lesson-builder/types";
import { findCatalogEntry } from "@/features/lesson-builder/blockCatalog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// 블록끼리 연결할 때 쓰는 공용 선택기.
// 관리자가 block id를 눈으로 보거나 손으로 입력할 일이 없어야 한다 —
// 화면에는 "블록 제목 · 종류 · 페이지"만 보이고, 내부적으로만 id를 저장한다.

export interface ReferenceableBlock {
  id: string;
  label: string;
  blockType: BlockType;
  pageTitle: string;
}

/** Lesson 전체를 훑어 연결 가능한 블록을 모은다. */
export function collectReferenceableBlocks(
  lesson: LessonContent | null,
  allowedTypes: BlockType[],
  excludeBlockId?: string
): ReferenceableBlock[] {
  if (!lesson) return [];
  const result: ReferenceableBlock[] = [];
  lesson.pages.forEach((page) => {
    page.blocks.forEach((block) => {
      if (block.id === excludeBlockId) return;
      if (!allowedTypes.includes(block.type)) return;
      const entry = findCatalogEntry(block.type);
      result.push({
        id: block.id,
        label: block.title?.trim() || entry?.label || block.type,
        blockType: block.type,
        pageTitle: page.title,
      });
    });
  });
  return result;
}

export function BlockReferencePicker({
  label,
  value,
  options,
  onChange,
  hint,
  emptyMessage = "연결할 수 있는 블록이 없습니다. 먼저 입력 폼 블록을 만들어주세요.",
}: {
  label: string;
  value?: string;
  options: ReferenceableBlock[];
  onChange: (blockId: string | undefined) => void;
  hint?: string;
  emptyMessage?: string;
}) {
  // 연결해둔 블록이 지워졌는지 확인한다(삭제돼도 앱이 죽으면 안 된다).
  const selected = value ? options.find((o) => o.id === value) : undefined;
  const isDangling = Boolean(value) && !selected;

  return (
    <div>
      <Label>{label}</Label>

      {options.length === 0 ? (
        <p className="mt-1.5 rounded-lg bg-muted/40 p-2 text-[11px] text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <select
          value={isDangling ? "__dangling__" : (value ?? "")}
          onChange={(e) => onChange(e.target.value || undefined)}
          className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">직접 선택 안 함 (학생이 직접 작성)</option>
          {isDangling && (
            <option value="__dangling__" disabled>
              (삭제된 블록)
            </option>
          )}
          {options.map((o) => {
            const entry = findCatalogEntry(o.blockType);
            return (
              <option key={o.id} value={o.id}>
                {o.label} · {entry?.label ?? o.blockType} · {o.pageTitle}
              </option>
            );
          })}
        </select>
      )}

      {isDangling && (
        <div className="mt-1.5 rounded-lg border border-warning/40 bg-warning/10 p-2">
          <p className="flex items-start gap-1.5 text-[11px] text-warning-foreground">
            <AlertTriangle className="mt-0.5 size-3 shrink-0" />
            연결된 입력 블록을 찾을 수 없습니다. 삭제되었거나 다른 Lesson으로 옮겨졌습니다.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange(undefined)}
            className="mt-1.5 h-6 px-2 text-[11px]"
          >
            연결 해제하고 다시 선택
          </Button>
        </div>
      )}

      {hint && !isDangling && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
