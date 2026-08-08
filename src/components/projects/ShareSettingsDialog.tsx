"use client";

import { useEffect, useState } from "react";
import { Globe, Lock, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ARTIFACT_FIELD_ORDER, ARTIFACT_LABELS } from "@/features/projects/types";
import type { Project, ProjectArtifacts, ProjectShareMode } from "@/features/projects/types";
import { cn } from "@/lib/utils";

export function ShareSettingsDialog({
  project,
  onSetVisibility,
  onSetShareSettings,
}: {
  project: Project;
  onSetVisibility: (visibility: "public" | "private") => Promise<void>;
  onSetShareSettings: (mode: ProjectShareMode, fields: (keyof ProjectArtifacts)[]) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ProjectShareMode>(project.shareMode);
  const [fields, setFields] = useState<Set<keyof ProjectArtifacts>>(new Set(project.publicFieldKeys));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setMode(project.shareMode);
      setFields(new Set(project.publicFieldKeys));
    }
  }, [open, project.shareMode, project.publicFieldKeys]);

  const toggleField = (field: keyof ProjectArtifacts) => {
    setFields((prev) => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (project.visibility !== "public") {
        await onSetVisibility("public");
      }
      await onSetShareSettings(mode, Array.from(fields));
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleMakePrivate = async () => {
    setSaving(true);
    try {
      await onSetVisibility("private");
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-1.5">
          <Share2 className="size-4" />
          공유
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>프로젝트 공유 설정</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm">
            {project.visibility === "public" ? (
              <Globe className="size-4 text-success" />
            ) : (
              <Lock className="size-4 text-muted-foreground" />
            )}
            현재 상태: {project.visibility === "public" ? "공개" : "비공개"}
          </div>

          <div>
            <Label>공개 범위</Label>
            <div className="mt-1.5 flex gap-2">
              <button
                type="button"
                onClick={() => setMode("full")}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                  mode === "full"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                )}
              >
                전체 공개
              </button>
              <button
                type="button"
                onClick={() => setMode("partial")}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                  mode === "partial"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                )}
              >
                일부만 공개
              </button>
            </div>
          </div>

          {mode === "partial" && (
            <div>
              <Label>공개할 섹션 선택</Label>
              <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-2">
                {ARTIFACT_FIELD_ORDER.map((field) => (
                  <label key={field} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={fields.has(field)}
                      onCheckedChange={() => toggleField(field)}
                    />
                    {ARTIFACT_LABELS[field]}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          {project.visibility === "public" && (
            <Button variant="ghost" onClick={handleMakePrivate} disabled={saving} className="gap-1.5">
              <Lock className="size-4" />
              비공개로 전환
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving} className="gap-1.5">
            <Globe className="size-4" />
            {saving ? "저장 중..." : "공개 설정 저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
