export const USER_ROLES = ["student", "instructor", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** 로그인한 사용자. role은 항상 서버 profiles 테이블에서 온다(클라이언트가 정하지 않는다). */
export interface AuthUser {
  id: string;
  email?: string;
  displayName?: string;
  role: UserRole;
}

export type AuthState =
  /** 세션 복원 중 */
  | { status: "loading" }
  /** Supabase 미설정 — 로컬(단일 브라우저) 모드 */
  | { status: "local" }
  | { status: "signed-out" }
  | { status: "signed-in"; user: AuthUser };

export function isStaff(role: UserRole | undefined): boolean {
  return role === "instructor" || role === "admin";
}
