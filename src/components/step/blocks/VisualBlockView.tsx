import { BarChart3 } from "lucide-react";
import type { VisualBlock } from "@/features/curriculum/types";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ComparisonVisual } from "./visuals/ComparisonVisual";
import { TableVisual } from "./visuals/TableVisual";
import { StaircaseVisual } from "./visuals/StaircaseVisual";
import { CanvasVisual } from "./visuals/CanvasVisual";
import { FlowVisual } from "./visuals/FlowVisual";
import type {
  CanvasData,
  ComparisonData,
  FlowData,
  StaircaseData,
  TableData,
} from "./visuals/types";

export function VisualBlockView({ block }: { block: VisualBlock }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <SectionHeading icon={BarChart3} eyebrow="② Example · 그림" title={block.heading} />
      <div className="mt-5">
        {block.visualKind === "comparison" && (
          <ComparisonVisual data={block.data as ComparisonData} />
        )}
        {block.visualKind === "table" && <TableVisual data={block.data as TableData} />}
        {block.visualKind === "staircase" && (
          <StaircaseVisual data={block.data as StaircaseData} />
        )}
        {block.visualKind === "canvas" && <CanvasVisual data={block.data as CanvasData} />}
        {block.visualKind === "flow" && <FlowVisual data={block.data as FlowData} />}
      </div>
      {block.caption && (
        <p className="mt-4 text-xs text-muted-foreground">{block.caption}</p>
      )}
    </section>
  );
}
