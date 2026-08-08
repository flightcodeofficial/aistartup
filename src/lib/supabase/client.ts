"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

// 브라우저용 Supabase 클라이언트(anon 키). 세션은 @supabase/ssr이 쿠키로 관리하므로
// 서버 컴포넌트/미들웨어와 같은 세션을 공유한다.
//
// 접속 정보가 없으면 null을 돌려준다 — 저장소 어댑터가 이걸 보고 로컬 모드로 떨어진다.
// 앱이 통째로 죽는 것보다 낫다.

let cached: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (cached) return cached;
  cached = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return cached;
}

/** 호출부가 "설정돼 있음"을 이미 확인한 경우. 없으면 명확한 에러를 던진다. */
export function requireSupabaseBrowserClient(): SupabaseClient {
  const client = getSupabaseBrowserClient();
  if (!client) {
    throw new Error(
      "Supabase 접속 정보가 없습니다. .env.local의 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인하세요."
    );
  }
  return client;
}
