import type { NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

// 인증 세션 갱신만 담당한다. 여기서 라우트를 막지는 않는다 —
// 화면 접근 통제는 (app) 레이아웃의 AuthGate가, 데이터 접근 통제는 DB의 RLS가 한다.
export async function middleware(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    // 정적 파일과 이미지 최적화 경로는 건너뛴다.
    // lesson-content(수업용 HTML/SVG)도 인증 쿠키 갱신이 필요 없으므로 제외한다.
    "/((?!_next/static|_next/image|favicon.ico|lesson-content|.*\\.(?:svg|png|jpg|jpeg|gif|webp|html)$).*)",
  ],
};
