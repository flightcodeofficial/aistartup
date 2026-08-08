"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useInstructorSyncStore } from "@/features/instructor/store";
import { subscribeToPosition } from "@/features/instructor/syncChannel";
import { routes } from "@/lib/routes";

/** 학생이 "강사 화면 따라가기"를 켰을 때, 강사 탭이 방송한 위치로 자동 이동한다. */
export function FollowInstructorListener() {
  const followInstructor = useInstructorSyncStore((s) => s.followInstructor);
  const router = useRouter();

  useEffect(() => {
    if (!followInstructor) return;
    return subscribeToPosition((position) => {
      router.push(routes.step(position.week, position.day, position.stepNumber));
      toast.info(`강사가 STEP${position.stepNumber}(으)로 이동했습니다`);
    });
  }, [followInstructor, router]);

  return null;
}
