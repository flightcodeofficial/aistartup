import type { StoredAsset } from "./types";

// UI는 이 인터페이스만 안다. 실제 저장 매체(IndexedDB / 나중엔 Supabase Storage)는 모른다.
// 교체 지점은 features/assets/index.ts 한 줄.

export type Unsubscribe = () => void;

export interface AssetRepository {
  readonly name: string;

  /** 파일을 저장하고 블록에 넣을 참조(asset://{id})를 돌려준다. */
  uploadAsset(file: File): Promise<{ asset: StoredAsset; ref: string }>;
  getAsset(assetId: string): Promise<StoredAsset | undefined>;
  /** 화면에 그릴 수 있는 URL을 만든다. 로컬 어댑터는 objectURL을 반환하므로 해제가 필요하다. */
  resolveUrl(assetId: string): Promise<{ url: string; revoke: () => void } | undefined>;
  listRecent(limit?: number): Promise<StoredAsset[]>;
  deleteAsset(assetId: string): Promise<void>;

  subscribe(callback: () => void): Unsubscribe;
}
