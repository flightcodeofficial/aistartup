import type { ContentBlock } from "@/features/curriculum/types";
import { TheoryBlockView } from "./TheoryBlockView";
import { VisualBlockView } from "./VisualBlockView";
import { CaseBlockView } from "./CaseBlockView";
import { TakeawayBlockView } from "./TakeawayBlockView";

export function ContentBlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.kind) {
    case "theory":
      return <TheoryBlockView block={block} />;
    case "visual":
      return <VisualBlockView block={block} />;
    case "case":
      return <CaseBlockView block={block} />;
    case "takeaway":
      return <TakeawayBlockView block={block} />;
    default:
      return null;
  }
}
