// Ideation Provider 인터페이스
// 지금은 MockFacilitatorProvider(규칙 기반 진행자)가 이 인터페이스를 구현한다.
// 나중에 무료 LLM API(OpenAI 호환, Groq, Gemini 무료 티어 등)를 붙일 때는
// 이 인터페이스를 구현하는 새 Provider를 만들고 features/ideation/index.ts의
// export 한 줄만 바꾸면 된다. 실제 API 키가 필요한 구현체는 반드시 서버(Route Handler)를
// 거쳐 호출해야 하며, 클라이언트에 키를 노출하지 않는다.

import type { IdeationMessage } from "./types";

export interface IdeationProvider {
  readonly name: string;

  /** 대화 이력과 새 사용자 메시지를 받아 진행자(어시스턴트)의 다음 답변을 반환한다. */
  reply(input: { history: IdeationMessage[]; message: string }): Promise<string>;

  /** 첫 메시지로부터 세션 제목을 자동으로 만들어준다. */
  suggestTitle(firstMessage: string): string;
}
