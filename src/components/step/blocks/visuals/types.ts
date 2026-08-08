export interface ComparisonData {
  left: { label: string; text: string; tone: "muted" | "vivid" };
  right: { label: string; text: string; tone: "muted" | "vivid" };
}

export interface TableData {
  columns: string[];
  rows: string[][];
}

export interface StaircaseData {
  steps: { label: string; detail: string }[];
}

export interface CanvasData {
  customer: { title: string; fields: string[] };
  product: { title: string; fields: string[] };
}

export interface FlowData {
  nodes: string[];
}
