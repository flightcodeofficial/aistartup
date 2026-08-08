"use client";

import { assetRepository } from "@/features/assets";
import { lessonRepository } from "./index";
import {
  buildDay1Lesson1,
  DAY1_LESSON1_ASSET_FILES,
  DAY1_LESSON1_ID,
  type Day1Lesson1Assets,
} from "./day1Lesson1";

// 실제 수업 Lesson을 Studio에 설치한다.
//
// 인포그래픽 SVG는 public에 놓인 원본을 읽어 Asset Repository에 올리고,
// 블록에는 asset:// 참조만 남긴다. 나중에 저장소가 Supabase Storage로 바뀌어도
// 콘텐츠 파일은 그대로 두고 저장소만 교체하면 된다.

async function uploadFromPublic(path: string): Promise<string> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path} 를 읽지 못했습니다.`);
  const blob = await res.blob();
  const fileName = path.split("/").pop() ?? "asset.svg";
  const file = new File([blob], fileName, { type: "image/svg+xml" });
  const { ref } = await assetRepository.uploadAsset(file);
  return ref;
}

/**
 * 이미 설치돼 있으면 아무것도 하지 않는다(강사가 편집한 내용을 덮어쓰지 않기 위해).
 * 업로드가 실패하면 public 경로를 그대로 쓴다 — 그림이 안 나오는 것보다 낫다.
 */
export async function installDay1Lesson1(): Promise<{ id: string; assetsUploaded: boolean }> {
  const existing = await lessonRepository.getLesson(DAY1_LESSON1_ID);
  if (existing) return { id: DAY1_LESSON1_ID, assetsUploaded: false };

  let assets: Day1Lesson1Assets = { ...DAY1_LESSON1_ASSET_FILES };
  let assetsUploaded = false;
  try {
    const [aiMarketingShift, imaginedVsEvidence, stpMap] = await Promise.all([
      uploadFromPublic(DAY1_LESSON1_ASSET_FILES.aiMarketingShift),
      uploadFromPublic(DAY1_LESSON1_ASSET_FILES.imaginedVsEvidence),
      uploadFromPublic(DAY1_LESSON1_ASSET_FILES.stpMap),
    ]);
    assets = { aiMarketingShift, imaginedVsEvidence, stpMap };
    assetsUploaded = true;
  } catch {
    // public 경로 폴백 유지
  }

  await lessonRepository.saveLesson(buildDay1Lesson1(assets));
  return { id: DAY1_LESSON1_ID, assetsUploaded };
}
