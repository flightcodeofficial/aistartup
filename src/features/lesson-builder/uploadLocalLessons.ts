"use client";

import { localLessonDraftRepository } from "./repositories/localRepository";
import { lessonRepository } from "./index";
import { localAssetRepository, assetRepository } from "@/features/assets";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { assetIdToRef, assetRefToId, isAssetRef } from "@/features/assets/types";
import type { LessonContent } from "./types";

// 이 브라우저(IndexedDB)에 만들어 둔 Lesson을 Supabase로 올린다.
//
// 이미지가 asset://{로컬id} 로 박혀 있으므로, 파일도 Storage로 옮기고
// 참조를 새 id로 바꿔줘야 다른 PC에서 그림이 보인다.
//
// 재실행 안전: 같은 Lesson id가 서버에 이미 있으면 건너뛴다(강사가 서버에서 고친 내용 보호).

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

  return report;
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
