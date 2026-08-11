"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, FolderOpen, Link2, Loader2, Upload } from "lucide-react";
import { resourceRepository } from "@/features/resources";
import type { Resource } from "@/features/resources/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { StaffOnly } from "@/features/auth/StaffOnly";

function formatFileSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    setResources(await resourceRepository.listResources());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const unsubscribe = resourceRepository.subscribe(refresh);
    return unsubscribe;
  }, [refresh]);

  const handleUpload = async () => {
    if (!title.trim()) return;
    setUploading(true);
    try {
      await resourceRepository.uploadResource({
        title,
        description,
        file: file ?? undefined,
        linkUrl: linkUrl || undefined,
      });
      setTitle("");
      setDescription("");
      setLinkUrl("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:px-8 sm:py-10">
      <div>
        <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          <FolderOpen className="size-3.5" />
          커뮤니티
        </p>
        <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">자료실</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          PDF, 예제, 템플릿을 올리고 다운로드할 수 있습니다.
        </p>
      </div>

      <StaffOnly silent>
        <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
          <div>
            <Label htmlFor="r-title">제목</Label>
            <Input
              id="r-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 2주차 STP 템플릿"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="r-desc">설명</Label>
            <Textarea
              id="r-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="자료에 대한 간단한 설명"
              rows={2}
              className="mt-1.5"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="r-file">파일 업로드</Label>
              <Input
                id="r-file"
                ref={fileInputRef}
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="r-link">또는 링크</Label>
              <Input
                id="r-link"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1.5"
              />
            </div>
          </div>
          <Button onClick={handleUpload} disabled={uploading || !title.trim()} className="gap-2">
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            업로드
          </Button>
        </div>
      </StaffOnly>

      <div className="space-y-2">
        {!loading && resources.length === 0 && (
          <p className="text-sm text-muted-foreground">아직 등록된 자료가 없습니다.</p>
        )}
        {resources.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{r.title}</p>
              {r.description && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{r.description}</p>
              )}
              <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                {r.uploadedByNickname} · {formatRelativeTime(r.createdAt)}
                {r.fileName && ` · ${r.fileName} (${formatFileSize(r.fileSize)})`}
                {r.linkUrl && (
                  <span className="flex items-center gap-1">
                    <Link2 className="size-3" />
                    링크
                  </span>
                )}
                {" · 다운로드 "}
                {r.downloadCount}
                회
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5"
              onClick={() => resourceRepository.downloadResource(r.id)}
            >
              <Download className="size-3.5" />
              받기
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
