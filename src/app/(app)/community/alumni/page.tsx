import { GraduationCap } from "lucide-react";

// 수료생(Alumni) 커뮤니티 — 추후 과정을 수료한 학생들이 계속 연결되는 공간.
// 지금은 라우팅과 자리만 확보해두고, 실제 수료 조건·전용 게시판 로직은
// features/community의 Repository 패턴을 그대로 확장해 구현할 예정이다.
export default function AlumniPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-8 sm:py-10">
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card px-6 py-20 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <GraduationCap className="size-6" />
        </div>
        <h1 className="mt-5 text-xl font-bold text-foreground">수료생 커뮤니티</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          과정을 수료한 뒤에도 계속 연결될 수 있는 공간을 준비하고 있습니다. 라우팅과 저장
          구조는 미리 마련해두었고, 수료 조건이 정해지면 바로 열립니다.
        </p>
        <p className="mt-4 text-xs font-medium text-muted-foreground">곧 공개됩니다</p>
      </div>
    </div>
  );
}
