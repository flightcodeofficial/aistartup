"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// 저장소 어댑터가 "지금 누구인가"를 물을 때 쓰는 유일한 창구.
// UI 컴포넌트가 Supabase를 직접 알지 않게 하려고 여기에 모아둔다.

export async function getCurrentAuthUserId(): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user.id ?? null;
  } catch {
    return null;
  }
}

/** 로그인이 필요한 쓰기 작업에서 사용. 없으면 명확한 메시지로 실패시킨다. */
export async function requireCurrentAuthUserId(): Promise<string> {
  const id = await getCurrentAuthUserId();
  if (!id) throw new Error("로그인이 필요합니다.");
  return id;
}
