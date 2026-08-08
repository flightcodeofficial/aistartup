"use client";

import { useCallback, useEffect, useState } from "react";
import { projectRepository } from "./index";
import type {
  DiagnosisReport,
  Project,
  ProjectArtifacts,
  ProjectComment,
  ProjectFeedback,
  ProjectFile,
  ProjectNote,
  ProjectShareMode,
  ProjectVisibility,
} from "./types";

export function useProjectDetail(projectId: string) {
  const [project, setProject] = useState<Project | undefined>(undefined);
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [feedback, setFeedback] = useState<ProjectFeedback[]>([]);
  const [notes, setNotes] = useState<ProjectNote[]>([]);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [diagnoses, setDiagnoses] = useState<DiagnosisReport[]>([]);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [p, c, f, n, fl, d, l] = await Promise.all([
      projectRepository.getProject(projectId),
      projectRepository.listComments(projectId),
      projectRepository.listFeedback(projectId),
      projectRepository.listNotes(projectId),
      projectRepository.listFiles(projectId),
      projectRepository.listDiagnoses(projectId),
      projectRepository.hasLiked(projectId),
    ]);
    setProject(p);
    setComments(c);
    setFeedback(f);
    setNotes(n);
    setFiles(fl);
    setDiagnoses(d);
    setLiked(l);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    refresh();
    const unsubscribe = projectRepository.subscribeProjects(refresh);
    return unsubscribe;
  }, [refresh]);

  const updateDraft = useCallback(
    async (patch: Partial<ProjectArtifacts>) => {
      await projectRepository.updateDraft(projectId, patch);
      await refresh();
    },
    [projectId, refresh]
  );

  const commitVersion = useCallback(
    async (note: string) => {
      await projectRepository.commitVersion(projectId, note);
      await refresh();
    },
    [projectId, refresh]
  );

  const setVisibility = useCallback(
    async (visibility: ProjectVisibility) => {
      await projectRepository.setVisibility(projectId, visibility);
      await refresh();
    },
    [projectId, refresh]
  );

  const setShareSettings = useCallback(
    async (shareMode: ProjectShareMode, publicFieldKeys: (keyof ProjectArtifacts)[]) => {
      await projectRepository.setShareSettings(projectId, shareMode, publicFieldKeys);
      await refresh();
    },
    [projectId, refresh]
  );

  const toggleLike = useCallback(async () => {
    const result = await projectRepository.toggleLike(projectId);
    setLiked(result.liked);
    setProject((prev) => (prev ? { ...prev, likeCount: result.likeCount } : prev));
  }, [projectId]);

  const addComment = useCallback(
    async (body: string) => {
      await projectRepository.addComment({ projectId, body });
      await refresh();
    },
    [projectId, refresh]
  );

  const addFeedback = useCallback(
    async (versionNumber: number, body: string, authorNickname: string, field?: keyof ProjectArtifacts) => {
      await projectRepository.addFeedback({ projectId, versionNumber, body, authorNickname, field });
      await refresh();
    },
    [projectId, refresh]
  );

  const replyFeedback = useCallback(
    async (feedbackId: string, reply: string) => {
      await projectRepository.replyFeedback(feedbackId, reply);
      await refresh();
    },
    [refresh]
  );

  const addNote = useCallback(
    async (body: string) => {
      await projectRepository.addNote(projectId, body);
      await refresh();
    },
    [projectId, refresh]
  );

  const deleteNote = useCallback(
    async (noteId: string) => {
      await projectRepository.deleteNote(noteId);
      await refresh();
    },
    [refresh]
  );

  const uploadFile = useCallback(
    async (file: globalThis.File) => {
      await projectRepository.uploadFile(projectId, file);
      await refresh();
    },
    [projectId, refresh]
  );

  const downloadFile = useCallback(async (fileId: string) => {
    await projectRepository.downloadFile(fileId);
  }, []);

  const deleteFile = useCallback(
    async (fileId: string) => {
      await projectRepository.deleteFile(fileId);
      await refresh();
    },
    [refresh]
  );

  return {
    project,
    comments,
    feedback,
    notes,
    files,
    diagnoses,
    liked,
    loading,
    updateDraft,
    commitVersion,
    setVisibility,
    setShareSettings,
    toggleLike,
    addComment,
    addFeedback,
    replyFeedback,
    addNote,
    deleteNote,
    uploadFile,
    downloadFile,
    deleteFile,
    refresh,
  };
}
