// Community + CRM 확장 영역 데이터 모델
// 지금은 로컬(IndexedDB) 구현으로 동작하지만, 나중에 Supabase로 교체할 때
// 이 타입과 features/community/repository.ts의 인터페이스는 그대로 유지된다.

export interface UserProfile {
  id: string;
  nickname: string;
  avatarColor: string;
  createdAt: number;
}

// Community 게시판 3분류. 프로젝트공유/자료실/과제제출/컨설팅예약은
// 각각 별도 데이터 모델(features/projects, features/resources, features/assignments)로 분리되어 있다.
export type PostCategory = "공지사항" | "질문하기" | "학습토론";

export interface Post {
  id: string;
  authorId: string;
  authorNickname: string;
  category: PostCategory;
  title: string;
  body: string;
  likeCount: number;
  commentCount: number;
  /** "질문하기" 글에서 AI 답변으로 해결되지 않아 강사에게 에스컬레이션된 경우 true */
  needsInstructor?: boolean;
  createdAt: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorNickname: string;
  body: string;
  /** AI 멘토가 자동으로 남긴 첫 답변인지 여부 */
  isAI?: boolean;
  createdAt: number;
}

export interface Like {
  id: string; // `${postId}:${userId}`
  postId: string;
  userId: string;
  createdAt: number;
}

export type NotificationType = "comment" | "like" | "system";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  relatedPostId?: string;
  read: boolean;
  createdAt: number;
}

export interface MessageThread {
  id: string;
  participantIds: string[];
  lastMessageAt: number;
  lastMessagePreview: string;
}

export interface DirectMessage {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  createdAt: number;
}

export type BookingStatus = "requested" | "confirmed" | "cancelled";

export interface Booking {
  id: string;
  userId: string;
  slotLabel: string;
  status: BookingStatus;
  note?: string;
  createdAt: number;
}

export type PaymentStatus = "pending" | "paid" | "refunded";

/** 결제 스키마만 정의해둔다. 실제 결제 처리는 이 앱에서 구현하지 않는다. */
export interface Payment {
  id: string;
  userId: string;
  relatedBookingId?: string;
  amount: number;
  currency: "KRW";
  status: PaymentStatus;
  createdAt: number;
}
