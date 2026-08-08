import { getLmsDb, LMS_STORES } from "@/lib/lmsDb";
import { getCurrentUser } from "@/features/community/currentUser";
import { broadcastCommunityChange, subscribeCommunityChange } from "@/features/community/realtimeChannel";
import type { ResourceRepository, Unsubscribe } from "../repository";
import type { Resource } from "../types";

function randomId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function withDb<T>(
  fallback: T,
  fn: (db: NonNullable<Awaited<ReturnType<typeof getLmsDb>>>) => Promise<T>
): Promise<T> {
  const dbPromise = getLmsDb();
  if (!dbPromise) return fallback;
  const db = await dbPromise;
  return fn(db);
}

class LocalResourceRepository implements ResourceRepository {
  readonly name = "Local IndexedDB Resource Repository (데모용)";

  async listResources(): Promise<Resource[]> {
    return withDb<Resource[]>([], async (db) => {
      const all = await db.getAll(LMS_STORES.resources);
      return all.sort((a, b) => b.createdAt - a.createdAt);
    });
  }

  async uploadResource(input: {
    title: string;
    description: string;
    file?: File;
    linkUrl?: string;
  }): Promise<Resource> {
    const user = getCurrentUser();
    const resource: Resource = {
      id: randomId("resource"),
      title: input.title,
      description: input.description,
      uploadedByNickname: user.nickname,
      fileName: input.file?.name,
      fileType: input.file?.type,
      fileSize: input.file?.size,
      linkUrl: input.linkUrl,
      downloadCount: 0,
      createdAt: Date.now(),
    };
    await withDb(undefined, async (db) => {
      await db.put(LMS_STORES.resources, resource);
      if (input.file) {
        await db.put(LMS_STORES.resourceFiles, { resourceId: resource.id, blob: input.file });
      }
    });
    broadcastCommunityChange("posts");
    return resource;
  }

  async downloadResource(resourceId: string): Promise<void> {
    const resource = await withDb<Resource | undefined>(undefined, (db) =>
      db.get(LMS_STORES.resources, resourceId)
    );
    if (!resource) return;

    if (resource.linkUrl) {
      window.open(resource.linkUrl, "_blank", "noopener,noreferrer");
    } else {
      const fileRecord = await withDb<{ blob: Blob } | undefined>(undefined, (db) =>
        db.get(LMS_STORES.resourceFiles, resourceId)
      );
      if (fileRecord?.blob) {
        const url = URL.createObjectURL(fileRecord.blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = resource.fileName ?? resource.title;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }

    await withDb(undefined, async (db) => {
      const r = await db.get(LMS_STORES.resources, resourceId);
      if (r) {
        r.downloadCount += 1;
        await db.put(LMS_STORES.resources, r);
      }
    });
    broadcastCommunityChange("posts");
  }

  subscribe(callback: () => void): Unsubscribe {
    return subscribeCommunityChange("posts", callback);
  }
}

export const localResourceRepository = new LocalResourceRepository();
