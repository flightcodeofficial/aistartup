export type SubmissionStatus = "submitted" | "reviewed";

export interface AssignmentSubmission {
  id: string;
  studentId: string;
  studentNickname: string;
  title: string;
  content: string;
  relatedLabel?: string; // 예: "Day1 STEP4"
  status: SubmissionStatus;
  reviewNote?: string;
  createdAt: number;
}
