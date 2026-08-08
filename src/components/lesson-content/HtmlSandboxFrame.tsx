"use client";

import { useEffect, useRef, useState } from "react";

// Gemini 슬라이드는 1280x720을 기준 캔버스로 두고 rem 단위 여백/폰트를 쓴다.
// 컨테이너가 이보다 작아지면(우리 앱의 슬라이드 박스는 max-w-5xl≈1024px라
// 16:9 기준 960x540밖에 안 됨) rem 값은 줄어들지 않는데 100vw/100vh 캔버스만
// 줄어들어서 실제로 콘텐츠가 잘린다. 그래서 iframe 자체는 항상 1280x720로
// 고정 렌더링하고, 바깥 박스 크기에 맞춰 통째로 scale()만 해서 축소한다 —
// PPT 뷰어의 "창에 맞추기"와 같은 방식. 이러면 iframe 내부에서는 항상
// 검증된 1280x720 레이아웃 그대로 그려지고, 잘리는 일이 없다.
const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = 720;

/** Gemini가 만드는 독립 HTML(page01.html 등)을 격리해서 그린다.
 *
 * 보안: sandbox에 "allow-same-origin"을 절대 넣지 않는다 — 이게 빠지면 브라우저가
 * 이 iframe을 강제로 opaque(unique) origin으로 취급해서, 안에서 어떤 스크립트가
 * 돌아도 우리 앱의 localStorage/IndexedDB(진행률·guest 프로필 등)나 쿠키에 접근할 수
 * 없다. 이미지·CSS·JS 같은 상대경로 자산 로딩은 origin 격리와 무관하게 정상 동작한다.
 * "allow-scripts"만 있으면 Framer Motion 같은 애니메이션 스크립트는 그대로 돌아간다.
 * "allow-forms"는 Quiz/Practice에서 폼 입력을 받을 수 있게 허용한다.
 * top-navigation·popups·modals는 의도적으로 허용하지 않는다. */
export function HtmlSandboxFrame({
  src,
  title,
  onLoad,
}: {
  src: string;
  title: string;
  onLoad?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setScale(width / DESIGN_WIDTH);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setLoaded(false);
    // 안전장치: onLoad가 어떤 이유로든 안 불리는 경우(브라우저 이벤트 유실,
    // 백그라운드 탭 스로틀링 등) 콘텐츠가 영원히 안 보이는 상태로 남지 않게 한다.
    const timer = setTimeout(() => setLoaded(true), 1200);
    return () => clearTimeout(timer);
  }, [src]);

  return (
    <div ref={containerRef} className="relative size-full overflow-hidden bg-white">
      <iframe
        key={src}
        src={src}
        title={title}
        sandbox="allow-scripts allow-forms"
        referrerPolicy="no-referrer"
        loading="eager"
        className="absolute top-0 left-0 origin-top-left rounded-2xl border-0 bg-white transition-opacity duration-150"
        style={{
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transform: `scale(${scale})`,
          opacity: loaded ? 1 : 0,
        }}
        onLoad={() => {
          setLoaded(true);
          onLoad?.();
        }}
      />
    </div>
  );
}
