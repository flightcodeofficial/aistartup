"use client";

import { useCallback, useEffect, useState } from "react";
import { CloudUpload, Loader2 } from "lucide-react";
import {
  countLocalLessons,
  uploadLocalLessonsToSupabase,
  type LessonUploadReport,
} from "@/features/lesson-builder/uploadLocalLessons";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useAuth } from "@/features/auth/AuthProvider";
import { isStaff } from "@/features/auth/types";
import { Button } from "@/components/ui/button";

// Studio 상단에서 "이 브라우저에 만들어 둔 Lesson을 서버로 올리기".
// 강사/관리자에게만 보이고, 올릴 게 없으면 나타나지 않는다.

export function LessonUploadCard({ onDone }: { onDone?: () => void }) {
  const { state } = useAuth();
  const [count, setCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<LessonUploadReport | null>(null);

  const staff = state.status === "signed-in" && isStaff(state.user.role);

  useEffect(() => {
    if (!isSupabaseConfigured || !staff) return;
    countLocalLessons().then(setCount);
  }, [staff]);

  const run = useCallback(async () => {
    setBusy(true);
    try {
      const result = await uploadLocalLessonsToSupabase();
      setReport(result);
      onDone?.();
    } finally {
      setBusy(false);
    }
  }, [onDone]);

  if (!isSupabaseConfigured || !staff) return null;

  if (report) {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/5 p-4">
        <p className="text-sm font-semibold text-foreground">서버 업로드 완료</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Lesson {report.uploaded.length}개 업로드, 이미지 {report.assetsUploaded}개 이동, 이미
          있던 {report.skipped.length}개는 건너뜀
          {report.failures.length > 0 && `, 실패 ${report.failures.length}개`}.
        </p>
        {report.failures.length > 0 && (
          <ul className="mt-1.5 space-y-0.5 text-[11px] text-danger">
            {report.failures.map((f) => (
              <li key={f.lessonId}>
                {f.lessonId}: {f.reason}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  if (count === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-sm font-semibold text-foreground">
        이 브라우저에만 있는 Lesson {count}개
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        서버로 올리면 다른 PC에서도 편집할 수 있고, 학생에게 보입니다. 이미지도 함께 옮깁니다.
        이미 서버에 있는 Lesson은 덮어쓰지 않습니다.
      </p>
      <Button onClick={run} disabled={busy} className="mt-3 min-h-11 gap-1.5 sm:min-h-9">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <CloudUpload className="size-4" />}
        서버로 올리기
      </Button>
    </div>
  );
}
