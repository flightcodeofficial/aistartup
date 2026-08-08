// Assignment Repository 인터페이스 (Repository Pattern)
import type { AssignmentSubmission } from "./types";

export type Unsubscribe = () => void;

export interface AssignmentRepository {
  readonly name: string;
  listMySubmissions(): Promise<AssignmentSubmission[]>;
  listAllSubmissions(): Promise<AssignmentSubmission[]>; // 강사 CRM용
  submit(input: { title: string; content: string; relatedLabel?: string }): Promise<AssignmentSubmission>;
  markReviewed(id: string, reviewNote?: string): Promise<void>;
  subscribe(callback: () => void): Unsubscribe;
}
