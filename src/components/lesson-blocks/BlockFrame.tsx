"use client";

import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import type { BlockLayout, BlockTheme } from "@/features/lesson-builder/types";
import { cn } from "@/lib/utils";

// 모든 블록이 공유하는 껍데기. 제목/설명/여백/정렬/배경/오류 상태를 여기서만 처리해서
// 개별 블록 렌더러는 자기 콘텐츠에만 집중한다.

const WIDTH_CLASS: Record<BlockLayout["width"], string> = {
  narrow: "max-w-xl",
  normal: "max-w-3xl",
  wide: "max-w-5xl",
  full: "max-w-none",
};

const SPACING_CLASS: Record<BlockLayout["spacing"], string> = {
  none: "py-0",
  small: "py-2",
  medium: "py-4",
  large: "py-8",
};

const ALIGN_CLASS: Record<BlockLayout["align"], string> = {
  left: "mr-auto text-left",
  center: "mx-auto text-center",
  right: "ml-auto text-right",
};

const BACKGROUND_CLASS: Record<NonNullable<BlockTheme["background"]>, string> = {
  none: "",
  muted: "bg-muted/40 rounded-2xl px-4 sm:px-6",
  card: "bg-card rounded-2xl px-4 sm:px-6 shadow-sm",
  "primary-soft": "bg-primary/5 rounded-2xl px-4 sm:px-6",
  dark: "bg-foreground text-background rounded-2xl px-4 sm:px-6",
};

export function BlockFrame({
  title,
  description,
  layout,
  theme,
  children,
}: {
  title?: string;
  description?: string;
  layout: BlockLayout;
  theme: BlockTheme;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "w-full",
        WIDTH_CLASS[layout.width],
        ALIGN_CLASS[layout.align],
        SPACING_CLASS[layout.spacing],
        theme.background && BACKGROUND_CLASS[theme.background],
        theme.bordered && "rounded-2xl border border-border px-4 sm:px-6",
        layout.hideOnMobile && "hidden sm:block"
      )}
    >
      {(title || description) && (
        <header className="mb-3">
          {title && <h3 className="text-lg font-bold text-foreground">{title}</h3>}
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

/** 블록 하나가 깨져도 페이지 전체가 죽지 않도록 대신 그려주는 자리표시자. */
export function BlockFallback({
  blockType,
  reason,
}: {
  blockType?: string;
  reason: string;
}) {
  return (
    <section className="mx-auto w-full max-w-3xl py-4">
      <div className="flex items-start gap-3 rounded-2xl border border-dashed border-warning/40 bg-warning/5 p-4">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning-foreground" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            표시할 수 없는 블록{blockType ? ` (${blockType})` : ""}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{reason}</p>
        </div>
      </div>
    </section>
  );
}
