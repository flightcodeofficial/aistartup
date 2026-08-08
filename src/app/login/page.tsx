"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, Loader2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// 이메일 + 비밀번호 한 화면.
//
// 매직링크 대신 비밀번호를 쓰는 이유: 수업 중에는 로그인이 매번 메일 수신에 묶이면 안 된다
// (Supabase 기본 SMTP는 시간당 발송 제한이 있어 20명이 동시에 접속하면 막힌다).
//
// 역할(role)을 고르는 입력은 의도적으로 두지 않는다. 가입은 항상 student로 시작하고
// 승격은 관리자가 DB에서 한다.

type Mode = "sign-in" | "sign-up";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  // 가입에만 필요한 필수 동의. 광고 수신과는 별개이며, 광고 동의는 가입 조건이 아니다.
  const [termsAgreed, setTermsAgreed] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase 접속 정보가 설정되지 않았습니다.");
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace(next);
        router.refresh();
        return;
      }

      if (!termsAgreed) {
        setError("서비스 이용 및 개인정보 처리 동의가 필요합니다.");
        setBusy(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
      });
      if (error) throw error;

      // 프로젝트 설정에 따라 바로 로그인되기도 하고, 메일 확인이 필요하기도 하다.
      if (data.session) {
        router.replace(next);
        router.refresh();
      } else {
        setNotice("확인 메일을 보냈습니다. 메일의 링크를 눌러 가입을 완료해주세요.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-sm font-semibold text-foreground">로컬 모드로 실행 중입니다</p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Supabase 접속 정보가 없어 로그인 없이 이 브라우저에만 저장됩니다.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/dashboard">그냥 시작하기</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-6">
      <div>
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 h-12"
        />
      </div>
      <div>
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={6}
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1.5 h-12"
        />
        {mode === "sign-up" && (
          <p className="mt-1 text-[11px] text-muted-foreground">6자 이상으로 정해주세요.</p>
        )}
      </div>

      {mode === "sign-up" && (
        <label className="flex min-h-11 cursor-pointer items-start gap-2.5 rounded-lg border border-border p-3 text-xs leading-relaxed">
          <input
            type="checkbox"
            checked={termsAgreed}
            onChange={(e) => setTermsAgreed(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-[var(--color-primary)]"
          />
          <span>
            <span className="font-semibold text-danger">[필수]</span>{" "}
            <span className="font-medium text-foreground">서비스 이용 및 개인정보 처리 동의</span>
            <span className="mt-0.5 block text-muted-foreground">
              수업 운영과 결과물 관리, 문의 응대를 위해 이름·이메일·휴대폰 번호를 수집·이용합니다.
            </span>
          </span>
        </label>
      )}

      {error && (
        <p className="rounded-lg bg-danger/10 p-2.5 text-xs text-danger">{error}</p>
      )}
      {notice && (
        <p className="rounded-lg bg-success/10 p-2.5 text-xs text-success">{notice}</p>
      )}

      <Button type="submit" disabled={busy} className="min-h-11 w-full gap-1.5">
        {busy && <Loader2 className="size-4 animate-spin" />}
        {mode === "sign-in" ? "로그인" : "가입하고 시작하기"}
      </Button>

      <button
        type="button"
        onClick={() => {
          setMode((m) => (m === "sign-in" ? "sign-up" : "sign-in"));
          setError(null);
          setNotice(null);
        }}
        className="min-h-11 w-full text-center text-xs text-muted-foreground underline underline-offset-2"
      >
        {mode === "sign-in" ? "처음이신가요? 계정 만들기" : "이미 계정이 있어요"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <GraduationCap className="size-3.5" />
          AI 창업 스쿨
        </span>
        <h1 className="mt-3 text-2xl font-bold text-foreground">수업 계정으로 로그인</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          로그인하면 어느 PC에서든 같은 수업과 내 결과물을 이어서 볼 수 있습니다.
        </p>
      </div>

      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
