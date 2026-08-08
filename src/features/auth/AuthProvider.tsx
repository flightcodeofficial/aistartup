"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { AuthState, AuthUser, UserRole } from "./types";

// 앱 전체가 참조하는 인증 상태.
//
// - Supabase 미설정이면 status:"local" 로 두고 기존 로컬 모드가 그대로 돌게 한다.
//   (키가 없다고 앱이 흰 화면이 되면 안 된다)
// - role은 profiles 테이블에서 읽는다. 세션 JWT나 사용자 입력을 믿지 않는다.

interface AuthContextValue {
  state: AuthState;
  /** 편의용. 로그인 상태가 아니면 undefined. */
  user?: AuthUser;
  signOut: () => Promise<void>;
  /** 프로필(role 등)을 서버에서 다시 읽는다. 승격 직후 등에 사용. */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  state: { status: "local" },
  signOut: async () => {},
  refresh: async () => {},
});

async function loadProfile(userId: string, fallbackEmail?: string): Promise<AuthUser> {
  const supabase = getSupabaseBrowserClient();
  const base: AuthUser = { id: userId, email: fallbackEmail, role: "student" };
  if (!supabase) return base;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, display_name, role")
    .eq("id", userId)
    .maybeSingle();

  // 프로필이 아직 없거나(트리거 지연) 조회에 실패하면 최소 권한(student)으로 둔다.
  if (error || !data) return base;

  return {
    id: data.id as string,
    email: (data.email as string | null) ?? fallbackEmail,
    displayName: (data.display_name as string | null) ?? undefined,
    role: (data.role as UserRole) ?? "student",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() =>
    isSupabaseConfigured ? { status: "loading" } : { status: "local" }
  );
  // 같은 사용자에 대해 프로필을 중복 조회하지 않도록 기억해둔다.
  const lastUserId = useRef<string | null>(null);

  const applySession = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      lastUserId.current = null;
      setState({ status: "signed-out" });
      return;
    }
    if (lastUserId.current === session.user.id) return;
    lastUserId.current = session.user.id;
    const user = await loadProfile(session.user.id, session.user.email ?? undefined);
    setState({ status: "signed-in", user });
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let cancelled = false;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!cancelled) applySession(data.session);
      })
      .catch(() => {
        // 네트워크 장애로 세션 복원에 실패하면 로그아웃으로 취급한다.
        if (!cancelled) setState({ status: "signed-out" });
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) applySession(session);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [applySession]);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    lastUserId.current = null;
    setState({ status: "signed-out" });
  }, []);

  const refresh = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    lastUserId.current = null;
    await applySession(data.session);
  }, [applySession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      user: state.status === "signed-in" ? state.user : undefined,
      signOut,
      refresh,
    }),
    [state, signOut, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
