// routes.step/instructor는 시그니처를 (week, day, stepNumber)로 유지한 채,
// URL에 필요한 Lesson 번호는 curriculum 데이터에서 내부적으로 조회한다.
// 덕분에 Lesson 계층을 도입해도 기존 호출부(사이드바, 검색, 즐겨찾기 등)를 건드릴 필요가 없다.
import { findLessonForStep } from "@/features/curriculum/data";

function stepLessonNumber(week: number, day: number, stepNumber: number): number {
  return findLessonForStep(week, day, stepNumber)?.lessonNumber ?? 1;
}

export const routes = {
  dashboard: () => "/dashboard",
  day: (week: number, day: number) => `/week/${week}/day/${day}`,
  step: (week: number, day: number, stepNumber: number) =>
    `/week/${week}/day/${day}/lesson/${stepLessonNumber(week, day, stepNumber)}/step/${stepNumber}`,
  instructor: (week: number, day: number, stepNumber: number) =>
    `/instructor/week/${week}/day/${day}/lesson/${stepLessonNumber(week, day, stepNumber)}/step/${stepNumber}`,
  results: (week: number, day: number) => `/results/${week}/${day}`,

  /** Lesson Content Engine — PPT형 page01~pageNN (Step 흐름과 별개). */
  lessonPage: (week: number, day: number, lesson: number, page: number) =>
    `/week/${week}/day/${day}/lesson/${lesson}/page/${page}`,

  community: () => "/community",
  communityCategory: (category: string) => `/community?category=${encodeURIComponent(category)}`,
  communityPost: (postId: string) => `/community/${postId}`,
  communityNotifications: () => "/community/notifications",
  communityMessages: () => "/community/messages",
  communityBookings: () => "/community/bookings",
  communityAlumni: () => "/community/alumni",

  ideation: () => "/community/ideation",
  ideationSession: (sessionId: string) => `/community/ideation/${sessionId}`,

  projects: () => "/community/projects",
  /** 프로젝트 소유자의 Workspace Dashboard (섹션 편집/버전/파일/노트/공유설정). */
  project: (projectId: string) => `/dashboard/projects/${projectId}`,
  /** 다른 수강생이 공개 프로젝트를 읽기 전용으로 보는 화면. */
  projectPublicView: (projectId: string) => `/community/projects/${projectId}`,
  myProjects: () => "/dashboard/projects",

  resources: () => "/community/resources",
  assignments: () => "/community/assignments",

  mentor: () => "/mentor",
  mentorForProject: (projectId: string) => `/mentor?project=${projectId}`,

  instructorCrm: () => "/instructor/crm",
  instructorCrmStudent: (studentId: string) => `/instructor/crm/${studentId}`,

  /** 블록 기반 Lesson Studio(관리자). */
  adminCourses: () => "/admin/courses",
  adminLessonEdit: (lessonId: string) => `/admin/lessons/${lessonId}/edit`,
  adminLessonPreview: (lessonId: string) => `/admin/lessons/${lessonId}/preview`,

  /** 개인 저장공간(Workspace). */
  workspace: () => "/workspace",
  workspaceProject: (projectId: string) => `/workspace/projects/${projectId}`,
  workspaceArtifact: (projectId: string, artifactId: string) =>
    `/workspace/projects/${projectId}/artifacts/${artifactId}`,
};
