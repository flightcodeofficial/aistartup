import {
  BookText,
  CheckSquare,
  ClipboardList,
  Code2,
  Download,
  ExternalLink,
  FileCode2,
  FileInput,
  FolderInput,
  Image as ImageIcon,
  LayoutTemplate,
  Minus,
  MonitorPlay,
  PenLine,
  Sparkles,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import type { BlockType } from "./types";

// 관리자가 블록을 고를 때 "type 이름"만 보고 판단하지 않도록,
// 카테고리 + 아이콘 + 한국어 이름 + 한 줄 설명을 함께 제공한다.
// (블록 종류 자체는 늘리지 않는다 — 표현만 친절하게 만든다)

export interface BlockCatalogEntry {
  type: BlockType;
  label: string;
  description: string;
  icon: LucideIcon;
}

export interface BlockCatalogCategory {
  id: string;
  title: string;
  blocks: BlockCatalogEntry[];
}

export const BLOCK_CATALOG: BlockCatalogCategory[] = [
  {
    id: "explain",
    title: "설명",
    blocks: [
      {
        type: "rich-text",
        label: "텍스트",
        description: "제목·문단·목록으로 개념을 설명합니다",
        icon: BookText,
      },
      {
        type: "text-image",
        label: "텍스트 + 이미지",
        description: "글과 이미지를 좌우로 나란히 배치합니다",
        icon: LayoutTemplate,
      },
      {
        type: "image",
        label: "이미지",
        description: "사진·다이어그램을 크게 보여줍니다",
        icon: ImageIcon,
      },
      {
        type: "infographic",
        label: "인포그래픽",
        description: "단계·비교·통계·체크리스트를 시각화합니다",
        icon: Sparkles,
      },
      {
        type: "video",
        label: "영상",
        description: "YouTube·Vimeo 영상을 삽입합니다",
        icon: MonitorPlay,
      },
    ],
  },
  {
    id: "interactive",
    title: "인터랙티브",
    blocks: [
      {
        type: "html",
        label: "HTML 붙여넣기",
        description: "AI로 만든 HTML을 그대로 붙여넣습니다",
        icon: Code2,
      },
      {
        type: "html-file",
        label: "HTML 파일",
        description: "서버에 올린 HTML 슬라이드를 불러옵니다",
        icon: FileCode2,
      },
      {
        type: "quiz",
        label: "퀴즈",
        description: "객관식 문제로 이해도를 확인합니다",
        icon: CheckSquare,
      },
    ],
  },
  {
    id: "practice",
    title: "실습",
    blocks: [
      {
        type: "external-link",
        label: "외부 실습",
        description: "ChatGPT 등 외부 도구에서 실습하게 합니다",
        icon: ExternalLink,
      },
      {
        type: "internal-app",
        label: "내부 실습",
        description: "앱 안의 실습 화면으로 보냅니다",
        icon: Terminal,
      },
      {
        type: "prompt",
        label: "프롬프트",
        description: "복사해서 쓸 AI 프롬프트를 제공합니다",
        icon: ClipboardList,
      },
      {
        type: "input-form",
        label: "입력 폼",
        description: "학생이 직접 답을 작성합니다",
        icon: FileInput,
      },
    ],
  },
  {
    id: "result",
    title: "결과",
    blocks: [
      {
        type: "result-preview",
        label: "결과 미리보기",
        description: "저장된 결과물을 이 자리에서 보여줍니다",
        icon: FolderInput,
      },
      {
        type: "save-artifact",
        label: "프로젝트에 저장",
        description: "작성한 내용을 내 프로젝트에 저장합니다",
        icon: Download,
      },
      {
        type: "reflection",
        label: "회고",
        description: "배운 점을 자유롭게 적게 합니다",
        icon: PenLine,
      },
    ],
  },
  {
    id: "etc",
    title: "기타",
    blocks: [
      {
        type: "download",
        label: "다운로드",
        description: "자료 파일을 내려받게 합니다",
        icon: Download,
      },
      {
        type: "divider",
        label: "구분선",
        description: "내용 사이에 여백이나 선을 넣습니다",
        icon: Minus,
      },
    ],
  },
];

export function findCatalogEntry(type: BlockType): BlockCatalogEntry | undefined {
  for (const category of BLOCK_CATALOG) {
    const found = category.blocks.find((b) => b.type === type);
    if (found) return found;
  }
  return undefined;
}
