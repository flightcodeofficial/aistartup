import { localResourceRepository } from "./repositories/localRepository";
import { supabaseResourceRepository } from "./repositories/supabaseRepository";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { ResourceRepository } from "./repository";

// 운영에서는 Supabase Storage(모두 공유), 접속 정보가 없으면 로컬(이 브라우저만).
export const resourceRepository: ResourceRepository = isSupabaseConfigured
  ? supabaseResourceRepository
  : localResourceRepository;

export const isRemoteResourceStore = isSupabaseConfigured;

export type { ResourceRepository };
export * from "./types";
