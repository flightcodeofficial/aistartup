// AI 멘토 Mock 답변기.
// "질문하기" 게시글에 자동으로 첫 답변을 남긴다. 커리큘럼에서 다룬 개념은 키워드 매칭으로
// 정확하게 답하고, 모르는 내용은 솔직하게 모른다고 말하며 강사 에스컬레이션을 권한다.
// 나중에 무료 API로 교체할 때는 features/community/repositories/localRepository.ts의
// askAIMentor() 안에서 이 함수 호출부만 실제 API 호출로 바꾸면 된다.

interface KnownTopic {
  keywords: string[];
  answer: string;
}

const KNOWN_TOPICS: KnownTopic[] = [
  {
    keywords: ["icp"],
    answer:
      "ICP(Ideal Customer Profile)는 회사·조직 수준의 특성을 정의하는 작업이에요. ZoomInfo 자료에 따르면 ICP를 먼저 정하고, 그 안에서 실제로 결정하고 사용하는 사람(페르소나)을 나중에 연결하는 순서가 좋습니다. Day1 STEP4에서 직접 만들어보실 수 있어요.",
  },
  {
    keywords: ["ecp"],
    answer:
      "ECP(Early Customer Profile)는 '이상적인 장기 고객'이 아니라 '지금 이 불완전한 제품도 시도해볼 의향이 있는 초기 고객'을 뜻해요. 아직 제품시장적합성을 찾지 못한 단계에서는 ICP보다 ECP부터 정의하는 게 더 현실적입니다.",
  },
  {
    keywords: ["세그먼트", "세분화"],
    answer:
      "세분화는 나이·성별 같은 인구통계가 아니라 반복되는 문제·상황·행동으로 고객군을 나누는 작업이에요. STEP3에서 STP(세분화→타겟팅→포지셔닝) 흐름과 함께 다룹니다.",
  },
  {
    keywords: ["가치제안", "value proposition"],
    answer:
      "가치제안 캔버스(Strategyzer)는 고객의 해야 할 일·고충·기대 이득과, 우리 제품이 그것을 어떻게 해결하는지를 나란히 놓고 적합성을 점검하는 도구예요. STEP5에서 지금까지 만든 자료를 바탕으로 한 문장으로 압축해봅니다.",
  },
  {
    keywords: ["고객여정", "여정"],
    answer:
      "고객여정 지도는 행위자, 상황과 기대, 단계, 행동·생각·감정, 개선 기회로 구성돼요(Nielsen Norman Group). 한 지도에는 하나의 핵심 행위자만 담는 게 중요합니다.",
  },
  {
    keywords: ["페르소나"],
    answer:
      "페르소나는 실제 고객이 아니라 '가설'이에요. 구매자·사용자·영향자로 나누고, 각 카드에 근거·반증·미확인 필드를 반드시 남겨야 합니다. 증거 없는 민감한 속성(나이·성별·소득 등)은 임의로 넣지 않아요.",
  },
];

function normalize(text: string) {
  return text.toLowerCase();
}

export function mockMentorAnswer(title: string, body: string): string {
  const haystack = normalize(`${title} ${body}`);
  const matched = KNOWN_TOPICS.find((topic) => topic.keywords.some((k) => haystack.includes(k)));

  if (matched) {
    return `${matched.answer}\n\n(AI 멘토 Mock 답변입니다. 더 구체적인 답이 필요하면 아래 "강사에게 질문하기" 버튼을 눌러주세요.)`;
  }

  return "아직 이 질문에 대해 정확히 답변드리기 어려워요. 커리큘럼에 없는 내용이거나 더 구체적인 맥락이 필요할 수 있습니다. 아래 \"강사에게 질문하기\" 버튼을 눌러 강사님께 직접 질문해주세요.";
}
