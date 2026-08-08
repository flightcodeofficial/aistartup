"use client";

import { formatPhoneWhileTyping, REGIONS, type ProfileFormValues } from "@/features/profile/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// 온보딩과 프로필 화면이 함께 쓰는 입력부.
// 두 화면의 문구·검증이 갈라지지 않게 한 곳에 둔다.

export interface FieldErrors {
  fullName?: string;
  phone?: string;
  marketingConsent?: string;
}

export function ProfileFields({
  values,
  errors,
  email,
  onChange,
}: {
  values: ProfileFormValues;
  errors: FieldErrors;
  email?: string;
  onChange: (patch: Partial<ProfileFormValues>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="fullName">
          이름 <span className="text-danger">*</span>
        </Label>
        <Input
          id="fullName"
          value={values.fullName}
          autoComplete="name"
          onChange={(e) => onChange({ fullName: e.target.value })}
          aria-invalid={Boolean(errors.fullName)}
          className="mt-1.5 h-12"
        />
        {errors.fullName && <p className="mt-1 text-xs text-danger">{errors.fullName}</p>}
      </div>

      <div>
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          value={email ?? ""}
          readOnly
          disabled
          className="mt-1.5 h-12 bg-muted/50"
        />
        <p className="mt-1 text-[11px] text-muted-foreground">
          로그인 계정 주소입니다. 변경이 필요하면 문의해주세요.
        </p>
      </div>

      <div>
        <Label htmlFor="phone">
          휴대폰 번호 <span className="text-danger">*</span>
        </Label>
        <Input
          id="phone"
          // 모바일에서 숫자 키패드가 바로 뜨게 한다.
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="010-1234-5678"
          value={values.phone}
          onChange={(e) => onChange({ phone: formatPhoneWhileTyping(e.target.value) })}
          aria-invalid={Boolean(errors.phone)}
          className="mt-1.5 h-12"
        />
        {errors.phone ? (
          <p className="mt-1 text-xs text-danger">{errors.phone}</p>
        ) : (
          <p className="mt-1 text-[11px] text-muted-foreground">
            수업 안내와 문의 응대에만 사용합니다.
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="region">지역 (선택)</Label>
        <select
          id="region"
          value={values.region}
          onChange={(e) => onChange({ region: e.target.value })}
          className="mt-1.5 h-12 w-full rounded-lg border border-border bg-background px-3 text-sm"
        >
          <option value="">선택 안 함</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <MarketingConsentField
        value={values.marketingConsent}
        error={errors.marketingConsent}
        onChange={(marketingConsent) => onChange({ marketingConsent })}
      />
    </div>
  );
}

/**
 * 광고성 정보 수신 여부.
 *
 * 기본 선택값을 두지 않는다. 응답은 필수지만 "동의"가 필수는 아니다 —
 * 미리 체크해두면 실질적으로 동의를 강요하는 것이 된다.
 */
export function MarketingConsentField({
  value,
  error,
  onChange,
}: {
  value: boolean | null;
  error?: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <fieldset className="rounded-xl border border-border p-4">
      <legend className="px-1 text-sm font-semibold text-foreground">
        광고성 정보 수신 여부 <span className="text-danger">*</span>
      </legend>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        교육 프로그램, 신규 강의, 이벤트 및 서비스 홍보 정보를 이메일·문자·전화로
        받아보시겠습니까?
      </p>

      <div className="mt-3 space-y-2">
        {[
          { label: "동의합니다", v: true },
          { label: "동의하지 않습니다", v: false },
        ].map((option) => (
          <label
            key={String(option.v)}
            className={cn(
              // 라디오는 손가락으로 누르는 영역이 넓어야 한다 — 줄 전체를 터치 타깃으로 만든다.
              "flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors",
              value === option.v
                ? "border-primary bg-primary/5 font-medium text-foreground"
                : "border-border hover:bg-muted"
            )}
          >
            <input
              type="radio"
              name="marketingConsent"
              checked={value === option.v}
              onChange={() => onChange(option.v)}
              className="size-4 accent-[var(--color-primary)]"
            />
            {option.label}
          </label>
        ))}
      </div>

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}

      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        동의하지 않아도 수업을 듣는 데 아무 지장이 없습니다. 휴강·일정 변경·계정 및 보안 안내 등
        <span className="font-medium text-foreground"> 수업 운영에 필요한 연락</span>은 이 설정과
        무관하게 발송됩니다.
      </p>
    </fieldset>
  );
}

/** 두 화면이 같은 규칙으로 검증하도록 여기 모아둔다. */
export function validateProfileForm(values: ProfileFormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.fullName.trim()) errors.fullName = "이름을 입력해주세요.";
  if (values.marketingConsent === null) {
    errors.marketingConsent = "수신 여부를 선택해주세요.";
  }
  return errors;
}
