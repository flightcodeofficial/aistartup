"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, BookOpen, Loader2, RefreshCw } from "lucide-react";
import { LESSON_SEEDS } from "@/features/lesson-builder/lessonSeeds";
import {
  compareLessonSeed,
  openLessonSeed,
  reloadLessonSeed,
  type LessonSeedComparison,
} from "@/features/lesson-builder/seedInstall";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatRelativeTime } from "@/lib/formatRelativeTime";

// 코드에 있는 원고본을 Studio로 들여오는 두 가지 길.
//
//  열기            — 저장본이 있으면 그대로. 강사가 고친 내용을 지키는 기본 동작.
//  최신 원고 불러오기 — 저장본을 원고본으로 교체. 무엇이 바뀌는지 보여주고, 백업 후, 확인받고 실행.
//
// Lesson2·3·4가 생겨도 LESSON_SEEDS에 추가만 하면 이 화면은 그대로 쓴다.

export function LessonSeedPanel() {
  const router = useRouter();
  const [busySeed, setBusySeed] = useState<string | null>(null);
  const [comparison, setComparison] = useState<LessonSeedComparison | null>(null);
  const [replacing, setReplacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = async (seedId: string) => {
    setBusySeed(seedId);
    setError(null);
    try {
      const { id } = await openLessonSeed(seedId);
      router.push(`/admin/lessons/${id}/edit`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lesson을 열지 못했습니다.");
    } finally {
      setBusySeed(null);
    }
  };

  const handleAskReload = async (seedId: string) => {
    setBusySeed(seedId);
    setError(null);
    try {
      setComparison(await compareLessonSeed(seedId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "원고를 읽지 못했습니다.");
    } finally {
      setBusySeed(null);
    }
  };

  const handleConfirmReload = async () => {
    if (!comparison) return;
    setReplacing(true);
    try {
      const { id } = await reloadLessonSeed(comparison.seedId);
      setComparison(null);
      router.push(`/admin/lessons/${id}/edit`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "교체하지 못했습니다.");
    } finally {
      setReplacing(false);
    }
  };

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-2">
        {LESSON_SEEDS.map((seed) => (
          <div key={seed.id} className="flex flex-wrap gap-2">
            <Button
              onClick={() => handleOpen(seed.id)}
              disabled={busySeed !== null}
              className="gap-2 bg-white text-primary hover:bg-white/90"
            >
              {busySeed === seed.id ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <BookOpen className="size-4" />
              )}
              {seed.label} 열기
            </Button>
            <Button
              variant="outline"
              onClick={() => handleAskReload(seed.id)}
              disabled={busySeed !== null}
              className="gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              <RefreshCw className="size-4" />
              최신 원고 다시 불러오기
            </Button>
          </div>
        ))}
      </div>
      {error && <p className="mt-2 text-xs text-white/90">{error}</p>}

      <Dialog open={comparison !== null} onOpenChange={(open) => !open && setComparison(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>최신 원고로 교체할까요?</DialogTitle>
            <DialogDescription>
              {comparison?.label}
              {comparison?.stored
                ? " — 지금 저장된 내용을 코드에 있는 최신 원고로 바꿉니다."
                : " — 저장된 내용이 없어 새로 만듭니다."}
            </DialogDescription>
          </DialogHeader>

          {comparison && (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-xs text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">항목</th>
                      <th className="px-3 py-2 text-left font-medium">지금 저장본</th>
                      <th className="px-3 py-2 text-left font-medium">최신 원고</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-3 py-2 text-muted-foreground">페이지</td>
                      <td className="px-3 py-2 font-medium">{comparison.stored?.pages ?? "—"}</td>
                      <td className="px-3 py-2 font-bold text-primary">{comparison.incoming.pages}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 text-muted-foreground">블록</td>
                      <td className="px-3 py-2 font-medium">{comparison.stored?.blocks ?? "—"}</td>
                      <td className="px-3 py-2 font-bold text-primary">{comparison.incoming.blocks}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 text-muted-foreground">상태</td>
                      <td className="px-3 py-2 font-medium">
                        {comparison.stored
                          ? `${comparison.stored.status === "published" ? "게시됨" : "작성 중"} · v${comparison.stored.version}`
                          : "—"}
                      </td>
                      <td className="px-3 py-2 font-medium">작성 중 (Draft)</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 text-muted-foreground">마지막 수정</td>
                      <td className="px-3 py-2 font-medium">
                        {comparison.stored ? formatRelativeTime(comparison.stored.updatedAt) : "—"}
                      </td>
                      <td className="px-3 py-2 font-medium">지금</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {comparison.stored && (
                <div className="rounded-xl border border-warning/30 bg-warning/10 p-3">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <AlertTriangle className="size-4 text-warning" />
                    Studio에서 고친 내용은 사라집니다
                  </p>
                  <ul className="mt-1.5 list-disc space-y-1 pl-5 text-xs leading-relaxed text-muted-foreground">
                    <li>
                      바꾸기 전에 지금 저장본을 <b>JSON 파일로 내려받습니다.</b> 되돌리려면 편집
                      화면의 “JSON 가져오기”로 그 파일을 넣으면 됩니다.
                    </li>
                    {comparison.willUnpublish && (
                      <li className="text-foreground">
                        지금 <b>게시된 Lesson</b>입니다. 교체하면 작성 중(Draft)으로 내려가고, 다시
                        게시할 때까지 학생 화면은 이전 자료로 돌아갑니다.
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setComparison(null)} disabled={replacing}>
              취소
            </Button>
            <Button onClick={handleConfirmReload} disabled={replacing} className="gap-1.5">
              {replacing && <Loader2 className="size-4 animate-spin" />}
              {comparison?.stored ? "백업하고 교체" : "만들기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
