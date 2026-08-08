import { ChevronRight } from "lucide-react";
import type { FlowData } from "./types";

export function FlowVisual({ data }: { data: FlowData }) {
  return (
    <div className="scrollbar-thin flex items-center gap-2 overflow-x-auto pb-2">
      {data.nodes.map((node, i) => (
        <div key={node} className="flex shrink-0 items-center gap-2">
          <div className="flex min-w-28 flex-col items-center rounded-xl border border-border bg-muted/60 px-3 py-3 text-center">
            <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {i + 1}
            </span>
            <span className="mt-1.5 text-xs font-semibold text-foreground">{node}</span>
          </div>
          {i < data.nodes.length - 1 && (
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          )}
        </div>
      ))}
    </div>
  );
}
