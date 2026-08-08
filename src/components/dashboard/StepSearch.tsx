"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useStepSearch } from "@/hooks/useStepSearch";
import { Input } from "@/components/ui/input";
import { routes } from "@/lib/routes";

export function StepSearch() {
  const [query, setQuery] = useState("");
  const results = useStepSearch(query);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="STEP 제목이나 키워드로 검색... (예: ICP, 가치제안)"
          className="pl-9"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {query && (
        <div className="mt-2 rounded-xl border border-border bg-card p-2 shadow-lg">
          {results.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">검색 결과가 없습니다.</p>
          ) : (
            <ul className="space-y-1">
              {results.map(({ step, weekTitle, dayTitle }) => (
                <li key={step.id}>
                  <Link
                    href={routes.step(step.week, step.day, step.stepNumber)}
                    className="block rounded-lg px-3 py-2 hover:bg-muted"
                  >
                    <p className="text-sm font-semibold text-foreground">{step.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {weekTitle} · {dayTitle} · STEP{step.stepNumber}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
