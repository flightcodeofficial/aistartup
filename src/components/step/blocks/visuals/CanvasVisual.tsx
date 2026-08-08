import { ArrowLeftRight, Package, User } from "lucide-react";
import type { CanvasData } from "./types";

export function CanvasVisual({ data }: { data: CanvasData }) {
  return (
    <div className="relative grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="mb-3 flex items-center gap-2 text-primary">
          <User className="size-4" />
          <p className="text-sm font-bold">{data.customer.title}</p>
        </div>
        <ul className="space-y-2">
          {data.customer.fields.map((field) => (
            <li
              key={field}
              className="rounded-lg bg-background px-3 py-2 text-sm text-foreground/90"
            >
              {field}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-center py-2 text-muted-foreground sm:py-0">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
          <ArrowLeftRight className="size-4" />
        </div>
      </div>

      <div className="rounded-2xl border border-warning/30 bg-warning/5 p-5">
        <div className="mb-3 flex items-center gap-2 text-warning-foreground">
          <Package className="size-4" />
          <p className="text-sm font-bold">{data.product.title}</p>
        </div>
        <ul className="space-y-2">
          {data.product.fields.map((field) => (
            <li
              key={field}
              className="rounded-lg bg-background px-3 py-2 text-sm text-foreground/90"
            >
              {field}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
