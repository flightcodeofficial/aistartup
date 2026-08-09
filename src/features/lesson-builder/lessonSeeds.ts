"use client";

import { assetRepository } from "@/features/assets";
import type { LessonContent } from "./types";
import {
  buildDay1Lesson1,
  DAY1_LESSON1_ASSET_FILES,
  DAY1_LESSON1_ID,
  type Day1Lesson1Assets,
} from "./day1Lesson1";
import {
  buildDay1Lesson2,
  DAY1_LESSON2_ASSET_FILES,
  DAY1_LESSON2_ID,
  type Day1Lesson2Assets,
} from "./day1Lesson2";
import {
  buildDay1Lesson3,
  DAY1_LESSON3_ASSET_FILES,
  DAY1_LESSON3_ID,
  type Day1Lesson3Assets,
} from "./day1Lesson3";
import {
  buildDay1Lesson4,
  DAY1_LESSON4_ASSET_FILES,
  DAY1_LESSON4_ID,
  type Day1Lesson4Assets,
} from "./day1Lesson4";

// 코드에 들어 있는 "원고본" Lesson 목록.
//
// 원고는 content/*.content.json에 있고, 여기서는 저장소에 넣기 직전 준비(자산 업로드 등)만 한다.
// Lesson2·3·4가 생기면 이 배열에 한 줄씩 추가하면 나머지 UI는 그대로 동작한다.

export interface LessonSeed {
  /** 저장소에 들어갈 Lesson id. 원고본과 저장본을 잇는 유일한 키다. */
  id: string;
  /** 버튼·다이얼로그에 쓰는 이름. */
  label: string;
  /** 최신 원고본을 만든다. 자산 업로드처럼 시간이 걸리는 준비도 여기서 한다. */
  prepare(): Promise<LessonContent>;
}

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
 * 인포그래픽 SVG를 Asset Repository에 올리고 asset:// 참조로 바꾼 원고본을 만든다.
 * 업로드가 실패하면 public 경로를 그대로 쓴다 — 그림이 안 나오는 것보다 낫다.
 */
async function prepareDay1Lesson1(): Promise<LessonContent> {
  let assets: Day1Lesson1Assets = { ...DAY1_LESSON1_ASSET_FILES };
  try {
    const [aiMarketingShift, imaginedVsEvidence, stpMap] = await Promise.all([
      uploadFromPublic(DAY1_LESSON1_ASSET_FILES.aiMarketingShift),
      uploadFromPublic(DAY1_LESSON1_ASSET_FILES.imaginedVsEvidence),
      uploadFromPublic(DAY1_LESSON1_ASSET_FILES.stpMap),
    ]);
    assets = { aiMarketingShift, imaginedVsEvidence, stpMap };
  } catch {
    // public 경로 폴백 유지
  }
  return buildDay1Lesson1(assets);
}

/**
 * P03/P07의 image 블록 SVG를 Asset Repository에 올리고 asset:// 참조로 바꾼 원고본을 만든다.
 * 업로드가 실패하면 public 경로를 그대로 쓴다.
 */
async function prepareDay1Lesson2(): Promise<LessonContent> {
  let assets: Day1Lesson2Assets = { ...DAY1_LESSON2_ASSET_FILES };
  try {
    const [evidenceStrengthLadder, sourceTraceChain] = await Promise.all([
      uploadFromPublic(DAY1_LESSON2_ASSET_FILES.evidenceStrengthLadder),
      uploadFromPublic(DAY1_LESSON2_ASSET_FILES.sourceTraceChain),
    ]);
    assets = { evidenceStrengthLadder, sourceTraceChain };
  } catch {
    // public 경로 폴백 유지
  }
  return buildDay1Lesson2(assets);
}

/**
 * P03의 image 블록 SVG를 Asset Repository에 올리고 asset:// 참조로 바꾼 원고본을 만든다.
 * 업로드가 실패하면 public 경로를 그대로 쓴다.
 */
async function prepareDay1Lesson3(): Promise<LessonContent> {
  let assets: Day1Lesson3Assets = { ...DAY1_LESSON3_ASSET_FILES };
  try {
    const [segmentMap] = await Promise.all([
      uploadFromPublic(DAY1_LESSON3_ASSET_FILES.segmentMap),
    ]);
    assets = { segmentMap };
  } catch {
    // public 경로 폴백 유지
  }
  return buildDay1Lesson3(assets);
}

/**
 * P02/P08의 image 블록 SVG를 Asset Repository에 올리고 asset:// 참조로 바꾼 원고본을 만든다.
 * 업로드가 실패하면 public 경로를 그대로 쓴다.
 */
async function prepareDay1Lesson4(): Promise<LessonContent> {
  let assets: Day1Lesson4Assets = { ...DAY1_LESSON4_ASSET_FILES };
  try {
    const [evidencePersona, valuePropositionBridge] = await Promise.all([
      uploadFromPublic(DAY1_LESSON4_ASSET_FILES.evidencePersona),
      uploadFromPublic(DAY1_LESSON4_ASSET_FILES.valuePropositionBridge),
    ]);
    assets = { evidencePersona, valuePropositionBridge };
  } catch {
    // public 경로 폴백 유지
  }
  return buildDay1Lesson4(assets);
}

export const LESSON_SEEDS: LessonSeed[] = [
  {
    id: DAY1_LESSON1_ID,
    label: "2주차 Day1 Lesson1 (1교시)",
    prepare: prepareDay1Lesson1,
  },
  {
    id: DAY1_LESSON2_ID,
    label: "2주차 Day1 Lesson2 (2교시)",
    prepare: prepareDay1Lesson2,
  },
  {
    id: DAY1_LESSON3_ID,
    label: "2주차 Day1 Lesson3 (3교시)",
    prepare: prepareDay1Lesson3,
  },
  {
    id: DAY1_LESSON4_ID,
    label: "2주차 Day1 Lesson4 (4교시)",
    prepare: prepareDay1Lesson4,
  },
];

export function getLessonSeed(seedId: string): LessonSeed | undefined {
  return LESSON_SEEDS.find((s) => s.id === seedId);
}
