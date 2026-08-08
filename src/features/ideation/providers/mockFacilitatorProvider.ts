import type { IdeationProvider } from "../provider";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 소크라테스식 질문 순서. 오늘 커리큘럼(고객 증거 → 세그먼트 → ICP/ECP → 가치제안)과
// 같은 순서로 설계했다 — 아이디어 회의도 결국 같은 원칙을 따른다: 상상하지 말고 근거를 물어라.
const STAGE_QUESTIONS = [
  "좋은 시작이에요. 이 아이디어가 해결하려는 문제를 조금 더 구체적으로 말씀해주시겠어요? 누가, 언제, 어떤 상황에서 이 문제를 겪나요?",
  "그 문제를 가장 크게 겪는 고객은 누구인가요? 나이나 성별보다, 어떤 상황·행동을 보이는 사람인지로 설명해주세요.",
  "지금 그 고객은 이 문제를 어떻게 해결하고 있나요? 기존 방법(경쟁 서비스, 수작업, 참고 안 함 등)은 무엇인가요?",
  "여러분의 아이디어는 그 기존 방법과 무엇이 다른가요? 왜 지금 이 방식이 더 나은 선택이 될까요?",
  "해커톤·수업 기간 안에 만들 수 있는 가장 작은 버전(MVP)은 무엇일까요? 오늘 당장 검증할 수 있는 한 가지만 골라본다면요?",
  "좋습니다. 이제 이 답을 검증할 차례예요. 실제 잠재 고객 3명에게 물어볼 질문을 하나만 적어본다면 무엇일까요?",
];

const FOLLOW_UP_PROMPTS = [
  "조금 더 구체적인 예시를 들어주실 수 있을까요?",
  "그렇게 생각하신 근거(직접 들은 말, 관찰한 상황)가 있다면 함께 적어주세요.",
  "만약 그 가정이 틀렸다면 어떤 대안이 있을까요?",
];

function countUserMessages(history: { role: string }[]): number {
  return history.filter((m) => m.role === "user").length;
}

export const mockFacilitatorProvider: IdeationProvider = {
  name: "Mock 진행자 (데모용 — 나중에 실제 API로 교체 가능)",

  async reply({ history, message }) {
    await delay(500 + Math.random() * 400);

    const turnIndex = countUserMessages(history); // 이번 메시지 포함 전 카운트
    void message;

    if (turnIndex < STAGE_QUESTIONS.length) {
      return STAGE_QUESTIONS[turnIndex];
    }

    const followUp = FOLLOW_UP_PROMPTS[turnIndex % FOLLOW_UP_PROMPTS.length];
    return `지금까지 이야기를 잘 정리해두셨어요. ${followUp}\n\n(진행자는 지금 규칙 기반 Mock입니다. 실제 AI와 더 깊게 대화하려면 이후 무료 API 연결로 확장할 수 있어요.)`;
  },

  suggestTitle(firstMessage) {
    const trimmed = firstMessage.trim().replace(/\s+/g, " ");
    return trimmed.length > 24 ? `${trimmed.slice(0, 24)}...` : trimmed || "새 아이디어 회의";
  },
};
