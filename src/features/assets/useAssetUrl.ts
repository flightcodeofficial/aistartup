"use client";

import { useEffect, useState } from "react";
import { assetRepository } from "./index";
import { assetRefToId, isAssetRef } from "./types";

/**
 * 블록에 저장된 이미지 소스를 화면에 그릴 수 있는 URL로 바꾼다.
 *
 * - "asset://{id}"  → 저장소에서 꺼내 objectURL 생성 (언마운트/변경 시 해제)
 * - 그 외("/local.png", "https://...") → 그대로 사용
 *
 * 저장 매체가 Supabase Storage로 바뀌면 이 훅만 실제 URL을 돌려주도록 고치면 되고,
 * 블록 데이터와 렌더러는 손대지 않는다.
 */
export function useAssetUrl(src: string | undefined): {
  url: string | undefined;
  loading: boolean;
  missing: boolean;
} {
  const [state, setState] = useState<{
    url: string | undefined;
    loading: boolean;
    missing: boolean;
  }>(() => ({
    url: src && !isAssetRef(src) ? src : undefined,
    loading: Boolean(src && isAssetRef(src)),
    missing: false,
  }));

  useEffect(() => {
    if (!src) {
      setState({ url: undefined, loading: false, missing: false });
      return;
    }
    if (!isAssetRef(src)) {
      setState({ url: src, loading: false, missing: false });
      return;
    }

    let cancelled = false;
    let revoke: (() => void) | undefined;
    setState({ url: undefined, loading: true, missing: false });

    assetRepository
      .resolveUrl(assetRefToId(src))
      .then((resolved) => {
        if (cancelled) {
          resolved?.revoke();
          return;
        }
        if (!resolved) {
          setState({ url: undefined, loading: false, missing: true });
          return;
        }
        revoke = resolved.revoke;
        setState({ url: resolved.url, loading: false, missing: false });
      })
      .catch(() => {
        if (!cancelled) setState({ url: undefined, loading: false, missing: true });
      });

    return () => {
      cancelled = true;
      revoke?.();
    };
  }, [src]);

  return state;
}
