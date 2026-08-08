"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getMyProfile } from "./repository";
import { useAuth } from "@/features/auth/AuthProvider";
import { isSupabaseConfigured } from "@/lib/supabase/env";

// 로그인은 했지만 기본정보를 아직 안 낸 사용자를 온보딩으로 보낸다.
//
// - 원래 가려던 주소는 next로 넘겨서, 저장 후 그 Lesson으로 되돌아간다.
// - 온보딩 화면 자체는 통과시켜야 무한 리다이렉트가 안 난다.
// - 로컬 모드에는 계정이 없으므로 아무것도 하지 않는다.
// - 조회에 실패하면 막지 않는다(서버 장애로 수업이 멈추면 안 된다).

const EXEMPT = ["/profile/setup"];

export function ProfileGate({ children }: { children: React.ReactNode }) {
  const { state } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || state.status !== "signed-in") return;
    if (EXEMPT.some((p) => pathname?.startsWith(p))) {
      setChecked(true);
      return;
    }

    let cancelled = false;
    getMyProfile()
      .then((profile) => {
        if (cancelled) return;
        if (profile && !profile.profileCompleted) {
          router.replace(`/profile/setup?next=${encodeURIComponent(pathname || "/dashboard")}`);
          return;
        }
        setChecked(true);
      })
      .catch(() => {
        if (!cancelled) setChecked(true);
      });

    return () => {
      cancelled = true;
    };
  }, [state.status, pathname, router]);

  if (!isSupabaseConfigured || state.status !== "signed-in") return <>{children}</>;
  // 온보딩이 필요한지 확인되기 전에 수업 화면을 깜빡 보여주지 않는다.
  if (!checked) return null;
  return <>{children}</>;
}
