"use client";

import { Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstructorSyncStore } from "@/features/instructor/store";
import { cn } from "@/lib/utils";

export function FollowInstructorToggle() {
  const followInstructor = useInstructorSyncStore((s) => s.followInstructor);
  const setFollowInstructor = useInstructorSyncStore((s) => s.setFollowInstructor);

  return (
    <Button
      variant={followInstructor ? "default" : "ghost"}
      size="sm"
      className={cn("gap-1.5", followInstructor && "animate-pulse")}
      onClick={() => setFollowInstructor(!followInstructor)}
      title="강사가 이동하는 STEP을 자동으로 따라갑니다 (같은 브라우저 내 다른 탭)"
    >
      <Radio className="size-3.5" />
      <span className="hidden sm:inline">강사 화면 따라가기</span>
    </Button>
  );
}
