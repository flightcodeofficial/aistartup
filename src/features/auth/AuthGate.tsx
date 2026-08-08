"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "./AuthProvider";

// 로그인이 필요한 화면을 감싼다.
//
// - Supabase 미설정(status:"local") → 아무것도 막지 않는다. 기존 로컬 모드 그대로.
// - 로그아웃 상태 → /login 으로 보내되, 돌아올 주소를 next로 넘겨 deep link를 지킨다.
//
// 데이터 보호의 최종 책임은 여기가 아니라 DB의 RLS다. 이 컴포넌트는 화면 흐름만 담당한다.

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { state } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (state.status === "signed-out") {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/dashboard")}`);
    }
  }, [state.status, router, pathname]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (state.status === "signed-out") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">로그인 화면으로 이동합니다…</p>
      </div>
    );
  }

  return <>{children}</>;
}
