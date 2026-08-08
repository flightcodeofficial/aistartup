"use client";

import { AnimatePresence, motion } from "framer-motion";
import { HtmlSandboxFrame } from "./HtmlSandboxFrame";
import { slidePageVariants } from "@/lib/animations";

/** PPT처럼 보이는 16:9 슬라이드 프레임. 바깥 챙김새(Prev/Next/진행률)는 이 밖에서
 *  그리고, 이 컴포넌트는 슬라이드 자체만 담당한다 — 절대 세로 스크롤 페이지가 되지 않도록
 *  높이를 고정 비율로 강제한다. */
export function PageSlideFrame({
  src,
  title,
  page,
  direction,
}: {
  src: string;
  title: string;
  page: number;
  direction: 1 | -1;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-card shadow-lg ring-1 ring-border">
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={page}
            custom={direction}
            variants={slidePageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            <HtmlSandboxFrame src={src} title={title} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
