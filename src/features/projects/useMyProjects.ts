"use client";

import { useCallback, useEffect, useState } from "react";
import { projectRepository } from "./index";
import type { Project } from "./types";

export function useMyProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setProjects(await projectRepository.listMyProjects());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const unsubscribe = projectRepository.subscribeProjects(refresh);
    return unsubscribe;
  }, [refresh]);

  const createProject = useCallback(
    async (input: { title: string; summary: string }) => {
      await projectRepository.createProject(input);
      await refresh();
    },
    [refresh]
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      await projectRepository.deleteProject(projectId);
      await refresh();
    },
    [refresh]
  );

  return {
    projects,
    loading,
    createProject,
    deleteProject,
  };
}
