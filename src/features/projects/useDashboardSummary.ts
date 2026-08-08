"use client";

import { useEffect, useState } from "react";
import { projectRepository } from "./index";
import { ARTIFACT_FIELD_ORDER, ARTIFACT_LABELS } from "./types";
import type { Project, ProjectFeedback } from "./types";
import { communityRepository } from "@/features/community";
import type { Post } from "@/features/community/types";
import { getCurrentUser } from "@/features/community/currentUser";
import { diagnoseProject } from "@/features/mentor/mockDiagnose";

export interface DashboardSummary {
  loading: boolean;
  primaryProject?: Project;
  recentProjects: Project[];
  progressPercent: number;
  todos: string[];
  aiRecommendation: string;
  recentQuestion?: Post;
  recentFeedback?: ProjectFeedback & { projectTitle: string };
  recentSaveAt?: number;
}

const EMPTY: DashboardSummary = {
  loading: true,
  recentProjects: [],
  progressPercent: 0,
  todos: [],
  aiRecommendation: "",
};

export function useDashboardSummary(): DashboardSummary {
  const [state, setState] = useState<DashboardSummary>(EMPTY);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const user = getCurrentUser();
      const projects = await projectRepository.listMyProjects();
      const primary = projects.find((p) => p.isPrimary) ?? projects[0];
      const recentProjects = projects.slice(0, 3);

      let progressPercent = 0;
      const todos: string[] = [];
      let aiRecommendation = "아직 프로젝트가 없습니다. Day1 STEP4를 완료하면 메인 프로젝트가 자동으로 생깁니다.";
      let recentFeedback: (ProjectFeedback & { projectTitle: string }) | undefined;

      if (primary) {
        const filled = ARTIFACT_FIELD_ORDER.filter((f) => primary.draftArtifacts[f]?.trim());
        progressPercent = Math.round((filled.length / ARTIFACT_FIELD_ORDER.length) * 100);
        const missing = ARTIFACT_FIELD_ORDER.filter((f) => !primary.draftArtifacts[f]?.trim());
        if (missing.length > 0) todos.push(`${ARTIFACT_LABELS[missing[0]]} 섹션 채우기`);

        aiRecommendation = diagnoseProject(primary, "full").nextPractice;

        const feedbackAll = await projectRepository.listFeedback(primary.id);
        if (feedbackAll.some((f) => !f.reply)) todos.push("강사 피드백에 답변하기");
        const latest = feedbackAll.at(-1);
        if (latest) recentFeedback = { ...latest, projectTitle: primary.title };
      }

      const posts = await communityRepository.listPosts("질문하기");
      const recentQuestion = posts.find((p) => p.authorId === user.id);

      if (todos.length === 0) todos.push("오늘의 STEP 이어하기");

      if (!cancelled) {
        setState({
          loading: false,
          primaryProject: primary,
          recentProjects,
          progressPercent,
          todos,
          aiRecommendation,
          recentQuestion,
          recentFeedback,
          recentSaveAt: primary?.updatedAt,
        });
      }
    };

    load();
    const unsubscribe = projectRepository.subscribeProjects(load);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return state;
}
