"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useIdeationChat } from "@/features/ideation/useIdeationChat";
import { ChatBubble } from "@/components/ideation/ChatBubble";
import { ChatComposer } from "@/components/ideation/ChatComposer";
import { routes } from "@/lib/routes";

export default function IdeationChatPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const { session, messages, loading, sending, sendMessage } = useIdeationChat(params.sessionId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-6 sm:px-8 sm:py-10">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-8">
        <p className="text-sm text-muted-foreground">회의를 찾을 수 없습니다.</p>
        <Button variant="link" onClick={() => router.push(routes.ideation())}>
          목록으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-2xl flex-col px-4 py-6 sm:px-8 sm:py-10">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 gap-1.5"
          onClick={() => router.push(routes.ideation())}
        >
          <ArrowLeft className="size-4" />
          아이디어 회의 목록
        </Button>
        <div className="mt-2 flex items-center gap-2">
          <Lightbulb className="size-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground sm:text-xl">{session.title}</h1>
        </div>
      </div>

      <div className="scrollbar-thin my-4 flex-1 space-y-4 overflow-y-auto">
        {messages.map((m) => (
          <ChatBubble key={m.id} message={m} />
        ))}
        <div ref={bottomRef} />
      </div>

      <ChatComposer onSend={sendMessage} sending={sending} />
    </div>
  );
}
