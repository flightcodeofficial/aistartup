"use client";

import { useCallback, useEffect, useState } from "react";
import { communityRepository } from "./index";
import type { Post, PostCategory } from "./types";

export function useCommunityBoard(category?: PostCategory) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const list = await communityRepository.listPosts(category);
    setPosts(list);
    setLoading(false);
  }, [category]);

  useEffect(() => {
    refresh();
    const unsubscribe = communityRepository.subscribePosts(() => refresh());
    return unsubscribe;
  }, [refresh]);

  const createPost = useCallback(
    async (input: { title: string; body: string; category: PostCategory }) => {
      const post = await communityRepository.createPost(input);
      if (post.category === "질문하기") {
        // AI 멘토가 먼저 답변한다.
        await communityRepository.askAIMentor(post.id);
      }
      await refresh();
    },
    [refresh]
  );

  return { posts, loading, createPost, refresh };
}
