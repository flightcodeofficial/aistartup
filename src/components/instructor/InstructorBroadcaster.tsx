"use client";

import { useEffect } from "react";
import { broadcastPosition } from "@/features/instructor/syncChannel";

export function InstructorBroadcaster({
  week,
  day,
  stepNumber,
}: {
  week: number;
  day: number;
  stepNumber: number;
}) {
  useEffect(() => {
    broadcastPosition({ week, day, stepNumber });
  }, [week, day, stepNumber]);

  return null;
}
