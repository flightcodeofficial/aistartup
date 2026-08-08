import { localAssignmentRepository } from "./repositories/localRepository";
import type { AssignmentRepository } from "./repository";

export const assignmentRepository: AssignmentRepository = localAssignmentRepository;

export type { AssignmentRepository };
export * from "./types";
