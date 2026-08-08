// Supabase 접속 정보. 값이 없으면 앱은 죽지 않고 로컬(IndexedDB) 모드로 동작한다.
//
// 여기 있는 두 값은 브라우저에 노출되는 것이 정상이다. anon 키는 "누구나 접근"이 아니라
// "인증 전 신원"을 뜻하고, 실제 접근 권한은 DB의 RLS 정책이 결정한다.
// service_role 키는 이 파일에서 절대 읽지 않는다(클라이언트 번들에 들어가면 안 되므로).

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * 접속 정보가 갖춰졌는지. false면 저장소가 로컬 어댑터로 떨어진다.
 *
 * 주의: Next는 NEXT_PUBLIC_ 값을 빌드 시점에 문자열로 치환하므로
 * process.env를 동적으로 조회하면 안 되고, 위처럼 정적으로 읽어야 한다.
 */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
