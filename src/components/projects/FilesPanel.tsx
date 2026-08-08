"use client";

import { useRef, useState } from "react";
import { Download, Loader2, Paperclip, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import type { ProjectFile } from "@/features/projects/types";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function FilesPanel({
  files,
  editable,
  onUpload,
  onDownload,
  onDelete,
}: {
  files: ProjectFile[];
  editable: boolean;
  onUpload: (file: File) => Promise<void>;
  onDownload: (fileId: string) => Promise<void>;
  onDelete: (fileId: string) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
          <Paperclip className="size-4 text-primary" />
          파일
        </p>
        {editable && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
            업로드
          </Button>
        )}
        <input ref={inputRef} type="file" className="hidden" onChange={handlePick} />
      </div>
      <div className="space-y-2">
        {files.length === 0 && <p className="text-sm text-muted-foreground">아직 첨부한 파일이 없습니다.</p>}
        {files.map((file) => (
          <div key={file.id} className="flex items-center justify-between gap-2 rounded-lg bg-muted/60 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)} · {formatRelativeTime(file.createdAt)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button variant="ghost" size="icon" className="size-7" onClick={() => onDownload(file.id)}>
                <Download className="size-3.5" />
              </Button>
              {editable && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-danger"
                  onClick={() => onDelete(file.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
