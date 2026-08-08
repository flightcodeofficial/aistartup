"use client";

import { useEffect, useRef, useState } from "react";
import type { HtmlMobileRenderMode } from "@/features/lesson-builder/types";

// 관리자가 넣은 HTML을 앱과 격리해서 그린다. 두 가지 입력을 받는다:
//   - src    : public/ 아래 HTML 파일 경로 (html-file 블록)
//   - srcDoc : 관리자가 직접 붙여넣은 HTML 문자열 (html 블록)
//
// 보안 원칙:
// 1) allow-same-origin을 절대 넣지 않는다. 이게 빠지면 브라우저가 이 iframe을 강제로
//    opaque(unique) origin으로 취급해서 — 안에서 무슨 스크립트가 돌든 —
//    부모 창(window.parent/top/opener), 우리 앱의 localStorage/sessionStorage/IndexedDB,
//    쿠키에 접근할 수 없다. 이 한 줄이 사실상 격리의 핵심이다.
// 2) allow-scripts는 관리자가 명시적으로 승인한(trustedScript) 콘텐츠에만 준다.
//    승인 안 된 HTML은 스크립트가 아예 실행되지 않는다.
// 3) 새 창/탭 열기(allow-popups), 상위 프레임 이동(allow-top-navigation),
//    모달(allow-modals)은 어떤 경우에도 주지 않는다.
// 4) 직접 입력 HTML(srcDoc)에는 CSP를 주입해 기본적으로 외부 네트워크 요청을 막는다.
//    (이미지·폰트는 data: URI만 허용, 원격 스크립트/스타일/XHR 전부 차단)
//
// 절대 dangerouslySetInnerHTML로 앱 DOM에 직접 넣지 않는다 — 항상 iframe을 거친다.

const CSP_UNTRUSTED =
  "default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; form-action 'none';";
const CSP_TRUSTED =
  "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; form-action 'none';";

function withInjectedCsp(html: string, trustedScript: boolean): string {
  const meta = `<meta http-equiv="Content-Security-Policy" content="${trustedScript ? CSP_TRUSTED : CSP_UNTRUSTED}">`;
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head([^>]*)>/i, `<head$1>${meta}`);
  }
  return `<!doctype html><html><head><meta charset="utf-8">${meta}</head><body>${html}</body></html>`;
}

/** 이 폭 아래에서는 슬라이드를 축소하면 글씨가 읽을 수 없게 작아진다. */
const MOBILE_BREAKPOINT = 640;

export function SandboxedHtmlFrame({
  src,
  html,
  title,
  trustedScript = false,
  /** 슬라이드형 콘텐츠는 디자인 기준 캔버스로 렌더링한 뒤 통째로 축소한다.
   *  (컨테이너를 그대로 iframe 크기로 쓰면 rem 기반 여백/폰트가 안 줄어들어 콘텐츠가 잘린다) */
  designWidth,
  designHeight,
  mobileRenderMode = "scale",
}: {
  src?: string;
  html?: string;
  title: string;
  trustedScript?: boolean;
  designWidth?: number;
  designHeight?: number;
  mobileRenderMode?: HtmlMobileRenderMode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  // 첫 페인트부터 올바른 모드로 그리기 위해 화면 폭을 먼저 본다.
  // (ResizeObserver는 마운트 후에야 오므로, 그것만 믿으면 폰에서 한 프레임 동안
  //  깨알같이 축소된 슬라이드가 번쩍인다.)
  const [isNarrow, setIsNarrow] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT
  );

  // designWidth/Height가 지정된 "슬라이드형" HTML만 비율 유지 축소(scale-to-fit)한다.
  // 일반 HTML은 모바일에서도 자기 높이대로 세로로 흐르게 두는 게 읽기 좋다 —
  // 모든 콘텐츠를 16:9로 우겨넣으면 폰에서 글씨가 읽을 수 없게 작아진다.
  //
  // responsive 모드는 여기서 한 걸음 더 간다: 좁은 화면에서는 축소를 아예 끄고
  // iframe 폭을 화면 폭에 맞춘다. 그래야 HTML 안의 @media (max-width:...)가 실제로 발동한다.
  // 슬라이드 캔버스를 29%로 줄이면 40px 제목이 12px가 되어 읽을 수 없다.
  const hasCanvas = Boolean(designWidth && designHeight);
  const isScaled = hasCanvas && !(mobileRenderMode === "responsive" && isNarrow);

  useEffect(() => {
    if (!hasCanvas) return;
    const el = containerRef.current;
    if (!el) return;

    const apply = (width: number) => {
      if (!width) return;
      // 데스크톱이라도 컨테이너가 좁으면(사이드바 옆 등) 좁은 화면으로 본다.
      setIsNarrow(width <= MOBILE_BREAKPOINT || window.innerWidth <= MOBILE_BREAKPOINT);
      if (designWidth) setScale(width / designWidth);
    };

    // 마운트 직후 한 번은 직접 잰다. ResizeObserver 콜백은 비동기라
    // 그것만 기다리면 첫 화면이 축소되지 않은 채(=잘린 채) 보일 수 있다.
    apply(el.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => apply(entries[0]?.contentRect.width ?? 0));
    observer.observe(el);

    // ResizeObserver가 늦거나 컨테이너가 교체되는 경우를 대비한 백업 경로.
    const onResize = () => apply(containerRef.current?.getBoundingClientRect().width ?? 0);
    window.addEventListener("resize", onResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [hasCanvas, designWidth]);

  const sandbox = trustedScript ? "allow-scripts allow-forms" : "allow-forms";
  const srcDoc = html !== undefined ? withInjectedCsp(html, trustedScript) : undefined;

  // responsive로 전환됐어도 컨테이너 폭은 계속 측정해야 하므로 ref는 유지한다.
  if (hasCanvas && !isScaled) {
    return (
      <div ref={containerRef} className="w-full">
        <iframe
          src={src}
          srcDoc={srcDoc}
          title={title}
          sandbox={sandbox}
          referrerPolicy="no-referrer"
          // 샌드박스 iframe은 안쪽 높이를 밖에서 잴 수 없다(같은 origin이 아니다).
          // 그래서 화면 높이의 대부분을 주고 내부 스크롤에 맡긴다.
          className="h-[72svh] max-h-[720px] min-h-96 w-full rounded-xl border border-border bg-white"
        />
      </div>
    );
  }

  if (isScaled) {
    return (
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-xl bg-white ring-1 ring-border"
        style={{ aspectRatio: `${designWidth} / ${designHeight}` }}
      >
        <iframe
          src={src}
          srcDoc={srcDoc}
          title={title}
          sandbox={sandbox}
          referrerPolicy="no-referrer"
          className="absolute top-0 left-0 origin-top-left border-0 bg-white"
          style={{ width: designWidth, height: designHeight, transform: `scale(${scale})` }}
        />
      </div>
    );
  }

  return (
    <iframe
      src={src}
      srcDoc={srcDoc}
      title={title}
      sandbox={sandbox}
      referrerPolicy="no-referrer"
      className="min-h-64 w-full rounded-xl border border-border bg-white"
    />
  );
}
