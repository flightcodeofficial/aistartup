"use client";

import { localLessonDraftRepository } from "./repositories/localRepository";
import { lessonRepository } from "./index";
import { localAssetRepository, assetRepository } from "@/features/assets";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { assetIdToRef, assetRefToId, isAssetRef } from "@/features/assets/types";
import type { LessonContent } from "./types";
import { CANONICAL_LESSONS } from "@/features/curriculum/canonicalLessons";
import { buildDay1Lesson1, DAY1_LESSON1_ASSET_FILES } from "./day1Lesson1";
import { buildDay1Lesson2, DAY1_LESSON2_ASSET_FILES } from "./day1Lesson2";
import { buildDay1Lesson3, DAY1_LESSON3_ASSET_FILES } from "./day1Lesson3";
import { buildDay1Lesson4, DAY1_LESSON4_ASSET_FILES } from "./day1Lesson4";
import { buildDay2Lesson1, DAY2_LESSON1_ASSET_FILES } from "./day2Lesson1";
import { buildDay2Lesson2, DAY2_LESSON2_ASSET_FILES } from "./day2Lesson2";
import { buildDay2Lesson3, DAY2_LESSON3_ASSET_FILES } from "./day2Lesson3";
import { buildDay2Lesson4, DAY2_LESSON4_ASSET_FILES } from "./day2Lesson4";
import { buildDay3Lesson1 } from "./day3Lesson1";
import { buildDay3Lesson2 } from "./day3Lesson2";
import { buildDay3Lesson3 } from "./day3Lesson3";
import { buildDay3Lesson4 } from "./day3Lesson4";
import { buildDay4Lesson1 } from "./day4Lesson1";
import { buildDay4Lesson2 } from "./day4Lesson2";
import { buildDay4Lesson3 } from "./day4Lesson3";
import { buildDay4Lesson4 } from "./day4Lesson4";
import { buildDay5Lesson1 } from "./day5Lesson1";
import { buildDay5Lesson2 } from "./day5Lesson2";
import { buildDay5Lesson3 } from "./day5Lesson3";
import { buildDay5Lesson4 } from "./day5Lesson4";
import { buildDay6Lesson1 } from "./day6Lesson1";
import { buildDay6Lesson2 } from "./day6Lesson2";
import { buildDay6Lesson3 } from "./day6Lesson3";
import { buildDay6Lesson4 } from "./day6Lesson4";
import { buildDay7Lesson1 } from "./day7Lesson1";
import { buildDay7Lesson2 } from "./day7Lesson2";
import { buildDay7Lesson3 } from "./day7Lesson3";
import { buildDay7Lesson4 } from "./day7Lesson4";
import { buildDay8Lesson1 } from "./day8Lesson1";
import { buildDay8Lesson2 } from "./day8Lesson2";
import { buildDay8Lesson3 } from "./day8Lesson3";
import { buildDay8Lesson4 } from "./day8Lesson4";
import { buildDay9Lesson1 } from "./day9Lesson1";
import { buildDay9Lesson2 } from "./day9Lesson2";
import { buildDay9Lesson3 } from "./day9Lesson3";
import { buildDay9Lesson4 } from "./day9Lesson4";
import { buildDay10Lesson1 } from "./day10Lesson1";
import { buildDay10Lesson2 } from "./day10Lesson2";
import { buildDay10Lesson3 } from "./day10Lesson3";
import { buildDay10Lesson4 } from "./day10Lesson4";
import { buildDay11Lesson1 } from "./day11Lesson1";
import { buildDay11Lesson2 } from "./day11Lesson2";
import { buildDay11Lesson3 } from "./day11Lesson3";
import { buildDay11Lesson4 } from "./day11Lesson4";
import { buildDay12Lesson1 } from "./day12Lesson1";
import { buildDay12Lesson2 } from "./day12Lesson2";
import { buildDay12Lesson3 } from "./day12Lesson3";
import { buildDay12Lesson4 } from "./day12Lesson4";
import { buildDay13Lesson1 } from "./day13Lesson1";
import { buildDay13Lesson2 } from "./day13Lesson2";
import { buildDay13Lesson3 } from "./day13Lesson3";
import { buildDay13Lesson4 } from "./day13Lesson4";
import { buildDay14Lesson1 } from "./day14Lesson1";
import { buildDay14Lesson2 } from "./day14Lesson2";
import { buildDay14Lesson3 } from "./day14Lesson3";
import { buildDay14Lesson4 } from "./day14Lesson4";
import { buildDay15Lesson1 } from "./day15Lesson1";
import { buildDay15Lesson2 } from "./day15Lesson2";
import { buildDay15Lesson3 } from "./day15Lesson3";
import { buildDay15Lesson4 } from "./day15Lesson4";
import { buildDay16Lesson1 } from "./day16Lesson1";

// 이 브라우저(IndexedDB)에 만들어 둔 Lesson + canonical lesson을 Supabase로 올린다.
//
// 이미지가 asset://{로컬id} 로 박혀 있으므로, 파일도 Storage로 옮기고
// 참조를 새 id로 바꿔줘야 다른 PC에서 그림이 보인다.
//
// 재실행 안전: 같은 Lesson id가 서버에 이미 있으면 건너뛴다(강사가 서버에서 고친 내용 보호).

const CANONICAL_BUILDERS: Record<string, () => LessonContent> = {
  "w2-d1-l1-customer-analysis": () => buildDay1Lesson1({
    aiMarketingShift: DAY1_LESSON1_ASSET_FILES.aiMarketingShift,
    imaginedVsEvidence: DAY1_LESSON1_ASSET_FILES.imaginedVsEvidence,
    stpMap: DAY1_LESSON1_ASSET_FILES.stpMap,
  }),
  "w2-d1-l2-customer-evidence": () => buildDay1Lesson2({
    evidenceStrengthLadder: DAY1_LESSON2_ASSET_FILES.evidenceStrengthLadder,
    sourceTraceChain: DAY1_LESSON2_ASSET_FILES.sourceTraceChain,
  }),
  "w2-d1-l3-segmentation": () => buildDay1Lesson3({
    segmentMap: DAY1_LESSON3_ASSET_FILES.segmentMap,
  }),
  "w2-d1-l4-persona-journey-value": () => buildDay1Lesson4({
    evidencePersona: DAY1_LESSON4_ASSET_FILES.evidencePersona,
    valuePropositionBridge: DAY1_LESSON4_ASSET_FILES.valuePropositionBridge,
  }),
  "w2-d2-l1-source-message": () => buildDay2Lesson1({
    sourceToMessagePipeline: DAY2_LESSON1_ASSET_FILES.sourceToMessagePipeline,
    messageAngleMap: DAY2_LESSON1_ASSET_FILES.messageAngleMap,
    sourceAuditInteractive: DAY2_LESSON1_ASSET_FILES.sourceAuditInteractive,
  }),
  "w2-d2-l2-sns-repurpose": () => buildDay2Lesson2({
    snsChannelContext: DAY2_LESSON2_ASSET_FILES.snsChannelContext,
    channelContextTransformer: DAY2_LESSON2_ASSET_FILES.channelContextTransformer,
  }),
  "w2-d2-l3-blog-newsletter": () => buildDay2Lesson3({
    blogNewsletterCompare: DAY2_LESSON3_ASSET_FILES.blogNewsletterCompare,
    longformStructureInteractive: DAY2_LESSON3_ASSET_FILES.longformStructureInteractive,
  }),
  "w2-d2-l4-content-supply-chain": () => buildDay2Lesson4({
    contentSupplyChain: DAY2_LESSON4_ASSET_FILES.contentSupplyChain,
    oneVariableAbTest: DAY2_LESSON4_ASSET_FILES.oneVariableAbTest,
    contentSupplyChainInteractive: DAY2_LESSON4_ASSET_FILES.contentSupplyChainInteractive,
  }),
  "w2-d3-l1-message-goal-cta": () => buildDay3Lesson1(),
  "w2-d3-l2-personalized-outreach": () => buildDay3Lesson2(),
  "w2-d3-l3-promo-copy": () => buildDay3Lesson3(),
  "w2-d3-l4-approval-compliance": () => buildDay3Lesson4(),
  "w2-d4-l1-landing-structure": () => buildDay4Lesson1(),
  "w2-d4-l2-landing-copy-visual": () => buildDay4Lesson2(),
  "w2-d4-l3-tally-form": () => buildDay4Lesson3(),
  "w2-d4-l4-framer-carrd-publish": () => buildDay4Lesson4(),
  "w2-d5-l1-faq-source": () => buildDay5Lesson1(),
  "w2-d5-l2-faq-draft-notion": () => buildDay5Lesson2(),
  "w2-d5-l3-response-scenarios": () => buildDay5Lesson3(),
  "w2-d5-l4-inquiry-automation": () => buildDay5Lesson4(),
  "w3-d6-l1-ir-evidence": () => buildDay6Lesson1(),
  "w3-d6-l2-ir-market": () => buildDay6Lesson2(),
  "w3-d6-l3-ir-story": () => buildDay6Lesson3(),
  "w3-d6-l4-ir-ask": () => buildDay6Lesson4(),
  "w3-d7-l1-gamma-draft": () => buildDay7Lesson1(),
  "w3-d7-l2-canva-design": () => buildDay7Lesson2(),
  "w3-d7-l3-deck-qa": () => buildDay7Lesson3(),
  "w3-d7-l4-export-qa": () => buildDay7Lesson4(),
  "w3-d8-l1-source-pack": () => buildDay8Lesson1(),
  "w3-d8-l2-audience-docs": () => buildDay8Lesson2(),
  "w3-d8-l3-onepager": () => buildDay8Lesson3(),
  "w3-d8-l4-number-consistency": () => buildDay8Lesson4(),
  "w3-d9-l1-demo-plan": () => buildDay9Lesson1(),
  "w3-d9-l2-capcut-loom": () => buildDay9Lesson2(),
  "w3-d9-l3-brand-kit": () => buildDay9Lesson3(),
  "w3-d9-l4-pitch-script": () => buildDay9Lesson4(),
  "w4-d10-l1-ops-flow": () => buildDay10Lesson1(),
  "w4-d10-l2-make-zapier": () => buildDay10Lesson2(),
  "w4-d10-l3-ai-classify": () => buildDay10Lesson3(),
  "w4-d10-l4-approval-ops": () => buildDay10Lesson4(),
  "w4-d11-l1-sales-diagnosis": () => buildDay11Lesson1(),
  "w4-d11-l2-sales-questions": () => buildDay11Lesson2(),
  "w4-d11-l3-objection": () => buildDay11Lesson3(),
  "w4-d11-l4-followup": () => buildDay11Lesson4(),
  "w4-d12-l1-pitch-structure": () => buildDay12Lesson1(),
  "w4-d12-l2-delivery": () => buildDay12Lesson2(),
  "w4-d12-l3-rehearsal": () => buildDay12Lesson3(),
  "w4-d12-l4-redteam": () => buildDay12Lesson4(),
  "w4-d13-l1-investor-questions": () => buildDay13Lesson1(),
  "w4-d13-l2-customer-questions": () => buildDay13Lesson2(),
  "w4-d13-l3-answer-framework": () => buildDay13Lesson3(),
  "w4-d13-l4-qa-drill": () => buildDay13Lesson4(),
  "w4-d14-l1-demo-flow": () => buildDay14Lesson1(),
  "w4-d14-l2-demo-risk": () => buildDay14Lesson2(),
  "w4-d14-l3-feedback-form": () => buildDay14Lesson3(),
  "w4-d14-l4-feedback-analysis": () => buildDay14Lesson4(),
  "w4-d15-l1-roadmap": () => buildDay15Lesson1(),
  "w4-d15-l2-kpi": () => buildDay15Lesson2(),
  "w4-d15-l3-growth": () => buildDay15Lesson3(),
  "w4-d15-l4-portfolio": () => buildDay15Lesson4(),
  "w2-d6-l1-blog-intent": () => buildDay16Lesson1(),
};

export interface LessonUploadReport {
  uploaded: string[];
  skipped: string[];
  assetsUploaded: number;
  failures: { lessonId: string; reason: string }[];
}

/** 로컬 asset을 Supabase Storage로 옮기고 (로컬id → 새id) 매핑을 만든다. */
async function migrateAssets(lesson: LessonContent, mapping: Map<string, string>): Promise<number> {
  const json = JSON.stringify(lesson.pages ?? []);
  const localIds = new Set<string>();
  for (const match of json.matchAll(/asset:\/\/([A-Za-z0-9_-]+)/g)) localIds.add(match[1]);

  let count = 0;
  for (const localId of localIds) {
    if (mapping.has(localId)) continue;
    const meta = await localAssetRepository.getAsset(localId);
    const resolved = await localAssetRepository.resolveUrl(localId);
    if (!meta || !resolved) continue;
    try {
      const blob = await (await fetch(resolved.url)).blob();
      const file = new File([blob], meta.fileName, { type: meta.mimeType });
      const { asset } = await assetRepository.uploadAsset(file);
      mapping.set(localId, asset.id);
      count += 1;
    } finally {
      resolved.revoke();
    }
  }
  return count;
}

/** 콘텐츠 안의 asset:// 참조를 새 id로 바꾼다. */
function rewriteAssetRefs(lesson: LessonContent, mapping: Map<string, string>): LessonContent {
  if (mapping.size === 0) return lesson;
  const replaced = JSON.stringify(lesson.pages).replace(
    /asset:\/\/([A-Za-z0-9_-]+)/g,
    (whole, id: string) => (mapping.has(id) ? assetIdToRef(mapping.get(id)!) : whole)
  );
  return { ...lesson, pages: JSON.parse(replaced) };
}

export async function uploadLocalLessonsToSupabase(): Promise<LessonUploadReport> {
  const report: LessonUploadReport = {
    uploaded: [],
    skipped: [],
    assetsUploaded: 0,
    failures: [],
  };
  if (!isSupabaseConfigured) return report;

  const locals = await localLessonDraftRepository.listLessons();
  const assetMapping = new Map<string, string>();

  // 로컬 Lesson들 처리
  for (const local of locals) {
    try {
      const existing = await lessonRepository.getLesson(local.id);
      if (existing) {
        report.skipped.push(local.id);
        continue;
      }
      report.assetsUploaded += await migrateAssets(local, assetMapping);
      // id·block id·참조·version·status를 그대로 들고 올라간다.
      await lessonRepository.saveLesson(rewriteAssetRefs(local, assetMapping));
      report.uploaded.push(local.id);
    } catch (error) {
      report.failures.push({
        lessonId: local.id,
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Canonical Lesson들 처리 (미등록인 것만)
  for (const meta of CANONICAL_LESSONS) {
    try {
      const existing = await lessonRepository.getLesson(meta.id);
      if (existing) {
        report.skipped.push(meta.id);
        continue;
      }

      const builder = CANONICAL_BUILDERS[meta.id];
      if (!builder) {
        report.failures.push({
          lessonId: meta.id,
          reason: "No builder found for canonical lesson",
        });
        continue;
      }

      const canonical = builder();
      report.assetsUploaded += await migrateAssets(canonical, assetMapping);
      await lessonRepository.saveLesson(rewriteAssetRefs(canonical, assetMapping));
      report.uploaded.push(meta.id);
    } catch (error) {
      report.failures.push({
        lessonId: meta.id,
        reason: stringifyUploadError(error),
      });
    }
  }

  return report;
}

/** Supabase PostgrestError는 Error 인스턴스가 아니라 평범한 객체라 String()이 "[object Object]"를 준다. */
function stringifyUploadError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const e = error as { message?: string; details?: string; hint?: string; code?: string };
    return [e.code, e.message, e.details, e.hint].filter(Boolean).join(" | ") || JSON.stringify(error);
  }
  return String(error);
}

/** 로컬에 올릴 Lesson이 있는지 미리 센다. */
export async function countLocalLessons(): Promise<number> {
  if (!isSupabaseConfigured) return 0;
  try {
    return (await localLessonDraftRepository.listLessons()).length;
  } catch {
    return 0;
  }
}

/** 참조가 남았는지 점검할 때 쓰는 유틸(테스트/디버깅용). */
export function hasLocalAssetRef(value: string | undefined): boolean {
  return isAssetRef(value) && assetRefToId(value!).startsWith("asset-");
}
