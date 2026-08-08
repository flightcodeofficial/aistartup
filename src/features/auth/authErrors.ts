// Supabase가 돌려주는 인증 오류를 사람이 읽을 수 있는 한국어로 바꾼다.
//
// 그냥 두면 화면에 "User already registered" 같은 영어가 그대로 뜬다.
// 수강생 입장에서는 "이상한 에러"일 뿐이고, 무엇을 해야 하는지도 알 수 없다.
//
// 원칙: 무슨 일이 있었는지 + 다음에 뭘 하면 되는지를 한 문장에 담는다.

export interface AuthErrorInfo {
  message: string;
  /** 이미 가입된 계정이면 로그인 화면으로 넘길 수 있게 표시한다. */
  suggestSignIn?: boolean;
}

export function translateAuthError(error: unknown): AuthErrorInfo {
  const raw = error instanceof Error ? error.message : String(error ?? "");
  const lower = raw.toLowerCase();

  if (lower.includes("already registered") || lower.includes("already been registered")) {
    return {
      message: "이미 가입된 이메일입니다. 로그인해주세요.",
      suggestSignIn: true,
    };
  }
  if (lower.includes("invalid login credentials")) {
    return { message: "이메일 또는 비밀번호가 맞지 않습니다. 다시 확인해주세요." };
  }
  if (lower.includes("email not confirmed")) {
    return { message: "메일함에서 인증 링크를 눌러 가입을 완료해주세요." };
  }
  if (lower.includes("password should be at least")) {
    const digits = raw.match(/\d+/);
    return { message: `비밀번호는 ${digits ? digits[0] : "6"}자 이상이어야 합니다.` };
  }
  if (lower.includes("weak password") || lower.includes("password is too weak")) {
    return { message: "비밀번호가 너무 단순합니다. 영문·숫자를 섞어 6자 이상으로 만들어주세요." };
  }
  if (lower.includes("is invalid") || lower.includes("unable to validate email")) {
    return { message: "이메일 주소 형식을 다시 확인해주세요." };
  }
  // 짧은 시간에 여러 번 시도하면 Supabase가 잠시 막는다.
  if (lower.includes("for security purposes") || lower.includes("rate limit") || lower.includes("too many")) {
    const digits = raw.match(/\d+/);
    return {
      message: digits
        ? `요청이 너무 잦습니다. ${digits[0]}초 뒤에 다시 시도해주세요.`
        : "요청이 너무 잦습니다. 잠시 뒤에 다시 시도해주세요.",
    };
  }
  if (lower.includes("failed to fetch") || lower.includes("network")) {
    return { message: "네트워크 연결을 확인한 뒤 다시 시도해주세요." };
  }
  if (lower.includes("signups not allowed") || lower.includes("signup is disabled")) {
    return { message: "현재 신규 가입이 막혀 있습니다. 담당자에게 문의해주세요." };
  }

  // 모르는 오류는 감추지 않는다 — 문의할 때 근거가 되어야 한다.
  return { message: raw || "처리하지 못했습니다. 잠시 뒤 다시 시도해주세요." };
}
