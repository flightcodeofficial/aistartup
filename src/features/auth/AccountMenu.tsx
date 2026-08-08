"use client";

import Link from "next/link";
import { LogOut, Settings, UserRound } from "lucide-react";
import { useAuth } from "./AuthProvider";
import type { UserRole } from "./types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ROLE_LABELS: Record<UserRole, string> = {
  student: "수강생",
  instructor: "강사",
  admin: "관리자",
};

export function AccountMenu() {
  const { state, signOut } = useAuth();

  // 로컬 모드에서는 계정 개념이 없으므로 아무것도 보여주지 않는다.
  if (state.status !== "signed-in") return null;

  const { user } = state;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9" aria-label="내 계정">
          <UserRound className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="space-y-1">
          <span className="block truncate text-sm font-semibold text-foreground">
            {user.displayName || user.email || "내 계정"}
          </span>
          {user.email && user.displayName && (
            <span className="block truncate text-xs font-normal text-muted-foreground">
              {user.email}
            </span>
          )}
          <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
            {ROLE_LABELS[user.role]}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="gap-1.5">
          <Link href="/profile">
            <Settings className="size-4" />내 정보
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void signOut()} className="gap-1.5">
          <LogOut className="size-4" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
