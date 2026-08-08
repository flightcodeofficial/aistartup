import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

// 서버 컴포넌트 / Route Handler 용 클라이언트.
// 요청마다 새로 만들어야 한다(세션이 요청 쿠키에 묶여 있으므로 공유 금지).
//
// 여기서도 anon 키만 쓴다. service_role 키는 이 앱의 정상 동작에 필요하지 않다.

export async function createSupabaseServerClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return null;
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // 서버 컴포넌트에서는 쿠키를 쓸 수 없다. 세션 갱신은 미들웨어가 담당하므로
          // 여기서 실패하는 것은 정상이며 무시해도 된다.
        }
      },
    },
  });
}
