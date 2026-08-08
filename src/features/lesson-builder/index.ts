import { localLessonDraftRepository } from "./repositories/localRepository";
import { supabaseLessonRepository } from "./repositories/supabaseRepository";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { LessonDraftRepository } from "./repository";

// 운영에서는 Supabase, 접속 정보가 없으면 로컬(IndexedDB)로 떨어진다.
// 로컬 어댑터는 삭제하지 않는다 — 키 없이 개발하거나 데모할 때 그대로 쓴다.
export const lessonRepository: LessonDraftRepository = isSupabaseConfigured
  ? supabaseLessonRepository
  : localLessonDraftRepository;

/** 지금 어떤 저장소가 쓰이는지(화면 안내·마이그레이션 판단용). */
export const isRemoteLessonStore = isSupabaseConfigured;

export type { LessonDraftRepository };
export * from "./types";
