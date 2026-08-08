"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { getMyProfile, saveMyProfile } from "@/features/profile/repository";
import { validatePhone, type ProfileFormValues } from "@/features/profile/types";
import { ProfileFields, validateProfileForm, type FieldErrors } from "@/components/profile/ProfileFields";
import { useAuth } from "@/features/auth/AuthProvider";
import { Button } from "@/components/ui/button";

// 첫 로그인 온보딩. 목표는 폰에서 30초 안에 끝나는 것.
// 그래서 필드는 4개(이름·전화·지역·광고수신)뿐이고, 이메일은 읽기전용으로 보여만 준다.

function SetupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const { user, refresh } = useAuth();

  const [values, setValues] = useState<ProfileFormValues>({
    fullName: "",
    phone: "",
    region: "",
    marketingConsent: null,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // 이미 일부 입력했거나 다시 들어온 경우를 위해 기존 값을 채운다.
  useEffect(() => {
    getMyProfile().then((p) => {
      if (!p) return;
      setValues((v) => ({
        fullName: p.fullName ?? v.fullName,
        phone: p.phone ?? v.phone,
        region: p.region ?? v.region,
        marketingConsent: v.marketingConsent,
      }));
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validateProfileForm(values);
    const phoneError = validatePhone(values.phone);
    if (phoneError) nextErrors.phone = phoneError;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setServerError(null);
    try {
      await saveMyProfile(values);
      await refresh();
      router.replace(next);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <ProfileFields
        values={values}
        errors={errors}
        email={user?.email}
        onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
      />

      {serverError && (
        <p className="rounded-lg bg-danger/10 p-2.5 text-xs text-danger">{serverError}</p>
      )}

      {/* 모바일 키보드가 올라와도 버튼이 가려지지 않도록 흐름 안에 두고 여백을 넉넉히 준다 */}
      <Button type="submit" disabled={saving} className="h-12 w-full gap-1.5 text-base">
        {saving && <Loader2 className="size-4 animate-spin" />}
        학습 시작하기
      </Button>
      <div className="h-4" />
    </form>
  );
}

export default function ProfileSetupPage() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-8 sm:py-12">
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="size-3.5" />
          시작 전 한 번만
        </span>
        <h1 className="mt-3 text-2xl font-bold text-foreground">학습 환경을 준비할게요</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          수업 진행과 결과물 관리, 문의·AS 지원을 위해 기본정보를 확인합니다.
        </p>
      </div>

      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted" />}>
        <SetupForm />
      </Suspense>
    </div>
  );
}
