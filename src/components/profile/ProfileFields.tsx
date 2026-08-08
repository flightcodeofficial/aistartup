"use client";

import { formatPhoneWhileTyping, type ProfileFormValues } from "@/features/profile/types";
import {
  composeRegion,
  districtsOf,
  parseRegion,
  REGION_NAMES,
} from "@/features/profile/regions";
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

      <RegionField value={values.region} onChange={(region) => onChange({ region })} />

      <MarketingConsentField
        value={values.marketingConsent}
        error={errors.marketingConsent}
        onChange={(marketingConsent) => onChange({ marketingConsent })}
      />
    </div>
  );
}

/**
 * 지역 — 광역(시·도) 고르면 그 아래 기초(시·군·구)가 채워진다.
 *
 * 밖으로는 "광주 서구" 같은 문자열 하나로만 오간다. 저장 형식을 단순하게 둬야
 * 나중에 해외 사용자가 들어와도 DB 스키마를 안 바꾼다.
 */
function RegionField({
  value,
  onChange,
}: {
  value: string;
  onChange: (composed: string) => void;
}) {
  const { region, district } = parseRegion(value);
  const districts = districtsOf(region);

  return (
    <div>
      <Label htmlFor="region">지역 (선택)</Label>
      <div className="mt-1.5 grid grid-cols-2 gap-2">
        <select
          id="region"
          value={region}
          onChange={(e) => {
            // 시·도를 바꾸면 이전 구는 의미가 없으므로 같이 비운다.
            onChange(composeRegion(e.target.value, ""));
          }}
          className="h-12 w-full rounded-lg border border-border bg-background px-3 text-sm"
          aria-label="시·도"
        >
          <option value="">시·도 선택</option>
          {REGION_NAMES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select
          id="district"
          value={district}
          disabled={districts.length === 0}
          onChange={(e) => onChange(composeRegion(region, e.target.value))}
          className="h-12 w-full rounded-lg border border-border bg-background px-3 text-sm disabled:opacity-50"
          aria-label="시·군·구"
        >
          {/* 세종·해외처럼 하위가 없는 곳은 고를 게 없다는 걸 그대로 보여준다 */}
          <option value="">
            {region === ""
              ? "시·도 먼저"
              : districts.length === 0
                ? "하위 없음"
                : "시·군·구 선택"}
          </option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
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
