import type { EvidenceRow, EvidenceTag } from "../types";

const PROBLEM_WORDS = ["문제", "힘들", "어려", "불편", "고민", "스트레스", "오류", "반복", "시간이 걸", "번거"];
const TRIGGER_WORDS = ["때문에", "계기", "이후", "그러다가", "결국", "하고 나서"];
const ALTERNATIVE_WORDS = ["지금은", "현재", "대신", "쓰고 있", "사용하고 있", "수작업으로"];
const OBJECTION_WORDS = ["망설", "걱정", "비용이", "가격이", "어려울 것 같", "부담"];

function includesAny(line: string, words: string[]): boolean {
  return words.some((w) => line.includes(w));
}

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

/** 원문 텍스트를 줄 단위로 나눠 문제/촉발사건/현재대안/반대이유 키워드로 라벨링한다.
 *  실제 AI 호출 전 Mock 단계에서는 이렇게 규칙 기반으로 "근거있음" 행만 만들고,
 *  아무 근거도 못 찾으면 정직하게 "검증필요"로 표시한다. */
export function extractEvidenceFromText(rawText: string | undefined): EvidenceRow[] {
  idCounter = 0;
  const lines = (rawText ?? "")
    .split(/\n|\.(?=\s|$)/)
    .map((l) => l.trim())
    .filter((l) => l.length >= 4);

  const rows: EvidenceRow[] = [];

  for (const line of lines) {
    const row: Partial<EvidenceRow> = {};
    let matched = false;

    if (includesAny(line, PROBLEM_WORDS)) {
      row.problem = line;
      matched = true;
    }
    if (includesAny(line, TRIGGER_WORDS)) {
      row.triggerEvent = line;
      matched = true;
    }
    if (includesAny(line, ALTERNATIVE_WORDS)) {
      row.currentAlternative = line;
      matched = true;
    }
    if (includesAny(line, OBJECTION_WORDS)) {
      row.objection = line;
      matched = true;
    }

    if (matched) {
      rows.push({
        id: nextId("ev"),
        sourceLine: line,
        tag: "근거있음",
        ...row,
      });
    }
  }

  if (rows.length === 0) {
    rows.push({
      id: nextId("ev"),
      sourceLine:
        rawText && rawText.trim().length > 0
          ? "입력한 원문에서 반복 문제·촉발 사건·현재 대안 키워드를 찾지 못했습니다."
          : "고객 원문이 입력되지 않았습니다.",
      tag: "검증필요",
    });
  }

  return rows.slice(0, 8);
}

export function tagCounts(rows: EvidenceRow[]): Record<EvidenceTag, number> {
  return {
    근거있음: rows.filter((r) => r.tag === "근거있음").length,
    추론: rows.filter((r) => r.tag === "추론").length,
    검증필요: rows.filter((r) => r.tag === "검증필요").length,
  };
}
