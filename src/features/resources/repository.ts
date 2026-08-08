// Resource Repository 인터페이스 (Repository Pattern)
// 지금은 파일을 IndexedDB에 Blob으로 저장한다. 나중에 Supabase Storage 등으로 교체할 때는
// downloadResource()가 실제 파일 URL을 가져오도록만 바꾸면 된다.
import type { Resource } from "./types";

export type Unsubscribe = () => void;

export interface ResourceRepository {
  readonly name: string;
  listResources(): Promise<Resource[]>;
  uploadResource(input: {
    title: string;
    description: string;
    file?: File;
    linkUrl?: string;
  }): Promise<Resource>;
  downloadResource(resourceId: string): Promise<void>;
  subscribe(callback: () => void): Unsubscribe;
}
