"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, Check } from "lucide-react";
import { communityRepository } from "@/features/community";
import type { AppNotification } from "@/features/community/types";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const list = await communityRepository.listNotifications();
    setNotifications(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleRead = async (id: string) => {
    await communityRepository.markNotificationRead(id);
    refresh();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:px-8 sm:py-10">
      <div>
        <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          <Bell className="size-3.5" />
          커뮤니티
        </p>
        <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">알림</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          내 글에 댓글이나 좋아요가 달리면 여기에 표시됩니다.
        </p>
      </div>

      {!loading && notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <BellOff className="size-10 text-muted-foreground" />
          <p className="mt-4 text-base font-semibold text-foreground">아직 알림이 없습니다</p>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={cn(
              "flex items-start justify-between gap-3 rounded-xl border p-3",
              n.read ? "border-border bg-card" : "border-primary/30 bg-primary/5"
            )}
          >
            <div>
              <p className="text-sm text-foreground">{n.message}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{formatRelativeTime(n.createdAt)}</p>
            </div>
            {!n.read && (
              <Button variant="ghost" size="sm" onClick={() => handleRead(n.id)} className="shrink-0 gap-1">
                <Check className="size-3.5" />
                읽음
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
