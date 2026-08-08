import { Sparkles } from "lucide-react";

export function ComingSoon({ title, goal }: { title: string; goal: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card px-6 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Sparkles className="size-6" />
      </div>
      <h1 className="mt-5 text-xl font-bold text-foreground">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{goal}</p>
      <p className="mt-4 text-xs font-medium text-muted-foreground">
        곧 공개됩니다 · 콘텐츠 준비 중
      </p>
    </div>
  );
}
