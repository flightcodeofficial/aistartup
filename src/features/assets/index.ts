import { localAssetRepository } from "./repositories/localRepository";
import { supabaseAssetRepository } from "./repositories/supabaseRepository";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { AssetRepository } from "./repository";

// 운영에서는 Supabase Storage, 접속 정보가 없으면 로컬(IndexedDB).
export const assetRepository: AssetRepository = isSupabaseConfigured
  ? supabaseAssetRepository
  : localAssetRepository;

/** 가져오기 원본(항상 로컬). 이 브라우저에 남은 이미지를 서버로 올릴 때 쓴다. */
export { localAssetRepository };

/** Lesson 소속 기록은 Supabase 어댑터에만 있는 기능이라 별도로 노출한다. */
export { supabaseAssetRepository };

export const isRemoteAssetStore = isSupabaseConfigured;

export type { AssetRepository };
export * from "./types";
