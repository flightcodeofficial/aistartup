import { MailX } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-8 sm:py-10">
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card px-6 py-20 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MailX className="size-6" />
        </div>
        <h1 className="mt-5 text-xl font-bold text-foreground">메시지(DM)</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          1:1 메시지는 실제 회원 계정 연결 이후 제공됩니다. 저장 구조는 이미 준비되어 있어
          로그인 기능이 붙으면 곧바로 열 수 있습니다.
        </p>
        <p className="mt-4 text-xs font-medium text-muted-foreground">곧 공개됩니다</p>
      </div>
    </div>
  );
}
