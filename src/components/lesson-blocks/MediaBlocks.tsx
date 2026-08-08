"use client";

import { useState } from "react";
import { Check, Copy, Download, Film } from "lucide-react";
import type {
  DownloadBlock,
  HtmlBlock,
  HtmlFileBlock,
  PromptBlock,
  VideoBlock,
} from "@/features/lesson-builder/types";
import { Button } from "@/components/ui/button";
import { BlockFallback } from "./BlockFrame";
import { SandboxedHtmlFrame } from "./SandboxedHtmlFrame";
import { ArtifactSelector } from "./ArtifactSelector";

export function HtmlBlockRenderer({ block }: { block: HtmlBlock }) {
  if (!block.data.html?.trim()) {
    return <BlockFallback blockType="html" reason="HTML 내용이 비어 있습니다." />;
  }
  return (
    <SandboxedHtmlFrame
      html={block.data.html}
      title={block.title ?? "HTML 콘텐츠"}
      trustedScript={block.data.trustedScript}
      designWidth={block.data.designWidth}
      designHeight={block.data.designHeight}
      mobileRenderMode={block.data.mobileRenderMode}
    />
  );
}

export function HtmlFileBlockRenderer({ block }: { block: HtmlFileBlock }) {
  if (!block.data.src?.trim()) {
    return <BlockFallback blockType="html-file" reason="HTML 파일 경로가 비어 있습니다." />;
  }
  return (
    <SandboxedHtmlFrame
      src={block.data.src}
      title={block.title ?? "HTML 파일"}
      trustedScript={block.data.trustedScript}
      designWidth={block.data.designWidth}
      designHeight={block.data.designHeight}
      mobileRenderMode={block.data.mobileRenderMode}
    />
  );
}

function toEmbedUrl(url: string, provider: VideoBlock["data"]["provider"]): string | null {
  try {
    if (provider === "file") return url;
    const parsed = new URL(url);
    if (provider === "youtube") {
      const id =
        parsed.searchParams.get("v") ??
        (parsed.hostname.includes("youtu.be") ? parsed.pathname.slice(1) : null);
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (provider === "vimeo") {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

export function VideoBlockRenderer({ block }: { block: VideoBlock }) {
  const embed = toEmbedUrl(block.data.url, block.data.provider);
  if (!embed) {
    return <BlockFallback blockType="video" reason="영상 URL을 인식할 수 없습니다." />;
  }

  if (block.data.provider === "file") {
    return (
      <figure>
        <video src={embed} controls className="w-full rounded-xl bg-black" />
        {block.data.caption && (
          <figcaption className="mt-2 text-xs text-muted-foreground">{block.data.caption}</figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure>
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
        <iframe
          src={embed}
          title={block.title ?? "영상"}
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="size-full border-0"
        />
      </div>
      {block.data.caption && (
        <figcaption className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Film className="size-3.5" />
          {block.data.caption}
        </figcaption>
      )}
    </figure>
  );
}

export function PromptBlockRenderer({ block }: { block: PromptBlock }) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [attached, setAttached] = useState<{ title: string; content: string } | null>(null);

  // 불러온 이전 결과가 있으면 프롬프트 뒤에 붙여서 함께 복사한다.
  const fullPrompt = attached
    ? `${block.data.prompt}\n\n---\n[${attached.title}]\n${attached.content}`
    : block.data.prompt;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullPrompt);
      setCopied(true);
      setCopyFailed(false);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 브라우저가 클립보드를 막는 경우(권한·비활성 탭 등)가 있다. 아무 일도 안 일어난 것처럼
      // 보이면 학생이 실습을 못 하므로, 직접 복사하라고 알려준다.
      setCopied(false);
      setCopyFailed(true);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-muted/40 p-4">
      {block.data.targetTool && (
        <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {block.data.targetTool}에 붙여넣기
        </p>
      )}
      <pre className="scrollbar-thin overflow-x-auto text-sm whitespace-pre-wrap text-foreground/90">
        {fullPrompt}
      </pre>

      {block.data.inputArtifactTypes && block.data.inputArtifactTypes.length > 0 && (
        <ArtifactSelector
          inputArtifactTypes={block.data.inputArtifactTypes}
          onPick={(a) => setAttached({ title: a.title, content: a.content })}
          label="내 결과물 덧붙이기"
        />
      )}

      {block.data.copyable && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="mt-3 min-h-11 gap-1.5 sm:min-h-9"
        >
          {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
          {copied ? "복사됨" : "프롬프트 복사"}
        </Button>
      )}

      {copyFailed && (
        <p className="mt-2 text-[11px] text-warning-foreground">
          브라우저가 자동 복사를 막았습니다. 위 프롬프트를 직접 선택해서 복사해주세요.
        </p>
      )}
    </div>
  );
}

export function DownloadBlockRenderer({ block }: { block: DownloadBlock }) {
  if (!block.data.url) {
    return <BlockFallback blockType="download" reason="다운로드 URL이 비어 있습니다." />;
  }
  return (
    <a
      href={block.data.url}
      download={block.data.fileName}
      className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{block.data.fileName}</p>
        {block.data.sizeLabel && (
          <p className="text-xs text-muted-foreground">{block.data.sizeLabel}</p>
        )}
      </div>
      <Download className="size-4 shrink-0 text-primary" />
    </a>
  );
}
