"use client";

import { lessonRepository } from "./index";
import { getLessonSeed } from "./lessonSeeds";
import type { LessonContent } from "./types";

// 원고본(코드)과 저장본(Studio에서 편집한 것)을 잇는 곳.
//
// 원칙: 원고본이 저장본을 조용히 덮지 않는다.
// 강사가 Studio에서 고친 내용이 버튼 한 번에 사라지면 안 되므로,
// "열기"는 있으면 그대로 열고, 교체는 사용자가 명시적으로 고른 경우에만 한다.

export interface LessonSnapshotStat {
  pages: number;
  blocks: number;
  status: LessonContent["status"];
  version: number;
  updatedAt: number;
}

export interface LessonSeedComparison {
  seedId: string;
  label: string;
  /** 저장소에 이미 있는 것. 없으면 undefined. */
  stored?: LessonSnapshotStat;
  /** 코드에 있는 최신 원고본. */
  incoming: Pick<LessonSnapshotStat, "pages" | "blocks">;
  /** 게시본을 덮으면 학생 화면이 예전 자료로 돌아간다 — 미리 알려야 한다. */
  willUnpublish: boolean;
}

function statOf(lesson: LessonContent): LessonSnapshotStat {
  return {
    pages: lesson.pages.length,
    blocks: lesson.pages.reduce((n, p) => n + p.blocks.length, 0),
    status: lesson.status,
    version: lesson.version,
    updatedAt: lesson.updatedAt,
  };
}

/** 덮어쓰기 직전 저장본을 파일로 내려받는다. Studio의 "JSON 가져오기"로 그대로 되돌릴 수 있다. */
const BACKUP_KEY_PREFIX = "ai-school-lesson-backup:";

export function backupFileName(lesson: LessonContent, at: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  const stamp = `${at.getFullYear()}${p(at.getMonth() + 1)}${p(at.getDate())}-${p(at.getHours())}${p(at.getMinutes())}`;
  return `backup_${lesson.id}_v${lesson.version}_${stamp}.json`;
}

function saveSnapshot(lesson: LessonContent, at: Date): string {
  const json = JSON.stringify(lesson, null, 2);
  const name = backupFileName(lesson, at);

  // 1) 파일로 내려받기 — 브라우저를 지워도 남는 유일한 사본이다.
  try {
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    // 다운로드가 막혀도 아래 사본이 남으므로 교체 자체를 중단하지는 않는다.
  }

  // 2) 브라우저에도 마지막 1개만 남긴다(누적하면 저장 한도를 넘긴다).
  try {
    localStorage.setItem(BACKUP_KEY_PREFIX + lesson.id, json);
  } catch {
    // 용량 초과 등은 무시한다 — 파일 사본이 우선이다.
  }
  return name;
}

/** 브라우저에 남아 있는 마지막 백업. 다운로드를 놓쳤을 때의 회수 경로. */
export function readLastSnapshot(lessonId: string): LessonContent | undefined {
  try {
    const raw = localStorage.getItem(BACKUP_KEY_PREFIX + lessonId);
    return raw ? (JSON.parse(raw) as LessonContent) : undefined;
  } catch {
    return undefined;
  }
}

/** 저장본과 원고본을 나란히 비교한다. 다이얼로그가 이 값을 그대로 보여준다. */
export async function compareLessonSeed(seedId: string): Promise<LessonSeedComparison> {
  const seed = getLessonSeed(seedId);
  if (!seed) throw new Error(`알 수 없는 Lesson 원고: ${seedId}`);

  const [stored, incoming] = await Promise.all([
    lessonRepository.getLesson(seed.id),
    seed.prepare(),
  ]);

  return {
    seedId: seed.id,
    label: seed.label,
    stored: stored ? statOf(stored) : undefined,
    incoming: {
      pages: incoming.pages.length,
      blocks: incoming.pages.reduce((n, p) => n + p.blocks.length, 0),
    },
    willUnpublish: stored?.status === "published",
  };
}

/**
 * 열기 — 이미 있으면 그대로 열고, 없을 때만 원고본으로 만든다.
 * 저장본을 절대 건드리지 않는다.
 */
export async function openLessonSeed(seedId: string): Promise<{ id: string; created: boolean }> {
  const seed = getLessonSeed(seedId);
  if (!seed) throw new Error(`알 수 없는 Lesson 원고: ${seedId}`);

  const existing = await lessonRepository.getLesson(seed.id);
  if (existing) return { id: seed.id, created: false };

  await lessonRepository.saveLesson(await seed.prepare());
  return { id: seed.id, created: true };
}

/**
 * 최신 원고로 교체 — 호출 전에 사용자 확인을 반드시 받아야 한다.
 *
 * 교체해도 게시하지 않는다(항상 draft). version은 이어받아서,
 * 나중에 게시하면 기존 번호 다음으로 올라간다.
 */
export async function reloadLessonSeed(
  seedId: string
): Promise<{ id: string; backupFile?: string; hadStored: boolean }> {
  const seed = getLessonSeed(seedId);
  if (!seed) throw new Error(`알 수 없는 Lesson 원고: ${seedId}`);

  const stored = await lessonRepository.getLesson(seed.id);
  const backupFile = stored ? saveSnapshot(stored, new Date()) : undefined;

  const incoming = await seed.prepare();
  await lessonRepository.saveLesson({
    ...incoming,
    id: seed.id,
    status: "draft",
    version: stored?.version ?? incoming.version,
    createdAt: stored?.createdAt ?? incoming.createdAt,
    updatedAt: Date.now(),
  });

  return { id: seed.id, backupFile, hadStored: Boolean(stored) };
}
