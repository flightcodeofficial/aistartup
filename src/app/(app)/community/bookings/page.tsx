"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarCheck, Loader2, X } from "lucide-react";
import { communityRepository } from "@/features/community";
import type { Booking } from "@/features/community/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/formatRelativeTime";

const STATUS_LABEL: Record<Booking["status"], string> = {
  requested: "신청됨",
  confirmed: "확정됨",
  cancelled: "취소됨",
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [slotLabel, setSlotLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    setBookings(await communityRepository.listBookings());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSubmit = async () => {
    if (!slotLabel.trim()) return;
    setSubmitting(true);
    try {
      await communityRepository.createBooking({ slotLabel });
      setSlotLabel("");
      await refresh();
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    await communityRepository.cancelBooking(id);
    refresh();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:px-8 sm:py-10">
      <div>
        <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          <CalendarCheck className="size-3.5" />
          커뮤니티
        </p>
        <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">예약</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          강사와의 1:1 상담이나 오피스아워를 신청할 수 있습니다. (신청 접수만 지원 · 결제·확정 연동은 추후 제공)
        </p>
      </div>

      <div className="flex gap-2 rounded-2xl border border-border bg-card p-4">
        <div className="flex-1">
          <Label htmlFor="slot">희망 일정</Label>
          <Input
            id="slot"
            value={slotLabel}
            onChange={(e) => setSlotLabel(e.target.value)}
            placeholder="예: 이번 주 목요일 오후 3시"
            className="mt-1.5"
          />
        </div>
        <Button onClick={handleSubmit} disabled={submitting || !slotLabel.trim()} className="self-end">
          {submitting ? <Loader2 className="size-4 animate-spin" /> : "신청하기"}
        </Button>
      </div>

      <div className="space-y-2">
        {bookings.length === 0 && (
          <p className="text-sm text-muted-foreground">아직 신청한 예약이 없습니다.</p>
        )}
        {bookings.map((b) => (
          <div
            key={b.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{b.slotLabel}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{formatRelativeTime(b.createdAt)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{STATUS_LABEL[b.status]}</Badge>
              {b.status === "requested" && (
                <Button variant="ghost" size="icon" className="size-7" onClick={() => handleCancel(b.id)}>
                  <X className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
