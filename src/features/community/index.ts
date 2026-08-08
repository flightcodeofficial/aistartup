import { localCommunityRepository } from "./repositories/localRepository";
import type { CommunityRepository } from "./repository";

// 나중에 Supabase로 확장할 때는 이 한 줄만
// export const communityRepository: CommunityRepository = supabaseCommunityRepository;
// 로 바꾸면 된다. UI는 CommunityRepository 인터페이스만 알고 있어 수정이 필요 없다.
export const communityRepository: CommunityRepository = localCommunityRepository;

export type { CommunityRepository };
export * from "./types";
