"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { workspaceRepository } from "@/features/workspace";
import type { ProjectArtifact } from "@/features/workspace/types";
import { ARTIFACT_TYPE_LABELS } from "@/features/workspace/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

export default function ArtifactDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; artifactId: string }>;
}) {
  const { projectId, artifactId } = use(params);
  const [artifact, setArtifact] = useState<ProjectArtifact | null | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const refresh = useCallback(async () => {
    const found = await workspaceRepository.getArtifact(artifactId);
    setArtifact(found ?? null);
    if (found) {
      setTitle(found.title);
      setBody(found.content);
    }
  }, [artifactId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await workspaceRepository.updateArtifact(artifactId, { title, content: body });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (artifact === undefined) {
    return (
      <div className="space-y-3 p-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!artifact) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">결과물을 찾을 수 없습니다.</p>
        <Button variant="link" asChild>
          <Link href={`/workspace/projects/${projectId}`}>프로젝트로</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-6 sm:px-8 sm:py-10">
      <Button variant="ghost" size="sm" asChild className="-ml-2 gap-1.5">
        <Link href={`/workspace/projects/${projectId}`}>
          <ArrowLeft className="size-4" />
          프로젝트
        </Link>
      </Button>

      <span className="inline-block rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
        {ARTIFACT_TYPE_LABELS[artifact.artifactType]} · v{artifact.version}
      </span>

      <div>
        <Label htmlFor="artifact-title">제목</Label>
        <Input
          id="artifact-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="artifact-body">내용</Label>
        <Textarea
          id="artifact-body"
          rows={12}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="mt-1.5"
        />
      </div>

      {artifact.fields && Object.keys(artifact.fields).length > 0 && (
        <div className="rounded-2xl border border-border bg-muted/30 p-4">
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            입력 폼 원본
          </p>
          <dl className="space-y-1 text-sm">
            {Object.entries(artifact.fields).map(([key, value]) => (
              <div key={key}>
                <dt className="inline font-medium text-foreground">{key}: </dt>
                <dd className="inline text-muted-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <Button onClick={handleSave} disabled={saving} className="gap-1.5">
        {saving ? <Loader2 className="size-4 animate-spin" /> : saved ? <Check className="size-4" /> : null}
        {saved ? "저장됨" : "저장"}
      </Button>
    </div>
  );
}
