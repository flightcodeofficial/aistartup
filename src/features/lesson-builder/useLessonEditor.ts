"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { lessonRepository } from "./index";
import { parseLessonContent } from "./schema/lessonSchema";
import {
  createBlockId,
  createEmptyBlock,
  createEmptyPage,
  createPageId,
} from "./types";
import type { BlockType, LessonBlock, LessonContent, LessonPage } from "./types";

// 편집기 상태 전체를 여기서 관리한다. 화면(3단 레이아웃)은 이 훅이 주는 값과
// 액션만 쓰고, 저장 매체나 스키마 검증은 신경쓰지 않는다.

function move<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return items;
  const next = items.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function useLessonEditor(lessonId: string) {
  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    lessonRepository.getLesson(lessonId).then((found) => {
      if (cancelled) return;
      setLesson(found ?? null);
      setSelectedPageId(found?.pages[0]?.id ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  const selectedPage = useMemo(
    () => lesson?.pages.find((p) => p.id === selectedPageId) ?? null,
    [lesson, selectedPageId]
  );

  const selectedBlock = useMemo(
    () => selectedPage?.blocks.find((b) => b.id === selectedBlockId) ?? null,
    [selectedPage, selectedBlockId]
  );

  const mutate = useCallback((fn: (draft: LessonContent) => LessonContent) => {
    setLesson((prev) => (prev ? fn(prev) : prev));
    setDirty(true);
  }, []);

  const updateLessonMeta = useCallback(
    (patch: Partial<Pick<LessonContent, "title" | "description" | "durationMinutes">>) => {
      mutate((draft) => ({ ...draft, ...patch }));
    },
    [mutate]
  );

  // ---------- 페이지 ----------

  const addPage = useCallback(() => {
    const page = createEmptyPage();
    mutate((draft) => ({ ...draft, pages: [...draft.pages, page] }));
    setSelectedPageId(page.id);
    setSelectedBlockId(null);
  }, [mutate]);

  const duplicatePage = useCallback(
    (pageId: string) => {
      mutate((draft) => {
        const index = draft.pages.findIndex((p) => p.id === pageId);
        if (index === -1) return draft;
        const source = draft.pages[index];
        const copy: LessonPage = {
          ...source,
          id: createPageId(),
          title: `${source.title} (복사)`,
          blocks: source.blocks.map((b) => ({ ...b, id: createBlockId() })),
        };
        const pages = draft.pages.slice();
        pages.splice(index + 1, 0, copy);
        return { ...draft, pages };
      });
    },
    [mutate]
  );

  const deletePage = useCallback(
    (pageId: string) => {
      mutate((draft) => ({ ...draft, pages: draft.pages.filter((p) => p.id !== pageId) }));
      setSelectedPageId((prev) => (prev === pageId ? null : prev));
    },
    [mutate]
  );

  const movePage = useCallback(
    (pageId: string, offset: number) => {
      mutate((draft) => {
        const index = draft.pages.findIndex((p) => p.id === pageId);
        if (index === -1) return draft;
        return { ...draft, pages: move(draft.pages, index, index + offset) };
      });
    },
    [mutate]
  );

  /** 드래그로 페이지 순서를 바꿀 때 사용(from index → to index). */
  const reorderPages = useCallback(
    (from: number, to: number) => {
      mutate((draft) => ({ ...draft, pages: move(draft.pages, from, to) }));
    },
    [mutate]
  );

  const updatePage = useCallback(
    (pageId: string, patch: Partial<Omit<LessonPage, "id" | "blocks">>) => {
      mutate((draft) => ({
        ...draft,
        pages: draft.pages.map((p) => (p.id === pageId ? { ...p, ...patch } : p)),
      }));
    },
    [mutate]
  );

  // ---------- 블록 ----------

  const addBlock = useCallback(
    (type: BlockType) => {
      if (!selectedPageId) return;
      const block = createEmptyBlock(type);
      mutate((draft) => ({
        ...draft,
        pages: draft.pages.map((p) =>
          p.id === selectedPageId ? { ...p, blocks: [...p.blocks, block] } : p
        ),
      }));
      setSelectedBlockId(block.id);
    },
    [mutate, selectedPageId]
  );

  const updateBlock = useCallback(
    (blockId: string, updater: (block: LessonBlock) => LessonBlock) => {
      if (!selectedPageId) return;
      mutate((draft) => ({
        ...draft,
        pages: draft.pages.map((p) =>
          p.id === selectedPageId
            ? { ...p, blocks: p.blocks.map((b) => (b.id === blockId ? updater(b) : b)) }
            : p
        ),
      }));
    },
    [mutate, selectedPageId]
  );

  const duplicateBlock = useCallback(
    (blockId: string) => {
      if (!selectedPageId) return;
      mutate((draft) => ({
        ...draft,
        pages: draft.pages.map((p) => {
          if (p.id !== selectedPageId) return p;
          const index = p.blocks.findIndex((b) => b.id === blockId);
          if (index === -1) return p;
          const blocks = p.blocks.slice();
          blocks.splice(index + 1, 0, { ...p.blocks[index], id: createBlockId() });
          return { ...p, blocks };
        }),
      }));
    },
    [mutate, selectedPageId]
  );

  const deleteBlock = useCallback(
    (blockId: string) => {
      if (!selectedPageId) return;
      mutate((draft) => ({
        ...draft,
        pages: draft.pages.map((p) =>
          p.id === selectedPageId ? { ...p, blocks: p.blocks.filter((b) => b.id !== blockId) } : p
        ),
      }));
      setSelectedBlockId((prev) => (prev === blockId ? null : prev));
    },
    [mutate, selectedPageId]
  );

  const moveBlock = useCallback(
    (blockId: string, offset: number) => {
      if (!selectedPageId) return;
      mutate((draft) => ({
        ...draft,
        pages: draft.pages.map((p) => {
          if (p.id !== selectedPageId) return p;
          const index = p.blocks.findIndex((b) => b.id === blockId);
          if (index === -1) return p;
          return { ...p, blocks: move(p.blocks, index, index + offset) };
        }),
      }));
    },
    [mutate, selectedPageId]
  );

  /** 드래그로 순서를 바꿀 때 사용(from index → to index). */
  const reorderBlocks = useCallback(
    (from: number, to: number) => {
      if (!selectedPageId) return;
      mutate((draft) => ({
        ...draft,
        pages: draft.pages.map((p) =>
          p.id === selectedPageId ? { ...p, blocks: move(p.blocks, from, to) } : p
        ),
      }));
    },
    [mutate, selectedPageId]
  );

  // ---------- 저장 / 게시 / JSON ----------

  const save = useCallback(async () => {
    if (!lesson) return;
    setSaving(true);
    try {
      const saved = await lessonRepository.saveLesson(lesson);
      setLesson(saved);
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }, [lesson]);

  const publish = useCallback(async () => {
    if (!lesson) return;
    setSaving(true);
    try {
      await lessonRepository.saveLesson(lesson);
      const published = await lessonRepository.publishLesson(lesson.id);
      if (published) setLesson(published);
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }, [lesson]);

  const exportJson = useCallback((): string => {
    return lesson ? JSON.stringify(lesson, null, 2) : "";
  }, [lesson]);

  const importJson = useCallback(
    (json: string): { ok: boolean; message: string } => {
      let raw: unknown;
      try {
        raw = JSON.parse(json);
      } catch {
        return { ok: false, message: "JSON 형식이 아닙니다." };
      }
      const parsed = parseLessonContent(raw);
      if (!parsed.lesson) {
        return { ok: false, message: parsed.fatalError ?? "Lesson 구조를 인식할 수 없습니다." };
      }
      // id는 현재 편집 중인 Lesson을 유지해서, 가져오기가 기존 문서를 덮어쓰게 한다.
      setLesson((prev) => (prev ? { ...parsed.lesson!, id: prev.id } : parsed.lesson));
      setSelectedPageId(parsed.lesson.pages[0]?.id ?? null);
      setSelectedBlockId(null);
      setDirty(true);
      const skipped = parsed.issues.length;
      return {
        ok: true,
        message: skipped > 0 ? `가져왔습니다. 잘못된 블록 ${skipped}개는 제외했습니다.` : "가져왔습니다.",
      };
    },
    []
  );

  /** 편집 중인 문서를 그대로 적용(기존 HTML 가져오기 등 외부에서 만든 LessonContent 반영용). */
  const replaceLesson = useCallback((next: LessonContent) => {
    setLesson((prev) => (prev ? { ...next, id: prev.id } : next));
    setSelectedPageId(next.pages[0]?.id ?? null);
    setSelectedBlockId(null);
    setDirty(true);
  }, []);

  return {
    lesson,
    loading,
    dirty,
    saving,
    selectedPage,
    selectedPageId,
    selectedBlock,
    selectedBlockId,
    setSelectedPageId,
    setSelectedBlockId,
    updateLessonMeta,
    addPage,
    duplicatePage,
    deletePage,
    movePage,
    reorderPages,
    updatePage,
    addBlock,
    updateBlock,
    duplicateBlock,
    deleteBlock,
    moveBlock,
    reorderBlocks,
    save,
    publish,
    exportJson,
    importJson,
    replaceLesson,
  };
}
