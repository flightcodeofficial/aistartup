"use client";

import type { ComponentType } from "react";
import type { BlockType, LessonBlock } from "@/features/lesson-builder/types";
import {
  DividerBlockRenderer,
  ImageBlockRenderer,
  InfographicBlockRenderer,
  RichTextBlockRenderer,
  TextImageBlockRenderer,
} from "./ContentBlocks";
import {
  DownloadBlockRenderer,
  HtmlBlockRenderer,
  HtmlFileBlockRenderer,
  PromptBlockRenderer,
  VideoBlockRenderer,
} from "./MediaBlocks";
import {
  InputFormBlockRenderer,
  QuizBlockRenderer,
  ReflectionBlockRenderer,
} from "./InteractiveBlocks";
import {
  ExternalLinkBlockRenderer,
  InternalAppBlockRenderer,
  ResultPreviewBlockRenderer,
  SaveArtifactBlockRenderer,
} from "./PracticeBlocks";

// 거대한 switch 문 대신 registry. 새 블록 타입을 추가할 때
// (1) types.ts에 타입 추가 (2) 스키마 추가 (3) 렌더러 작성 (4) 여기 등록
// 이 네 군데만 손대면 되고, 렌더링하는 쪽 코드는 건드릴 필요가 없다.

// 각 렌더러는 자기 블록 타입만 받지만, registry는 유니온 전체를 키로 갖는다.
// 조회 시점에 type이 좁혀지지 않으므로 등록부에서 한 번만 캐스팅한다.
type AnyBlockRenderer = ComponentType<{ block: never }>;

export const blockRenderers: Record<BlockType, AnyBlockRenderer> = {
  "rich-text": RichTextBlockRenderer as AnyBlockRenderer,
  image: ImageBlockRenderer as AnyBlockRenderer,
  "text-image": TextImageBlockRenderer as AnyBlockRenderer,
  infographic: InfographicBlockRenderer as AnyBlockRenderer,
  html: HtmlBlockRenderer as AnyBlockRenderer,
  "html-file": HtmlFileBlockRenderer as AnyBlockRenderer,
  video: VideoBlockRenderer as AnyBlockRenderer,
  "external-link": ExternalLinkBlockRenderer as AnyBlockRenderer,
  "internal-app": InternalAppBlockRenderer as AnyBlockRenderer,
  quiz: QuizBlockRenderer as AnyBlockRenderer,
  "input-form": InputFormBlockRenderer as AnyBlockRenderer,
  prompt: PromptBlockRenderer as AnyBlockRenderer,
  download: DownloadBlockRenderer as AnyBlockRenderer,
  "result-preview": ResultPreviewBlockRenderer as AnyBlockRenderer,
  "save-artifact": SaveArtifactBlockRenderer as AnyBlockRenderer,
  reflection: ReflectionBlockRenderer as AnyBlockRenderer,
  divider: DividerBlockRenderer as AnyBlockRenderer,
};

export function getBlockRenderer(type: LessonBlock["type"]): AnyBlockRenderer | undefined {
  return blockRenderers[type];
}
