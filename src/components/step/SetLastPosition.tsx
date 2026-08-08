"use client";

import { useEffect } from "react";
import { useProgressStore } from "@/features/progress/store";

export function SetLastPosition({
  week,
  day,
  stepNumber,
}: {
  week: number;
  day: number;
  stepNumber: number;
}) {
  const setLastPosition = useProgressStore((s) => s.setLastPosition);

  useEffect(() => {
    setLastPosition({ week, day, stepNumber });
  }, [week, day, stepNumber, setLastPosition]);

  return null;
}
