"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, UserRound } from "lucide-react";
import {
  getCohort,
  getMyProfile,
  listMyConsentLogs,
  saveMyProfile,
} from "@/features/profile/repository";
import {
  isMarketingConsented,
  validatePhone,
  type Cohort,
  type ConsentLogEntry,
  type ProfileFormValues,
  type UserProfile,
} from "@/features/profile/types";
import { ProfileFields, validateProfileForm, type FieldErrors } from "@/components/profile/ProfileFields";
import type { UserRole } from "@/features/auth/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/formatRelativeTime";

const ROLE_LABELS: Record<UserRole, string> = {
  student: "수강생",
  instructor: "강사",
  admin: "관리자",
};

const CHANNEL_LABELS: Record<ConsentLogEntry["channel"], string> = {
  email: "이메일",
  sms: "문자",
  phone: "전화",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [logs, setLogs] = useState<ConsentLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<ProfileFormValues>({
    fullName: "",
    phone: "",
    region: "",
    marketingConsent: null,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const p = await getMyProfile();
    setProfile(p);
    if (p) {
      setValues({
        fullName: p.fullName ?? "",
        phone: p.phone ?? "",
        region: p.region ?? "",
        marketingConsent: p.marketingConsentChannels
          ? isMarketingConsented(p.marketingConsentChannels)
          : null,
      });
      if (p.cohortId) setCohort(await getCohort(p.cohortId));
    }
    setLogs(await listMyConsentLogs());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validateProfileForm(values);
    const phoneError = validatePhone(values.phone);
    if (phoneError) nextErrors.phone = phoneError;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setServerError(null);
    setMessage(null);
    try {
      await saveMyProfile(values);
      // 동의 이력이 새로 쌓였을 수 있으므로 다시 읽는다.
      await load();
      setMessage("저장했습니다.");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-md space-y-3 px-4 py-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 px-4 py-8 sm:py-10">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <UserRound className="size-3.5" />
          내 정보
        </span>
        <h1 className="mt-3 text-2xl font-bold text-foreground">프로필</h1>
      </div>

      {/* 읽기 전용 정보 */}
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-2xl border border-border bg-card p-4 text-sm">
        <dt className="text-muted-foreground">권한</dt>
        <dd className="font-medium text-foreground">
          {profile ? ROLE_LABELS[profile.role] : "-"}
        </dd>
        <dt className="text-muted-foreground">가입일</dt>
        <dd className="text-foreground">
          {profile ? new Date(profile.createdAt).toLocaleDateString("ko-KR") : "-"}
        </dd>
        <dt className="text-muted-foreground">과정</dt>
        <dd className="text-foreground">{cohort?.courseId ?? "AI 창업 스쿨"}</dd>
        <dt className="text-muted-foreground">기수</dt>
        <dd className="text-foreground">{cohort?.name ?? "배정 전"}</dd>
      </dl>

      <form onSubmit={submit} className="space-y-5">
        <ProfileFields
          values={values}
          errors={errors}
          email={profile?.email}
          onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
        />

        {serverError && (
          <p className="rounded-lg bg-danger/10 p-2.5 text-xs text-danger">{serverError}</p>
        )}
        {message && (
          <p className="rounded-lg bg-success/10 p-2.5 text-xs text-success">{message}</p>
        )}

        <Button type="submit" disabled={saving} className="h-12 w-full gap-1.5">
          {saving && <Loader2 className="size-4 animate-spin" />}
          저장
        </Button>
      </form>

      {logs.length > 0 && (
        <section>
          <p className="mb-2 text-sm font-bold text-foreground">광고 수신 변경 이력</p>
          <ul className="space-y-1.5">
            {logs.map((log) => (
              <li
                key={log.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-xs"
              >
                <span className="text-muted-foreground">
                  {CHANNEL_LABELS[log.channel]} · {formatRelativeTime(log.createdAt)}
                </span>
                <span className={log.consented ? "text-success" : "text-muted-foreground"}>
                  {log.consented ? "동의" : "비동의"}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-muted-foreground">
            이력은 수정·삭제되지 않고 그대로 보관됩니다.
          </p>
        </section>
      )}
    </div>
  );
}
