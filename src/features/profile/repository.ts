"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { requireCurrentAuthUserId } from "@/features/auth/currentUser";
import type { UserRole } from "@/features/auth/types";
import {
  allChannels,
  CONSENT_POLICY_VERSION,
  MARKETING_CHANNELS,
  normalizePhone,
  type Cohort,
  type ConsentLogEntry,
  type MarketingConsentChannels,
  type ProfileFormValues,
  type UserProfile,
} from "./types";

// 프로필 저장소. 화면은 Supabase를 직접 알지 않는다.
//
// role과 email은 여기서 절대 쓰지 않는다 — DB 트리거가 막고 있고,
// 클라이언트가 보내지도 않게 해서 두 겹으로 막는다.

interface ProfileRow {
  id: string;
  email: string | null;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  region: string | null;
  marketing_consent_channels: MarketingConsentChannels | null;
  cohort_id: string | null;
  profile_completed: boolean;
  profile_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

const ms = (iso: string) => new Date(iso).getTime();

function rowToProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    email: row.email ?? undefined,
    role: row.role,
    fullName: row.full_name ?? undefined,
    phone: row.phone ?? undefined,
    region: row.region ?? undefined,
    marketingConsentChannels: row.marketing_consent_channels ?? undefined,
    cohortId: row.cohort_id ?? undefined,
    profileCompleted: row.profile_completed,
    profileCompletedAt: row.profile_completed_at ? ms(row.profile_completed_at) : undefined,
    createdAt: ms(row.created_at),
    updatedAt: ms(row.updated_at),
  };
}

function client() {
  const c = getSupabaseBrowserClient();
  if (!c) throw new Error("Supabase 접속 정보가 없습니다.");
  return c;
}

export async function getMyProfile(): Promise<UserProfile | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const userId = await requireCurrentAuthUserId();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return rowToProfile(data as ProfileRow);
}

/**
 * 광고 수신 상태가 바뀐 채널만 이력으로 남긴다.
 * "현재 상태"는 profiles에, "언제 무엇을 바꿨는가"는 consent_logs에 쌓인다.
 */
async function logConsentChanges(
  userId: string,
  before: MarketingConsentChannels | undefined,
  after: MarketingConsentChannels
): Promise<void> {
  const rows = MARKETING_CHANNELS.filter((channel) => before?.[channel] !== after[channel]).map(
    (channel) => ({
      user_id: userId,
      consent_type: "marketing",
      channel,
      consented: after[channel],
      policy_version: CONSENT_POLICY_VERSION,
    })
  );
  if (rows.length === 0) return;
  const { error } = await client().from("consent_logs").insert(rows);
  if (error) throw error;
}

/**
 * 온보딩/프로필 저장.
 * marketingConsent가 null이면 저장하지 않는다 — 응답은 필수다(동의가 필수인 것은 아니다).
 */
export async function saveMyProfile(values: ProfileFormValues): Promise<UserProfile> {
  if (values.marketingConsent === null) {
    throw new Error("광고성 정보 수신 여부를 선택해주세요.");
  }
  const userId = await requireCurrentAuthUserId();
  const current = await getMyProfile();
  const channels = allChannels(values.marketingConsent);

  const { data, error } = await client()
    .from("profiles")
    .update({
      // role·email은 일부러 보내지 않는다.
      full_name: values.fullName.trim(),
      phone: normalizePhone(values.phone),
      region: values.region || null,
      marketing_consent_channels: channels,
      profile_completed: true,
      profile_completed_at: current?.profileCompletedAt
        ? new Date(current.profileCompletedAt).toISOString()
        : new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;

  await logConsentChanges(userId, current?.marketingConsentChannels, channels);
  return rowToProfile(data as ProfileRow);
}

/** 프로필 화면에서 광고 수신만 바꿀 때. */
export async function updateMarketingConsent(consented: boolean): Promise<UserProfile> {
  const userId = await requireCurrentAuthUserId();
  const current = await getMyProfile();
  const channels = allChannels(consented);

  const { data, error } = await client()
    .from("profiles")
    .update({ marketing_consent_channels: channels })
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;

  await logConsentChanges(userId, current?.marketingConsentChannels, channels);
  return rowToProfile(data as ProfileRow);
}

export async function listMyConsentLogs(limit = 20): Promise<ConsentLogEntry[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("consent_logs")
    .select("id, consent_type, channel, consented, policy_version, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id as string,
    consentType: r.consent_type as string,
    channel: r.channel as ConsentLogEntry["channel"],
    consented: r.consented as boolean,
    policyVersion: r.policy_version as string,
    createdAt: ms(r.created_at as string),
  }));
}

export async function getCohort(cohortId: string): Promise<Cohort | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("cohorts")
    .select("id, course_id, name, starts_at, ends_at, status")
    .eq("id", cohortId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id as string,
    courseId: data.course_id as string,
    name: data.name as string,
    startsAt: (data.starts_at as string | null) ?? undefined,
    endsAt: (data.ends_at as string | null) ?? undefined,
    status: data.status as Cohort["status"],
  };
}
