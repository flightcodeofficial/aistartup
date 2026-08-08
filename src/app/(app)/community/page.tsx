"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Megaphone, MessageCircleQuestion, MessagesSquare } from "lucide-react";
import { useCommunityBoard } from "@/features/community/useBoard";
import { PostCard } from "@/components/community/PostCard";
import { NewPostDialog } from "@/components/community/NewPostDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PostCategory } from "@/features/community/types";

const CATEGORY_TABS: { value: PostCategory; icon: typeof Megaphone }[] = [
  { value: "공지사항", icon: Megaphone },
  { value: "질문하기", icon: MessageCircleQuestion },
  { value: "학습토론", icon: MessagesSquare },
];

export default function CommunityPage() {
  return (
    <Suspense fallback={null}>
      <CommunityBoardView />
    </Suspense>
  );
}

function CommunityBoardView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = (searchParams.get("category") as PostCategory | null) ?? "질문하기";

  const { posts, loading, createPost } = useCommunityBoard(category);

  const handleTabChange = (value: string) => {
    router.push(`/community?category=${encodeURIComponent(value)}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-8 sm:py-10">
      <div>
        <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          <MessagesSquare className="size-3.5" />
          커뮤니티
        </p>
        <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">게시판</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          수업이 끝난 뒤에도 다른 수강생, 강사와 계속 연결됩니다.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={category} onValueChange={handleTabChange}>
          <TabsList>
            {CATEGORY_TABS.map(({ value, icon: Icon }) => (
              <TabsTrigger key={value} value={value} className="gap-1.5">
                <Icon className="size-3.5" />
                {value}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <NewPostDialog onCreate={createPost} defaultCategory={category} />
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <MessagesSquare className="size-10 text-muted-foreground" />
          <p className="mt-4 text-base font-semibold text-foreground">
            아직 &ldquo;{category}&rdquo; 글이 없습니다
          </p>
          <p className="mt-1 text-sm text-muted-foreground">첫 글을 남겨 대화를 시작해보세요.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
