import { Sparkles } from "lucide-react";

/** Practice 실습 컴포넌트 안에서, 입력 폼과 구분되는 "AI 결과" 단계임을
 *  표시하는 작은 라벨. AI 결과는 실습 컴포넌트 내부에서 같은 상태로 관리되므로
 *  별도 컴포넌트로 마운트를 분리하지 않고, 렌더링 위치에 이 라벨만 붙인다. */
export function AIResultLabel() {
  return (
    <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
      <Sparkles className="size-3.5" />⑤ AI 결과
    </p>
  );
}
