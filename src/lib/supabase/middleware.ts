import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

// 세션 갱신 전용 미들웨어 헬퍼.
//
// @supabase/ssr 문서가 강조하는 부분: 서버 컴포넌트는 쿠키를 쓸 수 없으므로,
// 토큰이 만료될 때 새 토큰을 응답 쿠키로 써주는 곳이 반드시 하나 필요하다.
// 그게 없으면 "가끔 로그아웃됨" 같은 잡기 어려운 버그가 생긴다.

export async function updateSupabaseSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
        // 인증 쿠키가 실린 응답은 캐시되면 안 된다(다른 사용자에게 세션이 새어나간다).
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // getUser()를 호출해야 만료 토큰 갱신이 실제로 일어난다.
  // 실패해도 페이지는 그대로 열리게 두고, 접근 통제는 각 화면과 RLS가 한다.
  try {
    await supabase.auth.getUser();
  } catch {
    // 네트워크 장애로 세션 갱신이 실패해도 앱을 막지 않는다.
  }

  return response;
}
