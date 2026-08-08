"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { isStaff } from "./types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { Button } from "@/components/ui/button";

// 강사/관리자 전용 화면을 감싼다.
//
// 실제 차단은 DB의 RLS가 한다(학생이 이 화면을 억지로 열어도 저장이 안 된다).
// 여기서는 학생에게 못 쓰는 도구를 보여주지 않는 역할만 한다.
// 로컬 모드(키 없음)에서는 역할 개념이 없으므로 통과시킨다.

export function StaffOnly({ children }: { children: React.ReactNode }) {
  const { state } = useAuth();

  if (!isSupabaseConfigured) return <>{children}</>;
  if (state.status === "loading") return null;
  if (state.status === "signed-in" && isStaff(state.user.role)) return <>{children}</>;

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <ShieldAlert className="mx-auto size-8 text-muted-foreground" />
      <p className="mt-3 text-sm font-semibold text-foreground">강사 전용 화면입니다</p>
      <p className="mt-1 text-xs text-muted-foreground">
        수업 콘텐츠는 강사·관리자만 편집할 수 있습니다.
      </p>
      <Button asChild variant="outline" className="mt-4">
        <Link href="/dashboard">대시보드로 돌아가기</Link>
      </Button>
    </div>
  );
}
