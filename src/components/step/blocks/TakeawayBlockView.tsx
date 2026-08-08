import { Quote } from "lucide-react";
import type { TakeawayBlock } from "@/features/curriculum/types";

export function TakeawayBlockView({ block }: { block: TakeawayBlock }) {
  return (
    <section className="bg-hero-gradient relative overflow-hidden rounded-2xl px-6 py-8 text-center text-white sm:px-10 sm:py-10">
      <Quote className="mx-auto size-6 text-white/40" />
      <p className="mx-auto mt-3 max-w-xl text-lg font-bold sm:text-xl">
        {block.message}
      </p>
      <p className="mt-2 text-xs font-medium tracking-wide text-white/50 uppercase">
        ⑥ Summary · 핵심정리
      </p>
    </section>
  );
}
