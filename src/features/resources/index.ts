import { localResourceRepository } from "./repositories/localRepository";
import type { ResourceRepository } from "./repository";

export const resourceRepository: ResourceRepository = localResourceRepository;

export type { ResourceRepository };
export * from "./types";
