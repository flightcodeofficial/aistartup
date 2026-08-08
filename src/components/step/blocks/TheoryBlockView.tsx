import { BookOpen } from "lucide-react";
import type { TheoryBlock } from "@/features/curriculum/types";
import { SectionHeading } from "@/components/common/SectionHeading";

export function TheoryBlockView({ block }: { block: TheoryBlock }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <SectionHeading icon={BookOpen} eyebrow="① Theory" title={block.heading} />
      <ul className="mt-5 space-y-3">
        {block.bullets.map((bullet, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground/90 sm:text-[15px]">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
      {block.sources && block.sources.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
          {block.sources.map((s, i) => (
            <span
              key={i}
              className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
            >
              {s.label}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
