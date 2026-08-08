"use client";

import { Component, type ReactNode } from "react";
import type { LessonBlock } from "@/features/lesson-builder/types";
import { BlockFallback, BlockFrame } from "./BlockFrame";
import { getBlockRenderer } from "./blockRegistry";

// 블록 하나가 렌더링 중 던져도 페이지 전체가 죽지 않게 감싼다.
// (스키마 검증을 통과해도 런타임에서 깨질 수 있다 — 예: 잘못된 URL 파싱)
class BlockErrorBoundary extends Component<
  { blockType: string; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <BlockFallback
          blockType={this.props.blockType}
          reason="이 블록을 그리는 중 오류가 발생했습니다."
        />
      );
    }
    return this.props.children;
  }
}

export function BlockRenderer({
  block,
  isInstructorView = false,
}: {
  block: LessonBlock;
  isInstructorView?: boolean;
}) {
  if (block.visibility === "hidden") return null;
  if (block.visibility === "instructor-only" && !isInstructorView) return null;

  const Renderer = getBlockRenderer(block.type);
  if (!Renderer) {
    return (
      <BlockFallback
        blockType={block.type}
        reason="이 앱 버전에서 지원하지 않는 블록 유형입니다."
      />
    );
  }

  return (
    <BlockErrorBoundary blockType={block.type}>
      <BlockFrame
        title={block.title}
        description={block.description}
        layout={block.layout}
        theme={block.theme}
      >
        {/* registry가 유니온 전체를 담기 때문에 여기서 구체 타입으로 좁혀 전달한다. */}
        <Renderer block={block as never} />
      </BlockFrame>
    </BlockErrorBoundary>
  );
}
