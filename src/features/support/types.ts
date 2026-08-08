import type { UserProfile } from "@/features/profile/types";

// 문의(AS) 응대에 필요한 최소 맥락.
//
// 이번 단계에서는 타입과 수집 함수만 만든다 — 상담센터·티켓·문자 발송은 만들지 않는다.
//
// 담지 않는 것(의도적):
//   Artifact 본문, 고객 인터뷰 원문, 실습 답변 전문,
//   비밀번호, 토큰, 세션, 그 밖의 민감정보.
// "어디서 무엇이 안 되는가"를 알기 위한 정보만 담고, 학생이 쓴 내용은 담지 않는다.

export interface SupportContext {
  userId: string;
  fullName?: string;
  email?: string;
  phone?: string;
  region?: string;

  courseId?: string;
  cohortId?: string;
  lessonId?: string;
  pageId?: string;
  projectId?: string;

  appVersion?: string;
  browser?: string;
  os?: string;
  /** 마지막으로 저장이 성공한 시각. "저장이 안 돼요" 문의를 가를 때 쓴다. */
  lastSavedAt?: number;
}

export interface SupportContextInput {
  profile: UserProfile;
  courseId?: string;
  lessonId?: string;
  pageId?: string;
  projectId?: string;
  lastSavedAt?: number;
}

/** userAgent에서 사람이 읽을 정도만 뽑는다. 지문(fingerprint) 수집이 아니다. */
function describeClient(): { browser?: string; os?: string } {
  if (typeof navigator === "undefined") return {};
  const ua = navigator.userAgent;
  const browser =
    /Edg\//.test(ua) ? "Edge"
    : /OPR\//.test(ua) ? "Opera"
    : /Chrome\//.test(ua) ? "Chrome"
    : /Safari\//.test(ua) ? "Safari"
    : /Firefox\//.test(ua) ? "Firefox"
    : undefined;
  const os =
    /Windows/.test(ua) ? "Windows"
    : /Android/.test(ua) ? "Android"
    : /iPhone|iPad/.test(ua) ? "iOS"
    : /Mac OS X/.test(ua) ? "macOS"
    : /Linux/.test(ua) ? "Linux"
    : undefined;
  return { browser, os };
}

export function buildSupportContext(input: SupportContextInput): SupportContext {
  const { profile } = input;
  const { browser, os } = describeClient();
  return {
    userId: profile.id,
    fullName: profile.fullName,
    email: profile.email,
    phone: profile.phone,
    region: profile.region,
    courseId: input.courseId,
    cohortId: profile.cohortId,
    lessonId: input.lessonId,
    pageId: input.pageId,
    projectId: input.projectId,
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION,
    browser,
    os,
    lastSavedAt: input.lastSavedAt,
  };
}
