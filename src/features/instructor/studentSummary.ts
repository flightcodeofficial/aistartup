// Student CRM 데이터 집계.
// 지금은 로그인이 없어 "이 브라우저의 학생 한 명" 데이터만 모을 수 있다.
// 여러 학생 인증이 붙으면 이 파일의 조회 범위만 userId 파라미터 기준으로 넓히면 되고,
// UI(목록/상세 페이지)는 그대로 재사용된다.

import { communityRepository } from "@/features/community";
import { getCurrentUser } from "@/features/community/currentUser";
import { assignmentRepository } from "@/features/assignments";
import { projectRepository } from "@/features/projects";
import { getAllStepIdsForWeek, getStep } from "@/features/curriculum/data";
import { useProgressStore, calcProgressPercent } from "@/features/progress/store";
import type { Booking, Post } from "@/features/community/types";
import type { AssignmentSubmission } from "@/features/assignments/types";
import type { DiagnosisReport, Project, ProjectFeedback, ProjectNote } from "@/features/projects/types";

export interface StudentSummary {
  studentId: string;
  nickname: string;
  overallPercent: number;
  lastStepLabel: string;
  lastActiveAt: number;
  openQuestionCount: number;
  pendingSubmissionCount: number;
  pendingBookingCount: number;
  projectCount: number;
  aiUsageCount: number;
  noteCount: number;
  flag: "attention" | "excellent" | "normal";
}

export type TimelineEventType =
  | "post"
  | "submission"
  | "booking"
  | "note"
  | "diagnosis"
  | "feedback"
  | "project";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  label: string;
  at: number;
  href?: string;
}

export interface StudentDetail {
  summary: StudentSummary;
  projects: Project[];
  openQuestions: Post[];
  submissions: AssignmentSubmission[];
  bookings: Booking[];
  notes: (ProjectNote & { projectTitle: string })[];
  feedback: (ProjectFeedback & { projectTitle: string })[];
  diagnoses: (DiagnosisReport & { projectTitle: string })[];
  timeline: TimelineEvent[];
}

async function loadPerProjectData(projects: Project[]) {
  const notes: (ProjectNote & { projectTitle: string })[] = [];
  const feedback: (ProjectFeedback & { projectTitle: string })[] = [];
  const diagnoses: (DiagnosisReport & { projectTitle: string })[] = [];

  await Promise.all(
    projects.map(async (p) => {
      const [n, f, d] = await Promise.all([
        projectRepository.listNotes(p.id),
        projectRepository.listFeedback(p.id),
        projectRepository.listDiagnoses(p.id),
      ]);
      notes.push(...n.map((x) => ({ ...x, projectTitle: p.title })));
      feedback.push(...f.map((x) => ({ ...x, projectTitle: p.title })));
      diagnoses.push(...d.map((x) => ({ ...x, projectTitle: p.title })));
    })
  );

  return { notes, feedback, diagnoses };
}

export async function loadStudentDetail(): Promise<StudentDetail> {
  const user = getCurrentUser();
  const [allPosts, submissions, bookings, projects] = await Promise.all([
    communityRepository.listPosts(),
    assignmentRepository.listAllSubmissions(),
    communityRepository.listBookings(),
    projectRepository.listMyProjects(),
  ]);

  const myPosts = allPosts.filter((p) => p.authorId === user.id);
  const openQuestions = myPosts.filter((p) => p.category === "질문하기" && p.needsInstructor);
  const pendingSubmissions = submissions.filter((s) => s.status === "submitted");
  const pendingBookings = bookings.filter((b) => b.status === "requested");

  const { notes, feedback, diagnoses } = await loadPerProjectData(projects);

  const steps = useProgressStore.getState().steps;
  const lastPosition = useProgressStore.getState().lastPosition;
  const allStepIds = getAllStepIdsForWeek(lastPosition.week);
  const overallPercent = calcProgressPercent(steps, allStepIds);
  const lastStep = getStep(lastPosition.week, lastPosition.day, lastPosition.stepNumber);

  const timestamps = [
    ...myPosts.map((p) => p.createdAt),
    ...submissions.map((s) => s.createdAt),
    ...bookings.map((b) => b.createdAt),
    ...projects.map((p) => p.updatedAt),
    ...notes.map((n) => n.updatedAt),
    ...diagnoses.map((d) => d.createdAt),
  ];
  const lastActiveAt = timestamps.length > 0 ? Math.max(...timestamps) : Date.now();

  const flag: StudentSummary["flag"] =
    openQuestions.length > 0 || pendingBookings.length > 0
      ? "attention"
      : overallPercent >= 80 && projects.length > 0
        ? "excellent"
        : "normal";

  const summary: StudentSummary = {
    studentId: user.id,
    nickname: user.nickname,
    overallPercent,
    lastStepLabel: lastStep ? `Day${lastPosition.day} STEP${lastStep.stepNumber} · ${lastStep.title}` : "-",
    lastActiveAt,
    openQuestionCount: openQuestions.length,
    pendingSubmissionCount: pendingSubmissions.length,
    pendingBookingCount: pendingBookings.length,
    projectCount: projects.length,
    aiUsageCount: diagnoses.length,
    noteCount: notes.length,
    flag,
  };

  const timeline: TimelineEvent[] = [
    ...myPosts.map((p) => ({
      id: `post-${p.id}`,
      type: "post" as const,
      label: `[${p.category}] ${p.title}`,
      at: p.createdAt,
      href: `/community/${p.id}`,
    })),
    ...submissions.map((s) => ({
      id: `submission-${s.id}`,
      type: "submission" as const,
      label: `과제 제출: ${s.title}`,
      at: s.createdAt,
    })),
    ...bookings.map((b) => ({
      id: `booking-${b.id}`,
      type: "booking" as const,
      label: `컨설팅 예약: ${b.slotLabel} (${b.status})`,
      at: b.createdAt,
    })),
    ...notes.map((n) => ({
      id: `note-${n.id}`,
      type: "note" as const,
      label: `[${n.projectTitle}] 노트 작성`,
      at: n.updatedAt,
    })),
    ...diagnoses.map((d) => ({
      id: `diagnosis-${d.id}`,
      type: "diagnosis" as const,
      label: `[${d.projectTitle}] AI 진단 실행`,
      at: d.createdAt,
    })),
    ...feedback.map((f) => ({
      id: `feedback-${f.id}`,
      type: "feedback" as const,
      label: `[${f.projectTitle}] 강사 피드백 수신`,
      at: f.createdAt,
    })),
    ...projects.map((p) => ({
      id: `project-${p.id}`,
      type: "project" as const,
      label: `프로젝트 "${p.title}" 수정`,
      at: p.updatedAt,
      href: `/dashboard/projects/${p.id}`,
    })),
  ].sort((a, b) => b.at - a.at);

  return { summary, projects, openQuestions, submissions: pendingSubmissions, bookings: pendingBookings, notes, feedback, diagnoses, timeline };
}
