import type { UserRole } from "@/features/auth/types";

// 회원 프로필 — 수업 진행, 결과물 관리, 문의(AS) 응대에 필요한 최소 정보만 담는다.
// 여기에 없는 개인정보는 수집하지 않는다.

/** 광고성 정보 수신 채널. 운영 안내(휴강·계정·보안)는 여기에 해당하지 않는다. */
export const MARKETING_CHANNELS = ["email", "sms", "phone"] as const;
export type MarketingChannel = (typeof MARKETING_CHANNELS)[number];

export type MarketingConsentChannels = Record<MarketingChannel, boolean>;

export const CONSENT_POLICY_VERSION = "v1";

export interface UserProfile {
  id: string;
  email?: string;
  role: UserRole;

  fullName?: string;
  phone?: string;
  region?: string;

  /** null이면 아직 광고 수신 여부에 응답하지 않은 상태. */
  marketingConsentChannels?: MarketingConsentChannels;

  cohortId?: string;
  profileCompleted: boolean;
  profileCompletedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Cohort {
  id: string;
  courseId: string;
  name: string;
  startsAt?: string;
  endsAt?: string;
  status: "upcoming" | "active" | "closed";
}

export interface ConsentLogEntry {
  id: string;
  consentType: string;
  channel: MarketingChannel;
  consented: boolean;
  policyVersion: string;
  createdAt: number;
}

/** 온보딩/프로필 화면이 저장하는 값. 이메일과 role은 여기 없다(사용자가 못 바꾼다). */
export interface ProfileFormValues {
  fullName: string;
  phone: string;
  region: string;
  /** null = 아직 선택 안 함. 저장하려면 반드시 true/false여야 한다. */
  marketingConsent: boolean | null;
}

export function allChannels(consented: boolean): MarketingConsentChannels {
  return { email: consented, sms: consented, phone: consented };
}

/** 채널 중 하나라도 켜져 있으면 "동의"로 본다(부분 해제 기능을 나중에 붙일 때를 위해). */
export function isMarketingConsented(channels?: MarketingConsentChannels): boolean {
  if (!channels) return false;
  return MARKETING_CHANNELS.some((c) => channels[c]);
}

// ── 휴대폰 번호 ─────────────────────────────────────────────────────────────

/**
 * 저장 전 정규화. 국내 번호는 하이픈 형태로 통일하고,
 * +로 시작하는 국제번호는 숫자만 남겨 그대로 둔다(해외 확장 대비).
 */
export function normalizePhone(input: string): string {
  const trimmed = input.trim();
  if (trimmed.startsWith("+")) {
    return `+${trimmed.slice(1).replace(/[^\d]/g, "")}`;
  }
  const digits = trimmed.replace(/[^\d]/g, "");
  if (digits.length === 11 && digits.startsWith("01")) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10 && digits.startsWith("01")) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  // 그 외(지역번호 등)는 숫자만 남긴다. 형식을 억지로 맞추지 않는다.
  return digits;
}

/** 최소 형식 검증. 통신사 인증은 이번 범위가 아니다. */
export function validatePhone(input: string): string | null {
  const value = input.trim();
  if (!value) return "휴대폰 번호를 입력해주세요.";
  const digits = value.replace(/[^\d]/g, "");
  if (digits.length < 9) return "번호가 너무 짧습니다. 다시 확인해주세요.";
  if (digits.length > 15) return "번호가 너무 깁니다. 다시 확인해주세요.";
  if (!value.startsWith("+") && !digits.startsWith("0")) {
    return "010-1234-5678 형식으로 입력해주세요.";
  }
  return null;
}

/** 입력 중 자동 하이픈. 커서를 방해하지 않도록 단순 규칙만 쓴다. */
export function formatPhoneWhileTyping(input: string): string {
  if (input.trim().startsWith("+")) return input;
  const digits = input.replace(/[^\d]/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

// 지역 목록은 features/profile/regions.ts 로 옮겼다(광역+기초 2단 선택).
