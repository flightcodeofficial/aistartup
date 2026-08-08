import { EvidenceBadge } from "@/components/common/EvidenceBadge";
import type { EvidenceTag } from "@/features/practice/types";
import type { TableData } from "./types";

const EVIDENCE_VALUES: EvidenceTag[] = ["근거있음", "추론", "검증필요"];

function isEvidenceTag(value: string): value is EvidenceTag {
  return (EVIDENCE_VALUES as string[]).includes(value);
}

export function TableVisual({ data }: { data: TableData }) {
  return (
    <div className="scrollbar-thin overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead>
          <tr className="bg-muted">
            {data.columns.map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, ri) => (
            <tr key={ri} className="border-t border-border">
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-3 align-top text-foreground/90">
                  {isEvidenceTag(cell) ? <EvidenceBadge tag={cell} /> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
