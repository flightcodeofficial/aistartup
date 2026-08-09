"use client";

import { use, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Download,
  Eye,
  FileJson,
  FileStack,
  GripVertical,
  Loader2,
  Monitor,
  Plus,
  Save,
  Send,
  Smartphone,
  Tablet,
  Trash2,
  Upload,
} from "lucide-react";
import { useLessonEditor } from "@/features/lesson-builder/useLessonEditor";
import { BLOCK_TYPE_LABELS } from "@/features/lesson-builder/types";
import type { PageLayout } from "@/features/lesson-builder/types";
import { buildLessonFromHtmlManifest } from "@/features/lesson-builder/importer/fromHtmlManifest";
import { BlockInspector } from "@/components/admin/BlockInspector";
import { BlockPicker } from "@/components/admin/BlockPicker";
import { BlockRenderer } from "@/components/lesson-blocks/BlockRenderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const PREVIEW_WIDTHS = { desktop: "100%", tablet: "768px", mobile: "390px" } as const;
type PreviewMode = keyof typeof PREVIEW_WIDTHS;

export default function LessonEditPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = use(params);
  const editor = useLessonEditor(lessonId);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [message, setMessage] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragPageIndex, setDragPageIndex] = useState<number | null>(null);
  const [dragOverPageIndex, setDragOverPageIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (editor.loading) {
    return (
      <div className="space-y-3 p-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!editor.lesson) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">Lesson을 찾을 수 없습니다.</p>
        <Button variant="link" asChild>
          <Link href="/admin/courses">Lesson 목록으로</Link>
        </Button>
      </div>
    );
  }

  const { lesson, selectedPage, selectedBlock } = editor;

  const notify = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 2500);
  };

  const handleExport = () => {
    const blob = new Blob([editor.exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${lesson.title || "lesson"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (file: File) => {
    const result = editor.importJson(await file.text());
    notify(result.message);
  };

  const handleImportExistingHtml = async () => {
    const res = await fetch(
      `/api/lesson-manifest?week=${lesson.week}&day=${lesson.day}&lesson=${lesson.lesson}`
    );
    if (!res.ok) {
      notify("해당 위치에 기존 HTML 콘텐츠가 없습니다.");
      return;
    }
    const data = (await res.json()) as {
      pages: { pageNumber: number; file: string; title: string }[];
    };
    editor.replaceLesson(
      buildLessonFromHtmlManifest({
        courseId: lesson.courseId,
        week: lesson.week,
        day: lesson.day,
        lesson: lesson.lesson,
        lessonTitle: lesson.title,
        pages: data.pages,
      })
    );
    notify(`기존 HTML ${data.pages.length}페이지를 블록으로 가져왔습니다.`);
  };

  const handleDrop = (targetIndex: number) => {
    if (dragIndex !== null && dragIndex !== targetIndex) editor.reorderBlocks(dragIndex, targetIndex);
    setDragIndex(null);
  };

  const handlePageDrop = (targetIndex: number) => {
    if (dragPageIndex !== null && dragPageIndex !== targetIndex) {
      editor.reorderPages(dragPageIndex, targetIndex);
    }
    setDragPageIndex(null);
    setDragOverPageIndex(null);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* 상단바 */}
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-card px-4 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="gap-1.5">
            <Link href="/admin/courses">
              <FileStack className="size-4" />
              목록
            </Link>
          </Button>
          <Input
            value={lesson.title}
            onChange={(e) => editor.updateLessonMeta({ title: e.target.value })}
            className="h-8 w-48 font-semibold"
          />
          <Badge variant="outline">v{lesson.version}</Badge>
          <Badge
            variant="outline"
            className={
              lesson.status === "published"
                ? "border-success/30 bg-success/10 text-success"
                : "border-warning/30 bg-warning/10 text-warning-foreground"
            }
          >
            {lesson.status === "published" ? "게시됨" : "작성 중"}
          </Badge>
          {editor.dirty && <span className="text-xs text-muted-foreground">저장되지 않음</span>}
          {message && <span className="text-xs font-medium text-primary">{message}</span>}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <div className="mr-1 flex items-center gap-0.5 rounded-lg border border-border p-0.5">
            {([
              ["desktop", Monitor],
              ["tablet", Tablet],
              ["mobile", Smartphone],
            ] as const).map(([mode, Icon]) => (
              <button
                key={mode}
                onClick={() => setPreviewMode(mode)}
                className={cn(
                  "rounded p-1.5 transition-colors",
                  previewMode === mode ? "bg-primary/10 text-primary" : "text-muted-foreground"
                )}
                title={mode}
              >
                <Icon className="size-3.5" />
              </button>
            ))}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImportFile(file);
              e.target.value = "";
            }}
          />
          <Button variant="outline" size="sm" onClick={handleImportExistingHtml} className="gap-1.5">
            <Upload className="size-3.5" />
            기존 HTML 가져오기
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-1.5">
            <FileJson className="size-3.5" />
            JSON 가져오기
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
            <Download className="size-3.5" />
            JSON 내보내기
          </Button>
          <Button variant="outline" size="sm" asChild className="gap-1.5">
            <Link href={`/admin/lessons/${lesson.id}/preview`}>
              <Eye className="size-3.5" />
              미리보기
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={editor.save} disabled={editor.saving} className="gap-1.5">
            {editor.saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            저장
          </Button>
          <Button size="sm" onClick={editor.publish} disabled={editor.saving} className="gap-1.5">
            <Send className="size-3.5" />
            게시
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* 왼쪽: 페이지 목록 */}
        <aside className="scrollbar-thin w-56 shrink-0 overflow-y-auto border-r border-border bg-muted/20 p-3">
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            페이지
          </p>
          {/* 아이콘만 있는 버튼은 처음 쓰는 강사가 못 찾는다 — 글자를 함께 보여준다 */}
          <Button size="sm" onClick={editor.addPage} className="mb-2 w-full gap-1.5">
            <Plus className="size-3.5" />
            페이지 추가
          </Button>
          <div className="space-y-1">
            {lesson.pages.map((page, i) => (
              <div
                key={page.id}
                draggable
                onDragStart={() => setDragPageIndex(i)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragPageIndex !== null && dragPageIndex !== i) setDragOverPageIndex(i);
                }}
                onDragLeave={() => setDragOverPageIndex((prev) => (prev === i ? null : prev))}
                onDrop={() => handlePageDrop(i)}
                onDragEnd={() => {
                  setDragPageIndex(null);
                  setDragOverPageIndex(null);
                }}
                className={cn(
                  "rounded-lg border p-2 transition-colors",
                  page.id === editor.selectedPageId
                    ? "border-primary/40 bg-primary/10"
                    : "border-transparent hover:bg-muted",
                  // 드롭될 자리를 선으로 표시하고, 끌고 있는 항목은 흐리게 만든다
                  dragOverPageIndex === i && "border-t-2 border-t-primary",
                  dragPageIndex === i && "opacity-40"
                )}
              >
                <button
                  onClick={() => {
                    editor.setSelectedPageId(page.id);
                    editor.setSelectedBlockId(null);
                  }}
                  className="flex w-full items-start gap-1.5 text-left"
                  title="끌어서 순서를 바꿀 수 있습니다"
                >
                  <GripVertical className="mt-0.5 size-3 shrink-0 cursor-grab text-muted-foreground" />
                  {/* 블록 개수는 저작자에게도 실익이 없고 개발 정보처럼 읽혀서 뺐다. */}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-foreground">
                      {i + 1}. {page.title}
                    </span>
                  </span>
                </button>
                {/* 드래그가 어려운 상황(키보드·보조기기)에서도 순서를 바꿀 수 있게 남겨둔다 */}
                <div className="mt-1 flex gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-5"
                    title="위로 이동"
                    aria-label={`${page.title} 위로 이동`}
                    disabled={i === 0}
                    onClick={() => editor.movePage(page.id, -1)}
                  >
                    <ArrowUp className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-5"
                    title="아래로 이동"
                    aria-label={`${page.title} 아래로 이동`}
                    disabled={i === lesson.pages.length - 1}
                    onClick={() => editor.movePage(page.id, 1)}
                  >
                    <ArrowDown className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-5"
                    title="페이지 복사"
                    aria-label={`${page.title} 복사`}
                    onClick={() => editor.duplicatePage(page.id)}
                  >
                    <Copy className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-5 text-muted-foreground hover:text-danger"
                    title="페이지 삭제"
                    aria-label={`${page.title} 삭제`}
                    onClick={() => editor.deletePage(page.id)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* 가운데: 블록 캔버스 */}
        <main className="scrollbar-thin min-w-0 flex-1 overflow-y-auto bg-muted/10 p-4">
          {!selectedPage ? (
            // 빈 상태에서 다음 행동이 막히지 않도록, 여기서도 바로 페이지를 만들 수 있게 한다
            <div className="mx-auto mt-10 max-w-md rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
              <p className="text-sm font-semibold text-foreground">아직 페이지가 없습니다</p>
              <p className="mt-1 text-xs text-muted-foreground">
                페이지를 만들고 그 안에 글·이미지·실습 블록을 넣어 수업을 구성합니다.
              </p>
              <Button onClick={editor.addPage} className="mt-4 gap-1.5">
                <Plus className="size-4" />첫 페이지 만들기
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Input
                  value={selectedPage.title}
                  onChange={(e) => editor.updatePage(selectedPage.id, { title: e.target.value })}
                  className="h-8 w-56"
                />
                <select
                  value={selectedPage.layout}
                  onChange={(e) =>
                    editor.updatePage(selectedPage.id, { layout: e.target.value as PageLayout })
                  }
                  className="h-8 rounded-lg border border-border bg-background px-2 text-sm"
                >
                  <option value="standard">standard</option>
                  <option value="wide">wide</option>
                  <option value="fullscreen">fullscreen</option>
                  <option value="practice">practice</option>
                </select>
              </div>

              <BlockPicker onAdd={(type) => editor.addBlock(type)} />

              <div
                className="mx-auto transition-all"
                style={{ maxWidth: PREVIEW_WIDTHS[previewMode] }}
              >
                {selectedPage.blocks.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
                    위에서 블록을 추가하세요.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedPage.blocks.map((block, index) => (
                      <div
                        key={block.id}
                        draggable
                        onDragStart={() => setDragIndex(index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(index)}
                        onClick={() => editor.setSelectedBlockId(block.id)}
                        className={cn(
                          "group relative rounded-2xl border bg-card p-2 transition-colors",
                          block.id === editor.selectedBlockId
                            ? "border-primary/50 ring-1 ring-primary/20"
                            : "border-border hover:border-primary/30"
                        )}
                      >
                        <div className="mb-1 flex items-center justify-between gap-2 px-1">
                          <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                            <GripVertical className="size-3 cursor-grab" />
                            {BLOCK_TYPE_LABELS[block.type]}
                          </span>
                          <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-5"
                              title="위로 이동"
                              aria-label="블록 위로 이동"
                              disabled={index === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                editor.moveBlock(block.id, -1);
                              }}
                            >
                              <ArrowUp className="size-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-5"
                              title="아래로 이동"
                              aria-label="블록 아래로 이동"
                              disabled={index === selectedPage.blocks.length - 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                editor.moveBlock(block.id, 1);
                              }}
                            >
                              <ArrowDown className="size-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-5"
                              title="블록 복사"
                              aria-label="블록 복사"
                              onClick={(e) => {
                                e.stopPropagation();
                                editor.duplicateBlock(block.id);
                              }}
                            >
                              <Copy className="size-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-5 text-muted-foreground hover:text-danger"
                              title="블록 삭제"
                              aria-label="블록 삭제"
                              onClick={(e) => {
                                e.stopPropagation();
                                editor.deleteBlock(block.id);
                              }}
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="pointer-events-none">
                          <BlockRenderer block={block} isInstructorView />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>

        {/* 오른쪽: 속성 패널 */}
        <aside className="w-80 shrink-0 border-l border-border bg-card">
          <BlockInspector
            block={selectedBlock}
            lesson={lesson}
            onChange={(next) => editor.updateBlock(next.id, () => next)}
          />
        </aside>
      </div>
    </div>
  );
}
