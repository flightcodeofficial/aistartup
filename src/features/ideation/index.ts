import { mockFacilitatorProvider } from "./providers/mockFacilitatorProvider";
import type { IdeationProvider } from "./provider";

// 나중에 무료 API 기반 Provider로 교체할 때는 이 한 줄만 바꾸면 된다.
// export const ideationProvider: IdeationProvider = realApiFacilitatorProvider;
export const ideationProvider: IdeationProvider = mockFacilitatorProvider;

export type { IdeationProvider };
export * from "./types";
