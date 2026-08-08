import { mockAIProvider } from "./mockProvider";
import type { AIProvider } from "./provider";

// 나중에 ChatGPT API 등 실제 Provider로 교체할 때는 이 한 줄만 바꾸면 된다.
export const aiProvider: AIProvider = mockAIProvider;

export type { AIProvider };
