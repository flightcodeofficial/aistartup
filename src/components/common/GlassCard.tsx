import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function GlassCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("glass-card rounded-2xl p-6 shadow-sm", className)}>
      {children}
    </div>
  );
}
