"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, ImageUp, Link2, Loader2, Trash2, Upload } from "lucide-react";
import { assetRepository } from "@/features/assets";
import { useAssetUrl } from "@/features/assets/useAssetUrl";
import {
  assetRefToId,
  formatFileSize,
  isAssetRef,
  SUPPORTED_IMAGE_EXTENSIONS,
  SUPPORTED_IMAGE_TYPES,
  type StoredAsset,
} from "@/features/assets/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// 이미지 소스를 고르는 3가지 방법을 한 곳에서 제공한다: 업로드 / URL / 최근 사용.
// 관리자가 "파일 경로"를 알 필요가 없어야 한다는 게 목표다.

type Mode = "upload" | "url" | "recent";

function CurrentPreview({
  src,
  onClear,
}: {
  src: string;
  onClear: () => void;
}) {
  const { url, loading, missing } = useAssetUrl(src);
  const [meta, setMeta] = useState<StoredAsset | undefined>();

  useEffect(() => {
    if (!isAssetRef(src)) {
      setMeta(undefined);
      return;
    }
    let cancelled = false;
    assetRepository.getAsset(assetRefToId(src)).then((a) => {
      if (!cancelled) setMeta(a);
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-2">
      <div className="flex items-start gap-2">
        <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-background">
          {loading ? (
            <div className="size-full animate-pulse bg-muted" />
          ) : url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="size-full object-contain" />
          ) : (
            <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
              없음
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          {meta ? (
            <>
              <p className="truncate text-xs font-medium text-foreground">{meta.fileName}</p>
              <p className="text-[11px] text-muted-foreground">
                {formatFileSize(meta.size)} · {meta.mimeType.replace("image/", "").toUpperCase()}
              </p>
            </>
          ) : (
            <p className="truncate text-[11px] break-all text-muted-foreground">{src}</p>
          )}
          {missing && (
            <p className="mt-1 flex items-center gap-1 text-[11px] text-danger">
              <AlertTriangle className="size-3" />
              파일을 찾을 수 없습니다
            </p>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="mt-1 h-6 gap-1 px-1.5 text-[11px] text-muted-foreground hover:text-danger"
          >
            <Trash2 className="size-3" />
            제거
          </Button>
        </div>
      </div>
    </div>
  );
}

function RecentAssetGrid({ onPick }: { onPick: (ref: string) => void }) {
  const [assets, setAssets] = useState<StoredAsset[] | null>(null);

  const refresh = useCallback(async () => {
    setAssets(await assetRepository.listRecent(12));
  }, []);

  useEffect(() => {
    refresh();
    return assetRepository.subscribe(refresh);
  }, [refresh]);

  if (assets === null) {
    return <div className="h-16 animate-pulse rounded-lg bg-muted" />;
  }
  if (assets.length === 0) {
    return (
      <p className="rounded-lg bg-muted/30 p-3 text-[11px] text-muted-foreground">
        아직 업로드한 이미지가 없습니다.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {assets.map((asset) => (
        <RecentAssetTile key={asset.id} asset={asset} onPick={onPick} />
      ))}
    </div>
  );
}

function RecentAssetTile({
  asset,
  onPick,
}: {
  asset: StoredAsset;
  onPick: (ref: string) => void;
}) {
  const { url } = useAssetUrl(`asset://${asset.id}`);
  return (
    <button
      type="button"
      onClick={() => onPick(`asset://${asset.id}`)}
      className="group overflow-hidden rounded-lg border border-border text-left transition-colors hover:border-primary/50"
      title={asset.fileName}
    >
      <div className="aspect-square bg-muted/40">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={asset.fileName} className="size-full object-contain" />
        ) : (
          <div className="size-full animate-pulse bg-muted" />
        )}
      </div>
      <p className="truncate px-1 py-0.5 text-[10px] text-muted-foreground">{asset.fileName}</p>
    </button>
  );
}

export function ImageSourcePicker({
  label = "이미지",
  value,
  onChange,
}: {
  label?: string;
  value: string;
  onChange: (src: string) => void;
}) {
  const [mode, setMode] = useState<Mode>("upload");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    if (!(SUPPORTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      setError("PNG · JPG · WEBP · SVG 파일만 올릴 수 있습니다.");
      return;
    }
    setUploading(true);
    try {
      const { ref } = await assetRepository.uploadAsset(file);
      onChange(ref);
    } catch (err) {
      // 저장소가 알려주는 이유(예: 깨진 SVG)가 있으면 그대로 보여준다.
      setError(
        err instanceof Error && err.message
          ? err.message
          : "업로드에 실패했습니다. 파일 크기를 줄여 다시 시도해보세요."
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {value && <CurrentPreview src={value} onClear={() => onChange("")} />}

      <div className="flex gap-0.5 rounded-lg border border-border p-0.5">
        {([
          ["upload", "파일 업로드", ImageUp],
          ["url", "URL 입력", Link2],
          ["recent", "최근 이미지", Upload],
        ] as const).map(([m, text, Icon]) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 rounded-md px-1.5 py-1.5 text-[11px] font-medium transition-colors",
              mode === m ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
            )}
          >
            <Icon className="size-3" />
            {text}
          </button>
        ))}
      </div>

      {mode === "upload" && (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept={SUPPORTED_IMAGE_EXTENSIONS}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="w-full gap-1.5"
          >
            {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <ImageUp className="size-3.5" />}
            {uploading ? "업로드 중..." : value ? "다른 파일로 교체" : "내 컴퓨터에서 선택"}
          </Button>
          <p className="mt-1 text-[11px] text-muted-foreground">PNG · JPG · WEBP · SVG</p>
        </div>
      )}

      {mode === "url" && (
        <Input
          value={isAssetRef(value) ? "" : value}
          placeholder="https://... 또는 /images/foo.png"
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {mode === "recent" && <RecentAssetGrid onPick={onChange} />}

      {error && (
        <p className="flex items-start gap-1 text-[11px] text-danger">
          <AlertTriangle className="mt-0.5 size-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
