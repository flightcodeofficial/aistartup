// 아이디어 회의(해커톤 브레인스토밍) — AI와 1:1로 대화하며 아이디어를 다듬는 기능.
// 지금은 Mock 진행자가 응답하지만, provider.ts 인터페이스만 유지하면
// 나중에 무료 LLM API로 교체해도 UI는 그대로 쓸 수 있다.

export type MessageRole = "user" | "assistant";

export interface IdeationMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  createdAt: number;
}

export interface IdeationSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
}
