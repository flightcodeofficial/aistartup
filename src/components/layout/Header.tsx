"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { Menu, LayoutDashboard, Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/Sidebar";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { FollowInstructorToggle } from "@/components/layout/FollowInstructorToggle";
import { getDay, getStep } from "@/features/curriculum/data";
import { routes } from "@/lib/routes";
import { AccountMenu } from "@/features/auth/AccountMenu";

export function Header() {
  const pathname = usePathname();
  const match = pathname.match(/\/week\/(\d+)\/day\/(\d+)(?:\/step\/(\d+))?/);

  let breadcrumb = "대시보드";
  if (match) {
    const week = Number(match[1]);
    const day = Number(match[2]);
    const stepNumber = match[3] ? Number(match[3]) : undefined;
    const dayMeta = getDay(week, day);
    const step = stepNumber ? getStep(week, day, stepNumber) : undefined;
    breadcrumb = [
      `${week}주차`,
      dayMeta ? `Day${day}` : undefined,
      step ? `STEP${step.stepNumber} · ${step.title}` : undefined,
    ]
      .filter(Boolean)
      .join(" / ");
  }

  return (
    <header className="flex h-14 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0 lg:hidden">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">사이드바 메뉴</SheetTitle>
            <Suspense fallback={<div className="h-full bg-sidebar" />}>
              <Sidebar />
            </Suspense>
          </SheetContent>
        </Sheet>
        <p className="truncate text-sm font-medium text-muted-foreground">
          {breadcrumb}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <FollowInstructorToggle />
        <Button variant="ghost" size="icon" className="size-9" asChild>
          <Link href={routes.dashboard()} aria-label="대시보드">
            <LayoutDashboard className="size-4" />
          </Link>
        </Button>
        <Button variant="ghost" size="icon" className="size-9" asChild>
          <Link href="/instructor" aria-label="강사 모드">
            <Presentation className="size-4" />
          </Link>
        </Button>
        <AccountMenu />
        <ThemeToggle />
      </div>
    </header>
  );
}
