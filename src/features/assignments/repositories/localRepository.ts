import { getLmsDb, LMS_STORES } from "@/lib/lmsDb";
import { getCurrentUser } from "@/features/community/currentUser";
import { broadcastCommunityChange, subscribeCommunityChange } from "@/features/community/realtimeChannel";
import type { AssignmentRepository, Unsubscribe } from "../repository";
import type { AssignmentSubmission } from "../types";

function randomId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function withDb<T>(
  fallback: T,
  fn: (db: NonNullable<Awaited<ReturnType<typeof getLmsDb>>>) => Promise<T>
): Promise<T> {
  const dbPromise = getLmsDb();
  if (!dbPromise) return fallback;
  const db = await dbPromise;
  return fn(db);
}

class LocalAssignmentRepository implements AssignmentRepository {
  readonly name = "Local IndexedDB Assignment Repository (데모용)";

  async listMySubmissions(): Promise<AssignmentSubmission[]> {
    const user = getCurrentUser();
    return withDb<AssignmentSubmission[]>([], async (db) => {
      const all = await db.getAll(LMS_STORES.assignments);
      return all
        .filter((a) => a.studentId === user.id)
        .sort((a, b) => b.createdAt - a.createdAt);
    });
  }

  async listAllSubmissions(): Promise<AssignmentSubmission[]> {
    return withDb<AssignmentSubmission[]>([], async (db) => {
      const all = await db.getAll(LMS_STORES.assignments);
      return all.sort((a, b) => b.createdAt - a.createdAt);
    });
  }

  async submit(input: {
    title: string;
    content: string;
    relatedLabel?: string;
  }): Promise<AssignmentSubmission> {
    const user = getCurrentUser();
    const submission: AssignmentSubmission = {
      id: randomId("assignment"),
      studentId: user.id,
      studentNickname: user.nickname,
      title: input.title,
      content: input.content,
      relatedLabel: input.relatedLabel,
      status: "submitted",
      createdAt: Date.now(),
    };
    await withDb(undefined, (db) => db.put(LMS_STORES.assignments, submission));
    broadcastCommunityChange("posts");
    return submission;
  }

  async markReviewed(id: string, reviewNote?: string): Promise<void> {
    await withDb(undefined, async (db) => {
      const submission = await db.get(LMS_STORES.assignments, id);
      if (submission) {
        submission.status = "reviewed";
        submission.reviewNote = reviewNote;
        await db.put(LMS_STORES.assignments, submission);
      }
    });
    broadcastCommunityChange("posts");
  }

  subscribe(callback: () => void): Unsubscribe {
    return subscribeCommunityChange("posts", callback);
  }
}

export const localAssignmentRepository = new LocalAssignmentRepository();
