import { Ban, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComparisonData } from "./types";

export function ComparisonVisual({ data }: { data: ComparisonData }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[data.left, data.right].map((side, i) => {
        const isVivid = side.tone === "vivid";
        return (
          <div
            key={i}
            className={cn(
              "rounded-2xl border p-5",
              isVivid
                ? "border-primary/30 bg-primary/5"
                : "border-border bg-muted/50"
            )}
          >
            <div
              className={cn(
                "mb-3 flex size-8 items-center justify-center rounded-lg",
                isVivid ? "bg-primary/15 text-primary" : "bg-muted-foreground/10 text-muted-foreground"
              )}
            >
              {isVivid ? <Sparkles className="size-4" /> : <Ban className="size-4" />}
            </div>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {side.label}
            </p>
            <p
              className={cn(
                "mt-2 text-sm leading-relaxed font-medium sm:text-[15px]",
                isVivid ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {side.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}
