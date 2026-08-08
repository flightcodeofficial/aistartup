// Community Repository 인터페이스 (Repository Pattern)
//
// 지금은 LocalCommunityRepository(IndexedDB + BroadcastChannel)가 이 인터페이스를 구현한다.
// 나중에 실제 서비스로 확장할 때는 SupabaseCommunityRepository를 새로 만들어
// features/community/index.ts의 export 한 줄만 바꾸면 된다.
// UI 컴포넌트는 항상 이 인터페이스(타입)만 참조하고, 구현체를 직접 import하지 않는다.

import type {
  AppNotification,
  Booking,
  Comment,
  DirectMessage,
  MessageThread,
  Payment,
  Post,
  PostCategory,
} from "./types";

export type Unsubscribe = () => void;

export interface CommunityRepository {
  readonly name: string;

  // 게시판 (실시간 구독 가능 — Supabase Realtime으로 교체될 지점)
  listPosts(category?: PostCategory): Promise<Post[]>;
  getPost(postId: string): Promise<Post | undefined>;
  createPost(input: { title: string; body: string; category: PostCategory }): Promise<Post>;
  subscribePosts(callback: () => void): Unsubscribe;

  // 댓글
  listComments(postId: string): Promise<Comment[]>;
  createComment(input: { postId: string; body: string; isAI?: boolean }): Promise<Comment>;

  // AI 멘토 — "질문하기" 글에 AI가 먼저 답변하고, 해결 안 되면 강사에게 에스컬레이션
  askAIMentor(postId: string): Promise<Comment>;
  escalateToInstructor(postId: string): Promise<void>;

  // 좋아요
  hasLiked(postId: string): Promise<boolean>;
  toggleLike(postId: string): Promise<{ liked: boolean; likeCount: number }>;

  // 알림
  listNotifications(): Promise<AppNotification[]>;
  markNotificationRead(notificationId: string): Promise<void>;
  unreadNotificationCount(): Promise<number>;

  // DM
  listThreads(): Promise<MessageThread[]>;
  listMessages(threadId: string): Promise<DirectMessage[]>;
  sendMessage(input: { threadId: string; body: string }): Promise<DirectMessage>;

  // 예약
  listBookings(): Promise<Booking[]>;
  createBooking(input: { slotLabel: string; note?: string }): Promise<Booking>;
  cancelBooking(bookingId: string): Promise<void>;
  confirmBooking(bookingId: string): Promise<void>;

  // 결제 (스키마만 — 실제 결제 처리는 구현하지 않음)
  listPayments(): Promise<Payment[]>;
}
