import { ASSET_STORES, getAssetDb } from "@/lib/assetDb";
import type { AssetRepository, Unsubscribe } from "../repository";
import { assetIdToRef, type StoredAsset } from "../types";

const CHANNEL_NAME = "ai-school-assets-realtime";

function randomId() {
  return `asset-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function withDb<T>(
  fallback: T,
  fn: (db: NonNullable<Awaited<ReturnType<typeof getAssetDb>>>) => Promise<T>
): Promise<T> {
  const dbPromise = getAssetDb();
  if (!dbPromise) return fallback;
  const db = await dbPromise;
  return fn(db);
}

function broadcast() {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return;
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.postMessage({ at: Date.now() });
  channel.close();
}

/**
 * SVG는 <script>와 on* 이벤트 핸들러를 품을 수 있다.
 *
 * 1차 방어는 렌더링 방식이다 — 우리는 SVG를 항상 <img src="blob:...">로 그리는데,
 *    브라우저는 <img>로 불러온 SVG 안의 스크립트를 실행하지 않는다.
 * 2차 방어로 업로드 시점에 위험 요소를 제거해서 저장한다(파일이 다른 경로로
 *    재사용되더라도 안전하도록).
 */
/** 태그째 지워야 하는 요소들(소문자 비교). */
// <use>는 아이콘을 재사용하는 정상 SVG에서 흔히 쓰이므로 남긴다.
// (<img>로 그리는 SVG는 브라우저가 외부 리소스를 불러오지 않는다.)
const SVG_FORBIDDEN_TAGS = new Set(["script", "foreignobject", "iframe", "embed", "object"]);

export function sanitizeSvg(source: string): string {
  // 문자열 치환으로 태그를 지우면 닫는 태그만 남아 XML이 깨진다.
  // <img>로 불러오는 SVG는 XML 파서를 타기 때문에, 한 글자만 어긋나도 아예 안 그려진다.
  // 그래서 DOM으로 파싱해서 노드 단위로 걷어내고 다시 직렬화한다.
  const doc = new DOMParser().parseFromString(source, "image/svg+xml");
  if (doc.getElementsByTagName("parsererror").length > 0 || !doc.documentElement) {
    throw new Error("SVG 파일을 읽을 수 없습니다.");
  }

  const walk = (node: Element) => {
    // 자식부터 정리한다(순회 중 제거해도 안전하도록 배열로 복사).
    for (const child of Array.from(node.children)) {
      if (SVG_FORBIDDEN_TAGS.has(child.localName.toLowerCase())) {
        child.remove();
        continue;
      }
      walk(child);
    }
    for (const attr of Array.from(node.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value.replace(/\s+/g, "").toLowerCase();
      // onclick / onload 같은 이벤트 핸들러
      if (name.startsWith("on")) {
        node.removeAttribute(attr.name);
        continue;
      }
      // javascript: / data:text/html 같은 실행 가능한 URL
      if (
        (name === "href" || name === "xlink:href" || name === "src") &&
        (value.startsWith("javascript:") || value.startsWith("data:text/html"))
      ) {
        node.removeAttribute(attr.name);
      }
    }
  };

  walk(doc.documentElement);
  return new XMLSerializer().serializeToString(doc.documentElement);
}

class LocalAssetRepository implements AssetRepository {
  readonly name = "Local IndexedDB Asset Repository";

  async uploadAsset(file: File): Promise<{ asset: StoredAsset; ref: string }> {
    const id = randomId();

    // SVG는 텍스트로 읽어 위험 요소를 제거한 뒤 다시 Blob으로 만든다.
    let blob: Blob = file;
    if (file.type === "image/svg+xml") {
      const cleaned = sanitizeSvg(await file.text());
      blob = new Blob([cleaned], { type: "image/svg+xml" });
    }

    const asset: StoredAsset = {
      id,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      size: blob.size,
      createdAt: Date.now(),
    };

    await withDb(undefined, async (db) => {
      await db.put(ASSET_STORES.assets, asset);
      await db.put(ASSET_STORES.blobs, blob, id);
    });
    broadcast();
    return { asset, ref: assetIdToRef(id) };
  }

  async getAsset(assetId: string): Promise<StoredAsset | undefined> {
    return withDb<StoredAsset | undefined>(undefined, (db) => db.get(ASSET_STORES.assets, assetId));
  }

  async resolveUrl(assetId: string): Promise<{ url: string; revoke: () => void } | undefined> {
    return withDb<{ url: string; revoke: () => void } | undefined>(undefined, async (db) => {
      const blob = (await db.get(ASSET_STORES.blobs, assetId)) as Blob | undefined;
      if (!blob) return undefined;
      const url = URL.createObjectURL(blob);
      return { url, revoke: () => URL.revokeObjectURL(url) };
    });
  }

  async listRecent(limit = 12): Promise<StoredAsset[]> {
    return withDb<StoredAsset[]>([], async (db) => {
      const all = (await db.getAll(ASSET_STORES.assets)) as StoredAsset[];
      return all.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
    });
  }

  async deleteAsset(assetId: string): Promise<void> {
    await withDb(undefined, async (db) => {
      await db.delete(ASSET_STORES.assets, assetId);
      await db.delete(ASSET_STORES.blobs, assetId);
    });
    broadcast();
  }

  subscribe(callback: () => void): Unsubscribe {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return () => {};
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.addEventListener("message", callback);
    return () => {
      channel.removeEventListener("message", callback);
      channel.close();
    };
  }
}

export const localAssetRepository = new LocalAssetRepository();
