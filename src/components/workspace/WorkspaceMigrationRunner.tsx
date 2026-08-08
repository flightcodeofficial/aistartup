"use client";

import { useEffect } from "react";
import { runLegacyProjectMigration } from "@/features/workspace/migration";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/** 앱 시작 시 1회 레거시 프로젝트 마이그레이션을 시도한다.
 *  이미 완료됐으면 아무 일도 하지 않고, 실패해도 레거시 원본은 그대로 남는다.
 *
 *  Supabase 모드에서는 돌리지 않는다 — 이 브라우저의 옛 데이터를 서버로 올릴지는
 *  로그인한 사용자가 "기존 작업 가져오기"로 직접 정한다(자동 강제 이관 금지). */
export function WorkspaceMigrationRunner() {
  useEffect(() => {
    if (isSupabaseConfigured) return;
    runLegacyProjectMigration()
      .then((report) => {
        if (!report.ran) return;
        if (report.projectsMigrated > 0 || report.artifactsCreated > 0) {
          console.info(
            `[workspace] 마이그레이션 완료 — 프로젝트 ${report.projectsMigrated}개, ` +
              `artifact ${report.artifactsCreated}개 생성, 건너뜀 ${report.skipped}, ` +
              `충돌 ${report.conflicts}, 실패 ${report.failures.length}`
          );
        }
        if (report.failures.length > 0) {
          console.warn("[workspace] 마이그레이션 실패 항목:", report.failures);
        }
      })
      .catch((error) => {
        // 마이그레이션 실패가 앱 로딩을 막지 않게 한다.
        console.warn("[workspace] 마이그레이션 실행 중 오류:", error);
      });
  }, []);

  return null;
}
