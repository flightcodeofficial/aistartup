"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getCurrentAuthUserId } from "@/features/auth/currentUser";
import type { AssetRepository, Unsubscribe } from "../repository";
import type { StoredAsset } from "../types";
import { assetIdToRef } from "../types";
import { sanitizeSvg } from "./localRepository";

// Supabase Storage 어댑터.
//
// 블록에는 여전히 "asset://{id}"만 저장한다. 저장 매체가 바뀌어도 콘텐츠 JSON은
// 손대지 않는다는 원칙을 그대로 지킨다 — 여기서만 실제 URL을 만든다.
//
// 버킷은 private다. 학생에게는 published Lesson에 붙은 파일만 보여야 하므로
// public URL 대신 짧은 수명의 signed URL을 발급한다(정책은 SQL 참고).

const BUCKET = "lesson-assets";
/** signed URL 수명(초). 한 페이지 머무는 시간보다 넉넉하되 오래 돌아다니지 않을 길이. */
const SIGNED_URL_TTL = 60 * 60;

function newAssetId() {
  return `asset-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** 한글·공백·특수문자가 섞인 파일명이 Storage 경로를 깨뜨리지 않게 정리한다. */
function safeFileName(name: string): string {
  const cleaned = name.replace(/[^\w.\-]+/g, "_").replace(/_{2,}/g, "_");
  return cleaned.length > 0 ? cleaned.slice(-120) : "asset";
}

interface AssetRow {
  id: string;
  lesson_id: string | null;
  file_name: string;
  mime_type: string;
  size: number;
  storage_path: string;
  created_at: string;
}

function rowToAsset(row: AssetRow): StoredAsset {
  return {
    id: row.id,
    fileName: row.file_name,
    mimeType: row.mime_type,
    size: Number(row.size),
    createdAt: new Date(row.created_at).getTime(),
  };
}

const CHANNEL = "lesson-assets-realtime";

class SupabaseAssetRepository implements AssetRepository {
  readonly name = "Supabase Storage Asset Repository";

  private client() {
    const c = getSupabaseBrowserClient();
    if (!c) throw new Error("Supabase 접속 정보가 없습니다.");
    return c;
  }

  async uploadAsset(file: File): Promise<{ asset: StoredAsset; ref: string }> {
    const client = this.client();
    const id = newAssetId();

    // SVG는 업로드 전에 정리한다. 로컬 어댑터와 완전히 같은 함수를 쓴다 —
    // 저장 위치가 달라졌다고 보안 규칙이 달라지면 안 된다.
    let body: Blob = file;
    if (file.type === "image/svg+xml") {
      body = new Blob([sanitizeSvg(await file.text())], { type: "image/svg+xml" });
    }

    // 경로에 assetId를 넣어 같은 파일명이 서로를 덮어쓰지 않게 한다.
    const path = `lessons/shared/${id}/${safeFileName(file.name)}`;

    const { error: uploadError } = await client.storage.from(BUCKET).upload(path, body, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
    if (uploadError) throw uploadError;

    const userId = await getCurrentAuthUserId();
    const { data, error } = await client
      .from("lesson_assets")
      .insert({
        id,
        lesson_id: null,
        file_name: file.name,
        mime_type: file.type || "application/octet-stream",
        size: body.size,
        storage_path: path,
        ...(userId ? { created_by: userId } : {}),
      })
      .select()
      .single();

    if (error) {
      // 메타데이터를 못 만들면 참조 불가능한 고아 파일이 남는다. 되돌린다.
      await client.storage.from(BUCKET).remove([path]);
      throw error;
    }

    return { asset: rowToAsset(data as AssetRow), ref: assetIdToRef(id) };
  }

  async getAsset(assetId: string): Promise<StoredAsset | undefined> {
    const { data, error } = await this.client()
      .from("lesson_assets")
      .select("*")
      .eq("id", assetId)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToAsset(data as AssetRow) : undefined;
  }

  async resolveUrl(assetId: string): Promise<{ url: string; revoke: () => void } | undefined> {
    const client = this.client();
    const { data: row, error } = await client
      .from("lesson_assets")
      .select("storage_path")
      .eq("id", assetId)
      .maybeSingle();
    if (error || !row) return undefined;

    const { data, error: signError } = await client.storage
      .from(BUCKET)
      .createSignedUrl((row as { storage_path: string }).storage_path, SIGNED_URL_TTL);
    if (signError || !data?.signedUrl) return undefined;

    // objectURL이 아니므로 해제할 게 없다. 인터페이스를 맞추기 위한 빈 함수.
    return { url: data.signedUrl, revoke: () => {} };
  }

  async listRecent(limit = 12): Promise<StoredAsset[]> {
    const { data, error } = await this.client()
      .from("lesson_assets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data as AssetRow[]).map(rowToAsset);
  }

  async deleteAsset(assetId: string): Promise<void> {
    const client = this.client();
    const { data: row } = await client
      .from("lesson_assets")
      .select("storage_path")
      .eq("id", assetId)
      .maybeSingle();

    if (row) {
      await client.storage.from(BUCKET).remove([(row as { storage_path: string }).storage_path]);
    }
    const { error } = await client.from("lesson_assets").delete().eq("id", assetId);
    if (error) throw error;
  }

  /** 이 Asset이 어느 Lesson 소속인지 기록한다(Storage 읽기 정책의 판단 근거). */
  async attachToLesson(assetId: string, lessonId: string): Promise<void> {
    const { error } = await this.client()
      .from("lesson_assets")
      .update({ lesson_id: lessonId })
      .eq("id", assetId);
    if (error) throw error;
  }

  subscribe(callback: () => void): Unsubscribe {
    const client = getSupabaseBrowserClient();
    if (!client) return () => {};
    const channel = client
      .channel(CHANNEL)
      .on("postgres_changes", { event: "*", schema: "public", table: "lesson_assets" }, () =>
        callback()
      )
      .subscribe();
    return () => {
      void client.removeChannel(channel);
    };
  }
}

export const supabaseAssetRepository = new SupabaseAssetRepository();
