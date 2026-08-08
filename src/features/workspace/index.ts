import { localWorkspaceRepository } from "./repositories/localRepository";
import { supabaseWorkspaceRepository } from "./repositories/supabaseRepository";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { WorkspaceRepository } from "./repository";

// 운영에서는 Supabase, 접속 정보가 없으면 로컬(IndexedDB).
// 로컬 어댑터는 "이 브라우저의 기존 작업 가져오기"에서 원본을 읽을 때도 계속 쓰인다.
export const workspaceRepository: WorkspaceRepository = isSupabaseConfigured
  ? supabaseWorkspaceRepository
  : localWorkspaceRepository;

/** 가져오기 원본(항상 로컬). 마이그레이션 도구가 직접 참조한다. */
export { localWorkspaceRepository };

export const isRemoteWorkspaceStore = isSupabaseConfigured;

export type { WorkspaceRepository };
export * from "./types";
