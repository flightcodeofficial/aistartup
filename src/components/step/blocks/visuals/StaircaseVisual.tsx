import { cn } from "@/lib/utils";
import type { StaircaseData } from "./types";

const TONES = [
  "bg-primary/10 text-primary border-primary/20",
  "bg-violet/10 text-violet border-violet/20",
  "bg-warning/10 text-warning-foreground border-warning/30",
];

export function StaircaseVisual({ data }: { data: StaircaseData }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {data.steps.map((step, i) => (
        <div
          key={step.label}
          className={cn(
            "flex flex-col justify-end rounded-2xl border p-5",
            TONES[i % TONES.length]
          )}
          style={{ marginTop: `${(data.steps.length - 1 - i) * 1}rem` }}
        >
          <span className="text-xs font-semibold opacity-70">STEP {i + 1}</span>
          <p className="mt-1 text-lg font-bold">{step.label}</p>
          <p className="mt-1 text-sm opacity-80">{step.detail}</p>
        </div>
      ))}
    </div>
  );
}
