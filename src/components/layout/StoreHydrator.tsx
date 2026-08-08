"use client";

import { useEffect } from "react";
import { useProgressStore } from "@/features/progress/store";
import { usePracticeStore } from "@/features/practice/store";
import { useInstructorSyncStore } from "@/features/instructor/store";
import { useBlockResponseStore } from "@/features/lesson-builder/blockResponseStore";
import { useActiveProjectStore } from "@/features/workspace/activeProjectStore";

/**
 * zustand persist는 skipHydration: true로 설정되어 있다.
 * Next.js App Router의 서버 렌더와 클라이언트 렌더 간 localStorage 불일치로
 * useSyncExternalStore가 무한 루프에 빠지는 것을 막기 위해,
 * 마운트 이후 한 번만 수동으로 localStorage에서 복원한다.
 */
export function StoreHydrator() {
  useEffect(() => {
    useProgressStore.persist.rehydrate();
    usePracticeStore.persist.rehydrate();
    useInstructorSyncStore.persist.rehydrate();
    useBlockResponseStore.persist.rehydrate();
    useActiveProjectStore.persist.rehydrate();
  }, []);

  return null;
}
