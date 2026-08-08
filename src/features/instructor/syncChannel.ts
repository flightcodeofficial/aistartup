// 강사 모드 ↔ 학생 화면 동기화
// 같은 브라우저(또는 같은 기기의 다른 탭)에서 강사가 이동한 STEP 위치를
// BroadcastChannel로 방송하고, "강사 화면 따라가기"를 켠 학생 탭이 구독해서 따라간다.
// 서버가 필요 없는 로컬 동기화이며, 다른 기기 간 동기화는 추후 실제 백엔드 연결 시 확장한다.

export interface SyncPosition {
  week: number;
  day: number;
  stepNumber: number;
}

const CHANNEL_NAME = "ai-school-instructor-sync";

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
  return new BroadcastChannel(CHANNEL_NAME);
}

export function broadcastPosition(position: SyncPosition) {
  const channel = getChannel();
  if (!channel) return;
  channel.postMessage(position);
  channel.close();
}

export function subscribeToPosition(callback: (position: SyncPosition) => void): () => void {
  const channel = getChannel();
  if (!channel) return () => {};
  const handler = (event: MessageEvent<SyncPosition>) => callback(event.data);
  channel.addEventListener("message", handler);
  return () => {
    channel.removeEventListener("message", handler);
    channel.close();
  };
}
