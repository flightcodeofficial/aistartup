import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  icon: Icon,
  eyebrow,
  title,
  className,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {eyebrow}
        </p>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
      </div>
    </div>
  );
}
