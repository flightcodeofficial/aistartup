"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LikeButton({
  liked,
  likeCount,
  onToggle,
}: {
  liked: boolean;
  likeCount: number;
  onToggle: () => void;
}) {
  return (
    <Button variant={liked ? "default" : "outline"} className="gap-2" onClick={onToggle}>
      <Heart className={cn("size-4", liked && "fill-current")} />
      좋아요 {likeCount}
    </Button>
  );
}
