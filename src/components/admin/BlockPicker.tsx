"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { BLOCK_CATALOG } from "@/features/lesson-builder/blockCatalog";
import type { BlockType } from "@/features/lesson-builder/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** 카테고리별로 묶고, 아이콘 + 한국어 이름 + 설명을 함께 보여주는 블록 추가 패널. */
export function BlockPicker({ onAdd }: { onAdd: (type: BlockType) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-3">
      <Button
        variant={open ? "secondary" : "default"}
        size="sm"
        onClick={() => setOpen((v) => !v)}
        className="gap-1.5"
      >
        <Plus className="size-4" />
        블록 추가
      </Button>

      {open && (
        <div className="mt-2 rounded-2xl border border-border bg-card p-3">
          <div className="space-y-4">
            {BLOCK_CATALOG.map((category) => (
              <div key={category.id}>
                <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  {category.title}
                </p>
                <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                  {category.blocks.map((entry) => {
                    const Icon = entry.icon;
                    return (
                      <button
                        key={entry.type}
                        onClick={() => {
                          onAdd(entry.type);
                          setOpen(false);
                        }}
                        className={cn(
                          "flex items-start gap-2 rounded-xl border border-border p-2.5 text-left transition-colors",
                          "hover:border-primary/40 hover:bg-primary/5"
                        )}
                      >
                        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="size-3.5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-xs font-semibold text-foreground">
                            {entry.label}
                          </span>
                          <span className="block text-[11px] leading-snug text-muted-foreground">
                            {entry.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
