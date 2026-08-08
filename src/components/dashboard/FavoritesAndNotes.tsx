"use client";

import Link from "next/link";
import { NotebookPen, Star } from "lucide-react";
import { getStepById } from "@/features/curriculum/data";
import { useProgressStore } from "@/features/progress/store";
import { routes } from "@/lib/routes";

export function FavoritesAndNotes() {
  const stepsProgress = useProgressStore((s) => s.steps);

  const favorites = Object.values(stepsProgress)
    .filter((s) => s.favorited)
    .map((s) => getStepById(s.stepId))
    .filter(Boolean);

  const notes = Object.values(stepsProgress)
    .filter((s) => s.note.trim().length > 0)
    .map((s) => ({ step: getStepById(s.stepId), note: s.note }))
    .filter((n) => n.step);

  if (favorites.length === 0 && notes.length === 0) return null;

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {favorites.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-foreground">
            <Star className="size-4 text-warning" />
            즐겨찾기
          </h2>
          <div className="space-y-2">
            {favorites.map(
              (step) =>
                step && (
                  <Link
                    key={step.id}
                    href={routes.step(step.week, step.day, step.stepNumber)}
                    className="block rounded-xl border border-border bg-card p-3 text-sm hover:bg-muted"
                  >
                    <p className="font-semibold text-foreground">{step.title}</p>
                    <p className="text-xs text-muted-foreground">STEP{step.stepNumber}</p>
                  </Link>
                )
            )}
          </div>
        </section>
      )}

      {notes.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-foreground">
            <NotebookPen className="size-4 text-primary" />
            내 노트
          </h2>
          <div className="space-y-2">
            {notes.map(
              ({ step, note }) =>
                step && (
                  <Link
                    key={step.id}
                    href={routes.step(step.week, step.day, step.stepNumber)}
                    className="block rounded-xl border border-border bg-card p-3 text-sm hover:bg-muted"
                  >
                    <p className="font-semibold text-foreground">{step.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{note}</p>
                  </Link>
                )
            )}
          </div>
        </section>
      )}
    </div>
  );
}
