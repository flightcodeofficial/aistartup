"use client";

// Day1~5 실습 결과를 프로젝트 안으로 자동으로 모은다.
//
// 통합(STEP20) 이후 저장 대상은 canonical인 features/workspace 다.
// 예전에는 features/projects(레거시 고정필드 저장소)에 직접 썼는데, 그러면
// 통합 이후에도 레거시 저장소에 새 데이터가 계속 쌓여서(마이그레이션 이후에 생긴 데이터는
// 옮겨지지 않아) 결과물이 두 곳으로 갈라진다. 그래서 쓰기 경로를 workspace로 옮겼다.

import { useEffect, useRef, useState } from "react";
import { curriculum, findStepByKind } from "@/features/curriculum/data";
import { usePracticeStore } from "@/features/practice/store";
import { buildArtifactsFromDay1 } from "./fromDay1";
import type { ProjectArtifacts } from "./types";
import { workspaceRepository } from "@/features/workspace";
import { useActiveProjectStore } from "@/features/workspace/activeProjectStore";
import { LEGACY_FIELD_TO_ARTIFACT_TYPE } from "@/features/workspace/migration";

const FIELD_LABELS: Record<keyof ProjectArtifacts, string> = {
  icp: "ICP",
  ecp: "ECP",
  persona: "페르소나",
  journey: "고객 여정",
  valueProposition: "가치제안",
  landingPage: "랜딩페이지",
  marketing: "마케팅",
  ir: "IR",
  pitch: "피치",
  faq: "FAQ",
  businessModel: "비즈니스 모델",
  automation: "자동화",
};

export function useProjectAutoSync() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const lastSyncedHash = useRef<string>("");

  const profile = usePracticeStore((s) => s.profile);
  const analyses = usePracticeStore((s) => s.analyses);
  const valueProps = usePracticeStore((s) => s.valueProps);
  const activeProjectId = useActiveProjectStore((s) => s.activeProjectId);
  const setActiveProject = useActiveProjectStore((s) => s.setActiveProject);

  // 동기화 대상 결정: 활성 프로젝트가 있으면 그걸 쓰고, 없으면 첫 프로젝트를 쓰되
  // 프로젝트가 하나도 없을 때만 새로 만든다(자동 생성으로 프로젝트가 난립하지 않게).
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (activeProjectId) {
        const existing = await workspaceRepository.getProject(activeProjectId);
        if (existing) {
          if (!cancelled) setProjectId(existing.id);
          return;
        }
      }
      const projects = await workspaceRepository.listProjects();
      if (projects.length > 0) {
        if (!cancelled) setProjectId(projects[0].id);
        return;
      }
      const created = await workspaceRepository.createProject({
        title: profile.businessIdea || "내 창업 프로젝트",
        description: "수업 실습 결과가 자동으로 모이는 프로젝트입니다.",
      });
      if (!cancelled) {
        setProjectId(created.id);
        setActiveProject(created.id);
      }
    })().catch((error) => {
      // 서버가 잠깐 죽어도 앱이 멈추면 안 된다. 동기화만 쉬고 화면은 그대로 쓴다.
      console.warn("[projects] 자동 동기화 대상 결정 실패:", error);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProjectId]);

  useEffect(() => {
    if (!projectId) return;

    const patch: Partial<ProjectArtifacts> = {};
    for (const week of curriculum) {
      for (const day of week.days) {
        if (day.status !== "ready") continue;
        const analysisStep = findStepByKind(week.week, day.day, "fullAnalysis");
        const vpStep = findStepByKind(week.week, day.day, "valueProposition");
        const analysis = analysisStep ? analyses[analysisStep.id] : undefined;
        const vp = vpStep ? valueProps[vpStep.id] : undefined;
        if (!analysis) continue;
        Object.assign(patch, buildArtifactsFromDay1(analysis, vp));
      }
    }

    if (Object.keys(patch).length === 0) return;
    const hash = JSON.stringify(patch);
    if (hash === lastSyncedHash.current) return;
    lastSyncedHash.current = hash;

    // 필드별로 artifact 하나씩. sourceBlockId를 고정 키로 써서 재동기화 시
    // 새 레코드가 쌓이지 않고 같은 artifact의 version만 올라간다.
    (async () => {
      for (const [field, content] of Object.entries(patch) as [keyof ProjectArtifacts, string][]) {
        if (!content?.trim()) continue;
        await workspaceRepository.saveArtifact({
          projectId,
          artifactType: LEGACY_FIELD_TO_ARTIFACT_TYPE[field],
          title: FIELD_LABELS[field],
          content,
          sourceBlockId: `autosync:${field}`,
        });
      }
    })();
  }, [projectId, analyses, valueProps]);

  return { primaryProjectId: projectId };
}
