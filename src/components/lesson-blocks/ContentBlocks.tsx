"use client";

import { useId } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CheckCircle2 } from "lucide-react";
import { useAssetUrl } from "@/features/assets/useAssetUrl";
import type {
  DividerBlock,
  ImageBlock,
  InfographicBlock,
  MediaDisplay,
  MediaRatio,
  RichTextBlock,
  TextImageBlock,
} from "@/features/lesson-builder/types";
import { BlockFallback } from "./BlockFrame";
import { cn } from "@/lib/utils";

const PROSE = "prose prose-sm dark:prose-invert max-w-none text-foreground/90";
const PROSE_LEAD =
  "prose prose-base dark:prose-invert max-w-none text-foreground/90 prose-p:leading-relaxed";
const PROSE_HERO =
  "prose prose-lg dark:prose-invert max-w-none text-foreground prose-headings:tracking-tight prose-headings:font-extrabold";

export function RichTextBlockRenderer({ block }: { block: RichTextBlock }) {
  const emphasis = block.data.emphasis ?? "normal";
  return (
    <div className={emphasis === "hero" ? PROSE_HERO : emphasis === "lead" ? PROSE_LEAD : PROSE}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.data.markdown}</ReactMarkdown>
    </div>
  );
}

// 이미지 표현: 썸네일만 나열되지 않도록 크기·비율·채우기를 지정할 수 있게 한다.
// 모바일에서는 mobileRatio가 있으면 그 비율을 우선 적용한다(가로 이미지가 세로 화면을 잡아먹지 않게).
const DISPLAY_CLASS: Record<MediaDisplay, string> = {
  half: "max-w-md",
  large: "max-w-3xl",
  hero: "max-w-none",
  fullscreen: "max-w-none",
};

function ratioStyle(ratio?: MediaRatio): React.CSSProperties | undefined {
  if (!ratio || ratio === "auto") return undefined;
  return { aspectRatio: ratio.replace("/", " / ") };
}

/** 이미지 소스를 그린다.
 *  - "asset://..." 업로드 자산은 useAssetUrl이 objectURL로 해석한다.
 *  - SVG도 항상 <img>로 그리기 때문에 안에 스크립트가 있어도 실행되지 않는다.
 *  - 원격 URL은 next/image 최적화를 우회해 호스트 등록 없이도 동작하게 한다. */
function MediaImage({
  src,
  alt,
  fit,
  ratio,
  mobileRatio,
  className,
}: {
  src: string;
  alt: string;
  fit?: "contain" | "cover";
  ratio?: MediaRatio;
  mobileRatio?: MediaRatio;
  className?: string;
}) {
  const { url, loading, missing } = useAssetUrl(src);
  const hasRatio = ratio && ratio !== "auto";
  const hasMobileRatio = mobileRatio && mobileRatio !== "auto";
  const styleId = useId().replace(/:/g, "");

  if (loading) {
    return <div className="aspect-video w-full animate-pulse rounded-xl bg-muted" />;
  }

  if (missing || !url) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">
        업로드된 이미지를 찾을 수 없습니다
      </div>
    );
  }

  return (
    <>
      {hasMobileRatio && (
        <style>{`@media (max-width:640px){[data-media-id="${styleId}"]{aspect-ratio:${mobileRatio!.replace("/", " / ")} !important}}`}</style>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        data-media-id={styleId}
        style={ratioStyle(ratio)}
        className={cn(
          "w-full rounded-xl",
          hasRatio ? (fit === "contain" ? "object-contain" : "object-cover") : "h-auto",
          fit === "contain" && !hasRatio && "object-contain",
          className
        )}
      />
    </>
  );
}

export function ImageBlockRenderer({ block }: { block: ImageBlock }) {
  if (!block.data.url) {
    return <BlockFallback blockType="image" reason="이미지 URL이 비어 있습니다." />;
  }
  const display = block.data.display ?? "large";
  return (
    <figure className={cn("mx-auto w-full", DISPLAY_CLASS[display])}>
      <MediaImage
        src={block.data.url}
        alt={block.data.alt}
        fit={block.data.objectFit}
        ratio={block.data.aspectRatio}
        mobileRatio={block.data.mobileRatio}
      />
      {block.data.caption && (
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">
          {block.data.caption}
        </figcaption>
      )}
    </figure>
  );
}

export function TextImageBlockRenderer({ block }: { block: TextImageBlock }) {
  const imageFirst = block.data.imagePosition === "left";
  return (
    <div className="grid items-center gap-6 sm:grid-cols-2 sm:gap-10">
      <div className={cn(PROSE, imageFirst && "sm:order-2")}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.data.markdown}</ReactMarkdown>
      </div>
      <div className={cn(imageFirst && "sm:order-1")}>
        {block.data.imageUrl ? (
          <MediaImage src={block.data.imageUrl} alt={block.data.alt} fit="cover" ratio="4/3" />
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">
            이미지 URL이 비어 있습니다
          </div>
        )}
      </div>
    </div>
  );
}

export function InfographicBlockRenderer({ block }: { block: InfographicBlock }) {
  const { variant, items } = block.data;

  if (variant === "image") {
    if (!block.data.imageUrl) {
      return <BlockFallback blockType="infographic" reason="인포그래픽 이미지 URL이 비어 있습니다." />;
    }
    const display = block.data.display ?? "hero";
    return (
      <figure className={cn("mx-auto w-full", DISPLAY_CLASS[display])}>
        <div className="overflow-hidden rounded-2xl bg-muted/30">
          <MediaImage
            src={block.data.imageUrl}
            alt={block.data.alt ?? ""}
            fit={block.data.fit ?? "contain"}
            ratio={block.data.aspectRatio}
          />
        </div>
        {block.data.caption && (
          <figcaption className="mt-2 text-center text-xs text-muted-foreground">
            {block.data.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  if (variant === "stats") {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-6 text-center">
            <p className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
              {item.value ?? "-"}
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">{item.label}</p>
            {item.description && (
              <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (variant === "comparison") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-base font-bold text-foreground">{item.label}</p>
            {item.value && <p className="mt-1 text-sm font-medium text-primary">{item.value}</p>}
            {item.description && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (variant === "checklist") {
    return (
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 rounded-xl bg-muted/50 px-4 py-3">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
            <div>
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              {item.description && (
                <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  }

  // steps
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <li key={i} className="rounded-2xl border border-border bg-card p-5">
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
            {i + 1}
          </span>
          <p className="mt-3 text-sm font-bold text-foreground">{item.label}</p>
          {item.description && (
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
          )}
        </li>
      ))}
    </ol>
  );
}

export function DividerBlockRenderer({ block }: { block: DividerBlock }) {
  if (block.data.style === "space") return <div className="h-10" />;
  if (block.data.style === "dots") {
    return (
      <div className="flex justify-center gap-1.5 py-3" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-1.5 rounded-full bg-muted-foreground/40" />
        ))}
      </div>
    );
  }
  return <hr className="border-border" />;
}
