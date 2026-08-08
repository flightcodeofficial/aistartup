import { useMemo } from "react";
import { curriculum, flattenSteps } from "@/features/curriculum/data";
import type { Step } from "@/features/curriculum/types";

export interface StepSearchResult {
  step: Step;
  weekTitle: string;
  dayTitle: string;
}

export function useStepSearch(query: string): StepSearchResult[] {
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const results: StepSearchResult[] = [];
    for (const week of curriculum) {
      for (const day of week.days) {
        for (const step of flattenSteps(day)) {
          const haystack = `${step.title} ${step.summary} ${step.keyMessage}`.toLowerCase();
          if (haystack.includes(q)) {
            results.push({ step, weekTitle: week.title, dayTitle: day.title });
          }
        }
      }
    }
    return results;
  }, [query]);
}
