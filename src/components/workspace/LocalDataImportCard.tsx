"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import {
  importLocalWorkspaceData,
  summarizeLocalData,
  type ImportReport,
  type LocalDataSummary,
} from "@/features/workspace/importLocalData";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useAuth } from "@/features/auth/AuthProvider";
import { Button } from "@/components/ui/button";

// 로그인한 뒤, 이 브라우저에만 있던 예전 작업을 서버로 올릴지 직접 고르게 한다.
// 가져올 게 없으면 아무것도 그리지 않는다(평소에 거슬리지 않게).

const DISMISS_KEY = "ai-school-local-import-dismissed";

export function LocalDataImportCard() {
  const { state } = useAuth();
  const [summary, setSummary] = useState<LocalDataSummary | null>(null);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || state.status !== "signed-in") return;
    setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");
    summarizeLocalData().then(setSummary);
  }, [state.status]);

  const runImport = useCallback(async () => {
    setBusy(true);
    try {
      setReport(await importLocalWorkspaceData());
    } finally {
      setBusy(false);
    }
  }, []);

  if (!isSupabaseConfigured || state.status !== "signed-in") return null;
  if (report) {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/5 p-4">
        <p className="text-sm font-semibold text-foreground">가져오기 완료</p>
        <p className="mt-1 text-xs text-muted-foreground">
          프로젝트 {report.projectsImported}개, 결과물 {report.artifactsImported}개를 계정으로
          옮겼습니다. 이미 있던 항목 {report.projectsSkipped + report.artifactsSkipped}개는
          건너뛰었습니다.
          {report.failures.length > 0 && ` 실패 ${report.failures.length}개.`}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          이 브라우저의 원본은 지우지 않았습니다. 그대로 백업으로 남아 있습니다.
        </p>
      </div>
    );
  }

  if (dismissed || !summary || summary.projects === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-sm font-semibold text-foreground">
        이 브라우저에 저장된 기존 작업이 있습니다
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        로그인 전에 만든 프로젝트 {summary.projects}개 · 결과물 {summary.artifacts}개.
        지금 계정으로 가져오면 다른 PC에서도 이어서 볼 수 있습니다.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={runImport} disabled={busy} className="min-h-11 gap-1.5 sm:min-h-9">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          기존 작업 {summary.projects}개 가져오기
        </Button>
        <Button
          variant="ghost"
          className="min-h-11 sm:min-h-9"
          onClick={() => {
            window.localStorage.setItem(DISMISS_KEY, "1");
            setDismissed(true);
          }}
        >
          나중에
        </Button>
      </div>
    </div>
  );
}
