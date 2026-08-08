import { CheckCircle2, HelpCircle, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EvidenceTag } from "@/features/practice/types";

const CONFIG: Record<
  EvidenceTag,
  { className: string; icon: typeof CheckCircle2; label: string }
> = {
  근거있음: {
    className: "border-success/30 bg-success/10 text-success",
    icon: CheckCircle2,
    label: "근거있음",
  },
  추론: {
    className: "border-warning/40 bg-warning/10 text-warning-foreground",
    icon: HelpCircle,
    label: "추론",
  },
  검증필요: {
    className: "border-danger/30 bg-danger/10 text-danger",
    icon: TriangleAlert,
    label: "검증 필요",
  },
};

export function EvidenceBadge({
  tag,
  className,
}: {
  tag: EvidenceTag;
  className?: string;
}) {
  const config = CONFIG[tag];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold",
        config.className,
        className
      )}
    >
      <Icon className="size-3.5" />
      {config.label}
    </span>
  );
}
