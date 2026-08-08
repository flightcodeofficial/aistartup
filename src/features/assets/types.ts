// 관리자가 Studio에서 직접 올린 이미지 자산.
//
// 저장 위치는 지금 IndexedDB지만, 블록 데이터에는 "asset://{id}" 형태의 참조만 남긴다.
// 나중에 Supabase Storage로 바꿔도 블록 콘텐츠는 손댈 필요가 없고,
// 참조를 실제 URL로 바꾸는 해석기(useAssetUrl)만 교체하면 된다.

export const ASSET_REF_PREFIX = "asset://";

export const SUPPORTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
] as const;

export const SUPPORTED_IMAGE_EXTENSIONS = ".png,.jpg,.jpeg,.webp,.svg";

export interface StoredAsset {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: number;
}

export function isAssetRef(value: string | undefined): boolean {
  return Boolean(value && value.startsWith(ASSET_REF_PREFIX));
}

export function assetRefToId(ref: string): string {
  return ref.slice(ASSET_REF_PREFIX.length);
}

export function assetIdToRef(id: string): string {
  return `${ASSET_REF_PREFIX}${id}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
