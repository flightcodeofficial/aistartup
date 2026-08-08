import type { Variants, Transition } from "framer-motion";

export const easeStandard: Transition["ease"] = [0.16, 1, 0.3, 1];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeStandard },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: easeStandard } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: easeStandard },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: easeStandard } },
};

/** 리스트/그리드 항목을 순차적으로 등장시킬 때 부모에 적용 */
export const staggerContainer = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: stagger,
      delayChildren,
    },
  },
});

/** 페이지 전환(라우트 이동) 공통 트랜지션 */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: easeStandard },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: easeStandard } },
};

/** STEP 진행 체크 등에 쓰는 팝 애니메이션 */
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 380, damping: 22 },
  },
};

/** PPT 슬라이드 전환(Lesson Content Engine). custom={direction}으로 Previous/Next 방향을 준다. */
export const slidePageVariants: Variants = {
  enter: (direction: 1 | -1) => ({ opacity: 0, x: direction * 40 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.3, ease: easeStandard } },
  exit: (direction: 1 | -1) => ({
    opacity: 0,
    x: direction * -40,
    transition: { duration: 0.2, ease: easeStandard },
  }),
};

export const cardHover = {
  rest: { y: 0, boxShadow: "0 1px 2px rgba(15,15,35,0.06)" },
  hover: {
    y: -4,
    boxShadow: "0 16px 32px -12px rgba(79,70,229,0.25)",
    transition: { duration: 0.25, ease: easeStandard },
  },
};
