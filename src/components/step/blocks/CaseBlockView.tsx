import { Lightbulb } from "lucide-react";
import type { CaseBlock } from "@/features/curriculum/types";
import { SectionHeading } from "@/components/common/SectionHeading";

export function CaseBlockView({ block }: { block: CaseBlock }) {
  return (
    <section className="rounded-2xl border border-violet/20 bg-violet/5 p-6 sm:p-8">
      <SectionHeading icon={Lightbulb} eyebrow="② Example · 사례" title={block.heading} />
      <div className="mt-5 space-y-3">
        {block.body.map((paragraph, i) => (
          <p key={i} className="text-sm leading-relaxed text-foreground/90 sm:text-[15px]">
            {paragraph}
          </p>
        ))}
      </div>
      {block.sources && block.sources.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2 border-t border-violet/20 pt-4">
          {block.sources.map((s, i) => (
            <span
              key={i}
              className="rounded-full bg-violet/10 px-2.5 py-1 text-xs font-medium text-violet"
            >
              {s.label}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
