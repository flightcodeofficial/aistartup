"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lightbulb, MessageSquareText } from "lucide-react";
import { useIdeationSessions } from "@/features/ideation/useIdeationSessions";
import { ChatComposer } from "@/components/ideation/ChatComposer";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { routes } from "@/lib/routes";

export default function IdeationListPage() {
  const { sessions, loading, startSession } = useIdeationSessions();
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const handleStart = async (message: string) => {
    setCreating(true);
    try {
      const session = await startSession(message);
      router.push(routes.ideationSession(session.id));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:px-8 sm:py-10">
      <div className="bg-hero-gradient rounded-3xl p-6 text-white sm:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
          <Lightbulb className="size-3.5" />
          아이디어 회의 · 해커톤 브레인스토밍
        </span>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">AI와 함께 아이디어를 다듬어보세요</h1>
        <p className="mt-2 text-sm text-white/70">
          문제, 고객, 기존 대안, 차별점, MVP 순서로 질문을 던지며 생각을 정리해드립니다. 지금은
          Mock 진행자가 대답하지만, 이후 실제 AI API로 확장될 예정입니다.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="mb-3 text-sm font-semibold text-foreground">새 아이디어로 회의 시작하기</p>
        <ChatComposer
          onSend={handleStart}
          sending={creating}
          placeholder="예: 소규모 카페를 위한 재고·발주 자동화 서비스를 만들어보고 싶어요"
        />
      </div>

      <div>
        <p className="mb-3 text-sm font-bold text-foreground">지난 아이디어 회의</p>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">아직 진행한 회의가 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <Link
                key={s.id}
                href={routes.ideationSession(s.id)}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <MessageSquareText className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{s.title}</p>
                    <p className="text-xs text-muted-foreground">
                      메시지 {s.messageCount}개 · {formatRelativeTime(s.updatedAt)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
