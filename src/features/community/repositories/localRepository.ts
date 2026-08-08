import { getCommunityDb, STORES } from "@/lib/communityDb";
import { getCurrentUser } from "../currentUser";
import { broadcastCommunityChange, subscribeCommunityChange } from "../realtimeChannel";
import type { CommunityRepository, Unsubscribe } from "../repository";
import type {
  AppNotification,
  Booking,
  Comment,
  DirectMessage,
  MessageThread,
  Payment,
  Post,
  PostCategory,
} from "../types";

function randomId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function withDb<T>(fallback: T, fn: (db: NonNullable<Awaited<ReturnType<typeof getCommunityDb>>>) => Promise<T>): Promise<T> {
  const dbPromise = getCommunityDb();
  if (!dbPromise) return fallback;
  const db = await dbPromise;
  return fn(db);
}

class LocalCommunityRepository implements CommunityRepository {
  readonly name = "Local IndexedDB Repository (데모용)";

  // ---------- 게시판 ----------
  async listPosts(category?: PostCategory): Promise<Post[]> {
    return withDb<Post[]>([], async (db) => {
      const all = await db.getAll(STORES.posts);
      const filtered = category ? all.filter((p) => p.category === category) : all;
      return filtered.sort((a, b) => b.createdAt - a.createdAt);
    });
  }

  async getPost(postId: string): Promise<Post | undefined> {
    return withDb<Post | undefined>(undefined, (db) => db.get(STORES.posts, postId));
  }

  async createPost(input: { title: string; body: string; category: PostCategory }): Promise<Post> {
    const user = getCurrentUser();
    const post: Post = {
      id: randomId("post"),
      authorId: user.id,
      authorNickname: user.nickname,
      category: input.category,
      title: input.title,
      body: input.body,
      likeCount: 0,
      commentCount: 0,
      createdAt: Date.now(),
    };
    await withDb(undefined, (db) => db.put(STORES.posts, post));
    broadcastCommunityChange("posts");
    return post;
  }

  subscribePosts(callback: () => void): Unsubscribe {
    return subscribeCommunityChange("posts", callback);
  }

  // ---------- 댓글 ----------
  async listComments(postId: string): Promise<Comment[]> {
    return withDb<Comment[]>([], async (db) => {
      const all = await db.getAllFromIndex(STORES.comments, "by-postId", postId);
      return all.sort((a, b) => a.createdAt - b.createdAt);
    });
  }

  async createComment(input: { postId: string; body: string; isAI?: boolean }): Promise<Comment> {
    const user = getCurrentUser();
    const comment: Comment = {
      id: randomId("comment"),
      postId: input.postId,
      authorId: input.isAI ? "ai-mentor" : user.id,
      authorNickname: input.isAI ? "AI 멘토" : user.nickname,
      body: input.body,
      isAI: input.isAI,
      createdAt: Date.now(),
    };
    await withDb(undefined, async (db) => {
      await db.put(STORES.comments, comment);
      const post = await db.get(STORES.posts, input.postId);
      if (post) {
        post.commentCount += 1;
        await db.put(STORES.posts, post);
      }
      if (!input.isAI && post && post.authorId !== user.id) {
        const notification: AppNotification = {
          id: randomId("noti"),
          userId: post.authorId,
          type: "comment",
          message: `"${post.title}" 글에 새 댓글이 달렸습니다.`,
          relatedPostId: input.postId,
          read: false,
          createdAt: Date.now(),
        };
        await db.put(STORES.notifications, notification);
        broadcastCommunityChange("notifications");
      }
    });
    broadcastCommunityChange("posts");
    broadcastCommunityChange("comments");
    return comment;
  }

  // ---------- AI 멘토 ----------
  async askAIMentor(postId: string): Promise<Comment> {
    const post = await this.getPost(postId);
    const { mockMentorAnswer } = await import("../ai/mockMentor");
    const answer = mockMentorAnswer(post?.title ?? "", post?.body ?? "");
    return this.createComment({ postId, body: answer, isAI: true });
  }

  async escalateToInstructor(postId: string): Promise<void> {
    await withDb(undefined, async (db) => {
      const post = await db.get(STORES.posts, postId);
      if (post) {
        post.needsInstructor = true;
        await db.put(STORES.posts, post);
      }
    });
    broadcastCommunityChange("posts");
  }

  // ---------- 좋아요 ----------
  private likeKey(postId: string, userId: string) {
    return `${postId}:${userId}`;
  }

  async hasLiked(postId: string): Promise<boolean> {
    const user = getCurrentUser();
    return withDb<boolean>(false, async (db) => {
      const like = await db.get(STORES.likes, this.likeKey(postId, user.id));
      return Boolean(like);
    });
  }

  async toggleLike(postId: string): Promise<{ liked: boolean; likeCount: number }> {
    const user = getCurrentUser();
    const result = await withDb<{ liked: boolean; likeCount: number }>(
      { liked: false, likeCount: 0 },
      async (db) => {
        const key = this.likeKey(postId, user.id);
        const existing = await db.get(STORES.likes, key);
        const post = await db.get(STORES.posts, postId);

        if (existing) {
          await db.delete(STORES.likes, key);
          if (post) {
            post.likeCount = Math.max(0, post.likeCount - 1);
            await db.put(STORES.posts, post);
          }
          return { liked: false, likeCount: post?.likeCount ?? 0 };
        }

        await db.put(STORES.likes, { id: key, postId, userId: user.id, createdAt: Date.now() });
        if (post) {
          post.likeCount += 1;
          await db.put(STORES.posts, post);
          if (post.authorId !== user.id) {
            const notification: AppNotification = {
              id: randomId("noti"),
              userId: post.authorId,
              type: "like",
              message: `"${post.title}" 글에 좋아요를 받았습니다.`,
              relatedPostId: postId,
              read: false,
              createdAt: Date.now(),
            };
            await db.put(STORES.notifications, notification);
            broadcastCommunityChange("notifications");
          }
        }
        return { liked: true, likeCount: post?.likeCount ?? 1 };
      }
    );
    broadcastCommunityChange("posts");
    return result;
  }

  // ---------- 알림 ----------
  async listNotifications(): Promise<AppNotification[]> {
    const user = getCurrentUser();
    return withDb<AppNotification[]>([], async (db) => {
      const all = await db.getAll(STORES.notifications);
      return all
        .filter((n) => n.userId === user.id)
        .sort((a, b) => b.createdAt - a.createdAt);
    });
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    await withDb(undefined, async (db) => {
      const n = await db.get(STORES.notifications, notificationId);
      if (n) {
        n.read = true;
        await db.put(STORES.notifications, n);
      }
    });
    broadcastCommunityChange("notifications");
  }

  async unreadNotificationCount(): Promise<number> {
    const list = await this.listNotifications();
    return list.filter((n) => !n.read).length;
  }

  // ---------- DM ----------
  async listThreads(): Promise<MessageThread[]> {
    const user = getCurrentUser();
    return withDb<MessageThread[]>([], async (db) => {
      const all = await db.getAll(STORES.threads);
      return all
        .filter((t) => t.participantIds.includes(user.id))
        .sort((a, b) => b.lastMessageAt - a.lastMessageAt);
    });
  }

  async listMessages(threadId: string): Promise<DirectMessage[]> {
    return withDb<DirectMessage[]>([], async (db) => {
      const all = await db.getAllFromIndex(STORES.messages, "by-threadId", threadId);
      return all.sort((a, b) => a.createdAt - b.createdAt);
    });
  }

  async sendMessage(input: { threadId: string; body: string }): Promise<DirectMessage> {
    const user = getCurrentUser();
    const message: DirectMessage = {
      id: randomId("msg"),
      threadId: input.threadId,
      senderId: user.id,
      body: input.body,
      createdAt: Date.now(),
    };
    await withDb(undefined, async (db) => {
      await db.put(STORES.messages, message);
      const thread = await db.get(STORES.threads, input.threadId);
      if (thread) {
        thread.lastMessageAt = message.createdAt;
        thread.lastMessagePreview = input.body.slice(0, 60);
        await db.put(STORES.threads, thread);
      }
    });
    broadcastCommunityChange("messages");
    return message;
  }

  // ---------- 예약 ----------
  async listBookings(): Promise<Booking[]> {
    const user = getCurrentUser();
    return withDb<Booking[]>([], async (db) => {
      const all = await db.getAll(STORES.bookings);
      return all.filter((b) => b.userId === user.id).sort((a, b) => b.createdAt - a.createdAt);
    });
  }

  async createBooking(input: { slotLabel: string; note?: string }): Promise<Booking> {
    const user = getCurrentUser();
    const booking: Booking = {
      id: randomId("booking"),
      userId: user.id,
      slotLabel: input.slotLabel,
      note: input.note,
      status: "requested",
      createdAt: Date.now(),
    };
    await withDb(undefined, (db) => db.put(STORES.bookings, booking));
    broadcastCommunityChange("bookings");
    return booking;
  }

  async cancelBooking(bookingId: string): Promise<void> {
    await withDb(undefined, async (db) => {
      const booking = await db.get(STORES.bookings, bookingId);
      if (booking) {
        booking.status = "cancelled";
        await db.put(STORES.bookings, booking);
      }
    });
    broadcastCommunityChange("bookings");
  }

  async confirmBooking(bookingId: string): Promise<void> {
    await withDb(undefined, async (db) => {
      const booking = await db.get(STORES.bookings, bookingId);
      if (booking) {
        booking.status = "confirmed";
        await db.put(STORES.bookings, booking);
        const notification: AppNotification = {
          id: randomId("noti"),
          userId: booking.userId,
          type: "system",
          message: `"${booking.slotLabel}" 예약이 강사에 의해 승인되었습니다.`,
          read: false,
          createdAt: Date.now(),
        };
        await db.put(STORES.notifications, notification);
        broadcastCommunityChange("notifications");
      }
    });
    broadcastCommunityChange("bookings");
  }

  // ---------- 결제 (스키마만) ----------
  async listPayments(): Promise<Payment[]> {
    const user = getCurrentUser();
    return withDb<Payment[]>([], async (db) => {
      const all = await db.getAll(STORES.payments);
      return all.filter((p) => p.userId === user.id).sort((a, b) => b.createdAt - a.createdAt);
    });
  }
}

export const localCommunityRepository = new LocalCommunityRepository();
