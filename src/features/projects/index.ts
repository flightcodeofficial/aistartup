import { localProjectRepository } from "./repositories/localRepository";
import type { ProjectRepository } from "./repository";

// 나중에 Supabase/Firebase/Appwrite로 교체할 때는 이 한 줄만 바꾸면 된다.
export const projectRepository: ProjectRepository = localProjectRepository;

export type { ProjectRepository };
export * from "./types";
