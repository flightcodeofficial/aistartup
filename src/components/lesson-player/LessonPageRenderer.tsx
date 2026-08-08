"use client";

import type { LessonPage } from "@/features/lesson-builder/types";
import { BlockRenderer } from "@/components/lesson-blocks/BlockRenderer";
import { cn } from "@/lib/utils";

// 페이지 레이아웃은 "블록들을 담는 그릇"만 결정한다.
// 블록 자체의 폭/정렬/여백은 각 블록의 layout이 담당한다(BlockFrame).

const LAYOUT_CLASS: Record<LessonPage["layout"], string> = {
  standard: "mx-auto w-full max-w-3xl px-4 py-6 sm:px-8",
  wide: "mx-auto w-full max-w-5xl px-4 py-6 sm:px-8",
  fullscreen: "w-full px-0 py-0",
  practice: "mx-auto w-full max-w-4xl px-4 py-6 sm:px-8",
};

export function LessonPageRenderer({
  page,
  isInstructorView = false,
}: {
  page: LessonPage;
  isInstructorView?: boolean;
}) {
  const visibleBlocks = page.blocks.filter(
    (b) => b.visibility !== "hidden" && (b.visibility !== "instructor-only" || isInstructorView)
  );

  return (
    <div className={cn(LAYOUT_CLASS[page.layout])}>
      {page.layout !== "fullscreen" && (page.title || page.description) && (
        <header className="mb-4">
          {page.title && (
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">{page.title}</h2>
          )}
          {page.description && (
            <p className="mt-1 text-sm text-muted-foreground">{page.description}</p>
          )}
        </header>
      )}

      {visibleBlocks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">이 페이지에는 아직 블록이 없습니다.</p>
        </div>
      ) : (
        <div className={cn("flex flex-col", page.layout === "practice" ? "gap-2" : "gap-1")}>
          {visibleBlocks.map((block) => (
            <BlockRenderer key={block.id} block={block} isInstructorView={isInstructorView} />
          ))}
        </div>
      )}
    </div>
  );
}
