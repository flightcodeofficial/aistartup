"use client";

import { useCallback, useEffect, useState } from "react";
import { communityRepository } from "./index";
import type { Comment, Post } from "./types";

export function usePostDetail(postId: string) {
  const [post, setPost] = useState<Post | undefined>(undefined);
  const [comments, setComments] = useState<Comment[]>([]);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [p, c, l] = await Promise.all([
      communityRepository.getPost(postId),
      communityRepository.listComments(postId),
      communityRepository.hasLiked(postId),
    ]);
    setPost(p);
    setComments(c);
    setLiked(l);
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    refresh();
    const unsubPosts = communityRepository.subscribePosts(() => refresh());
    return unsubPosts;
  }, [refresh]);

  const addComment = useCallback(
    async (body: string) => {
      await communityRepository.createComment({ postId, body });
      await refresh();
    },
    [postId, refresh]
  );

  const toggleLike = useCallback(async () => {
    const result = await communityRepository.toggleLike(postId);
    setLiked(result.liked);
    setPost((prev) => (prev ? { ...prev, likeCount: result.likeCount } : prev));
  }, [postId]);

  const escalateToInstructor = useCallback(async () => {
    await communityRepository.escalateToInstructor(postId);
    await refresh();
  }, [postId, refresh]);

  return { post, comments, liked, loading, addComment, toggleLike, escalateToInstructor };
}
