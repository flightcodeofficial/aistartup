import { Clock, FlaskConical } from "lucide-react";
import type { PracticeDef } from "@/features/curriculum/types";
import { SectionHeading } from "@/components/common/SectionHeading";
import type { ReactNode } from "react";

export function PracticeSectionShell({
  practice,
  children,
}: {
  practice: PracticeDef;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border-2 border-primary/20 bg-primary/[0.03] p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionHeading icon={FlaskConical} eyebrow="④ 실습" title={practice.title} />
        <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          <Clock className="size-3.5" />약 {practice.estimatedMinutes}분
        </span>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-foreground/80 sm:text-[15px]">
        {practice.instruction}
      </p>
      <div className="mt-6">{children}</div>
    </section>
  );
}
