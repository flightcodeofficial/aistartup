// 로컬(같은 브라우저 내 여러 탭) 실시간 동기화.
// Supabase Realtime으로 교체되기 전까지, 게시글 변경을 BroadcastChannel로 알려
// 다른 탭이 즉시 다시 불러오게 한다. 구독 시그니처(subscribePosts)는
// Supabase 채널 구독과 동일한 모양(콜백 등록 → unsubscribe 함수 반환)으로 맞춰뒀다.

export type CommunityChangeKind = "posts" | "comments" | "notifications" | "messages" | "bookings";

const CHANNEL_NAME = "ai-school-community-realtime";

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
  return new BroadcastChannel(CHANNEL_NAME);
}

export function broadcastCommunityChange(kind: CommunityChangeKind) {
  const channel = getChannel();
  if (!channel) return;
  channel.postMessage({ kind, at: Date.now() });
  channel.close();
}

export function subscribeCommunityChange(
  kind: CommunityChangeKind,
  callback: () => void
): () => void {
  const channel = getChannel();
  if (!channel) return () => {};
  const handler = (event: MessageEvent<{ kind: CommunityChangeKind }>) => {
    if (event.data.kind === kind) callback();
  };
  channel.addEventListener("message", handler);
  return () => {
    channel.removeEventListener("message", handler);
    channel.close();
  };
}
