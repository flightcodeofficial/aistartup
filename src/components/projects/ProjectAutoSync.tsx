"use client";

import { useProjectAutoSync } from "@/features/projects/useProjectAutoSync";

/** 화면에 아무것도 그리지 않는다. AppShell에 마운트되어 실습 결과를
 *  Primary Project로 계속 자동 동기화하는 역할만 한다. */
export function ProjectAutoSync() {
  useProjectAutoSync();
  return null;
}
