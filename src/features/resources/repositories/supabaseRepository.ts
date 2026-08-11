"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getCurrentAuthUserId } from "@/features/auth/currentUser";
import type { ResourceRepository, Unsubscribe } from "../repository";
import type { Resource } from "../types";

// Supabase Storage 어댑터. lesson-assets와 같은 모양(메타데이터 테이블 + private
// Storage 버킷)이지만 별도 테이블/버킷(resources / resource-files)을 쓴다 —
// 자료실 자료는 특정 Lesson published 상태를 따르지 않고, 로그인한 사람이면
// 항상 볼 수 있어야 하기 때문이다(정책은 0003_resources.sql 참고).

const BUCKET = "resource-files";
/** signed URL 수명(초). 다운로드 클릭 한 번이면 충분하되 오래 떠돌지 않을 길이. */
const SIGNED_URL_TTL = 5 * 60;

function newResourceId() {
  return `resource-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** 한글·공백·특수문자가 섞인 파일명이 Storage 경로를 깨뜨리지 않게 정리한다. */
function safeFileName(name: string): string {
  const cleaned = name.replace(/[^\w.\-]+/g, "_").replace(/_{2,}/g, "_");
  return cleaned.length > 0 ? cleaned.slice(-120) : "file";
}

interface ResourceRow {
  id: string;
  title: string;
  description: string | null;
  file_name: string | null;
  mime_type: string | null;
  size: number | null;
  storage_path: string | null;
  link_url: string | null;
  uploaded_by_name: string | null;
  download_count: number;
  created_at: string;
}

function rowToResource(row: ResourceRow): Resource {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    uploadedByNickname: row.uploaded_by_name ?? "강사",
    fileName: row.file_name ?? undefined,
    fileType: row.mime_type ?? undefined,
    fileSize: row.size ?? undefined,
    linkUrl: row.link_url ?? undefined,
    downloadCount: row.download_count,
    createdAt: new Date(row.created_at).getTime(),
  };
}

const CHANNEL = "resources-realtime";

class SupabaseResourceRepository implements ResourceRepository {
  readonly name = "Supabase Storage Resource Repository";

  private client() {
    const c = getSupabaseBrowserClient();
    if (!c) throw new Error("Supabase 접속 정보가 없습니다.");
    return c;
  }

  private async currentDisplayName(): Promise<string> {
    const client = this.client();
    const { data } = await client.auth.getSession();
    const userId = data.session?.user.id;
    if (!userId) return "강사";
    const { data: profile } = await client
      .from("profiles")
      .select("display_name, email")
      .eq("id", userId)
      .maybeSingle();
    const row = profile as { display_name: string | null; email: string | null } | null;
    return row?.display_name || row?.email || "강사";
  }

  async listResources(): Promise<Resource[]> {
    const { data, error } = await this.client()
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as ResourceRow[]).map(rowToResource);
  }

  async uploadResource(input: {
    title: string;
    description: string;
    file?: File;
    linkUrl?: string;
  }): Promise<Resource> {
    const client = this.client();
    const id = newResourceId();

    let storagePath: string | undefined;
    if (input.file) {
      storagePath = `resources/${id}/${safeFileName(input.file.name)}`;
      const { error: uploadError } = await client.storage.from(BUCKET).upload(storagePath, input.file, {
        contentType: input.file.type || "application/octet-stream",
        upsert: false,
      });
      if (uploadError) throw uploadError;
    }

    const userId = await getCurrentAuthUserId();
    const uploaderName = await this.currentDisplayName();

    const { data, error } = await client
      .from("resources")
      .insert({
        id,
        title: input.title,
        description: input.description || null,
        file_name: input.file?.name ?? null,
        mime_type: input.file?.type || null,
        size: input.file?.size ?? null,
        storage_path: storagePath ?? null,
        link_url: input.linkUrl ?? null,
        uploaded_by_name: uploaderName,
        ...(userId ? { created_by: userId } : {}),
      })
      .select()
      .single();

    if (error) {
      // 메타데이터를 못 만들면 참조 불가능한 고아 파일이 남는다. 되돌린다.
      if (storagePath) await client.storage.from(BUCKET).remove([storagePath]);
      throw error;
    }

    return rowToResource(data as ResourceRow);
  }

  async downloadResource(resourceId: string): Promise<void> {
    const client = this.client();
    const { data: row, error } = await client
      .from("resources")
      .select("*")
      .eq("id", resourceId)
      .maybeSingle();
    if (error || !row) return;
    const resource = row as ResourceRow;

    if (resource.link_url) {
      window.open(resource.link_url, "_blank", "noopener,noreferrer");
    } else if (resource.storage_path) {
      const { data: signed, error: signError } = await client.storage
        .from(BUCKET)
        .createSignedUrl(resource.storage_path, SIGNED_URL_TTL);
      if (!signError && signed?.signedUrl) {
        const a = document.createElement("a");
        a.href = signed.signedUrl;
        a.download = resource.file_name ?? resource.title;
        a.target = "_blank";
        a.rel = "noopener,noreferrer";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    }

    await client
      .from("resources")
      .update({ download_count: resource.download_count + 1 })
      .eq("id", resourceId);
  }

  subscribe(callback: () => void): Unsubscribe {
    const client = getSupabaseBrowserClient();
    if (!client) return () => {};
    const channel = client
      .channel(CHANNEL)
      .on("postgres_changes", { event: "*", schema: "public", table: "resources" }, () => callback())
      .subscribe();
    return () => {
      void client.removeChannel(channel);
    };
  }
}

export const supabaseResourceRepository = new SupabaseResourceRepository();
