"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  Circle,
  FileEdit,
  FileStack,
  FolderKanban,
  FolderOpen,
  GraduationCap,
  Lightbulb,
  Lock,
  MailX,
  Megaphone,
  MessageCircleQuestion,
  MessagesSquare,
  Rocket,
  Sparkles,
  Wand2,
} from "lucide-react";
import { curriculum, flattenSteps } from "@/features/curriculum/data";
import {
  dayRelease,
  lessonRelease,
  SCHEDULED_NOTICE,
  viewRelease,
} from "@/features/curriculum/release";
import { useProgressStore, calcProgressPercent } from "@/features/progress/store";
import { communityRepository } from "@/features/community";
import { subscribeCommunityChange } from "@/features/community/realtimeChannel";
import { useAuth } from "@/features/auth/AuthProvider";
import { isStaff } from "@/features/auth/types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { routes } from "@/lib/routes";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CommunityLink = { href: string; label: string; icon: typeof Megaphone };

const BOARD_LINKS: CommunityLink[] = [
  { href: routes.communityCategory("공지사항"), label: "공지사항", icon: Megaphone },
  { href: routes.communityCategory("질문하기"), label: "질문하기", icon: MessageCircleQuestion },
  { href: routes.communityCategory("학습토론"), label: "학습토론", icon: MessagesSquare },
];

const TOOL_LINKS: CommunityLink[] = [
  { href: routes.mentor(), label: "AI Mentor", icon: Wand2 },
  { href: routes.projects(), label: "프로젝트 공유", icon: Rocket },
  { href: routes.resources(), label: "자료실", icon: FolderOpen },
  { href: routes.assignments(), label: "과제 제출", icon: FileEdit },
  { href: routes.ideation(), label: "아이디어 회의", icon: Lightbulb },
  { href: routes.communityBookings(), label: "컨설팅 예약", icon: CalendarCheck },
];

const UTILITY_LINKS: CommunityLink[] = [
  { href: routes.communityNotifications(), label: "알림", icon: Bell },
  { href: routes.communityMessages(), label: "메시지", icon: MailX },
];

const BUILDER_LINKS: CommunityLink[] = [
  { href: routes.workspace(), label: "내 저장공간", icon: FolderKanban },
];

/** 강사·관리자에게만 보이는 메뉴. /admin은 StaffOnly와 RLS로도 막혀 있지만, 학생 눈에 띄지 않게 한다. */
const STAFF_LINKS: CommunityLink[] = [
  { href: routes.adminCourses(), label: "Lesson Studio", icon: FileStack },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentUrl = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
  const steps = useProgressStore((s) => s.steps);

  // 로컬 모드(Supabase 키 없음)에는 역할 개념이 없어 StaffOnly와 같은 기준으로 통과시킨다.
  const { state: authState } = useAuth();
  const showStaffMenu =
    !isSupabaseConfigured ||
    (authState.status === "signed-in" && isStaff(authState.user.role));

  const currentDay = useMemo(() => {
    const match = pathname.match(/\/week\/(\d+)\/day\/(\d+)/);
    return match ? Number(match[2]) : 1;
  }, [pathname]);

  const [openDay, setOpenDay] = useState<number>(currentDay);

  const allStepIds = curriculum.flatMap((w) => w.days.flatMap((d) => flattenSteps(d).map((s) => s.id)));
  const overallPercent = calcProgressPercent(steps, allStepIds);

  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      communityRepository.unreadNotificationCount().then((n) => {
        if (!cancelled) setUnreadCount(n);
      });
    };
    refresh();
    const unsubscribe = subscribeCommunityChange("notifications", refresh);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const renderLink = ({ href, label, icon: Icon }: CommunityLink) => {
    const isActive = href.includes("?") ? currentUrl === href : pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link
        key={href}
        href={href}
        onClick={onNavigate}
        className={cn(
          "flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent"
        )}
      >
        <span className="flex items-center gap-2">
          <Icon className="size-4" />
          {label}
        </span>
        {label === "알림" && unreadCount > 0 && (
          <Badge className="h-5 min-w-5 justify-center bg-danger px-1 text-danger-foreground">
            {unreadCount}
          </Badge>
        )}
      </Link>
    );
  };

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <GraduationCap className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold">AI 창업 스쿨</p>
          <p className="text-xs text-muted-foreground">Native Learning Platform</p>
        </div>
      </div>

      <div className="px-3">
        <Link
          href={routes.myProjects()}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors",
            pathname === routes.myProjects()
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
          )}
        >
          <FolderKanban className="size-4" />내 프로젝트
        </Link>
      </div>

      <nav className="scrollbar-thin flex-1 space-y-5 overflow-y-auto px-3 pt-4 pb-4">
        {curriculum.map((week) => (
          <div key={week.week}>
            <p className="px-3 pt-2 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {week.week}주차 · {week.title}
            </p>
            <div className="space-y-1">
              {week.days.map((day) => {
                const dayView = viewRelease(dayRelease(day), showStaffMenu);
                if (!dayView.visible) return null;
                const isComingSoon = !dayView.canEnter;
                const isOpen = openDay === day.day && !isComingSoon;
                const dayStepIds = flattenSteps(day).map((s) => s.id);
                const dayPercent = calcProgressPercent(steps, dayStepIds);

                // 잠긴 Day는 접었다 폈다 하는 대신 Day 화면으로 보낸다.
                // 거기서 "오픈 예정"인 이유를 안내한다.
                if (isComingSoon) {
                  return (
                    <Link
                      key={day.day}
                      href={routes.day(week.week, day.day)}
                      onClick={onNavigate}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent"
                    >
                      <span className="flex items-center gap-2">
                        <Lock className="size-3.5" />
                        Day{day.day}
                      </span>
                      <span className="text-[10px] font-semibold">
                        {SCHEDULED_NOTICE.badge}
                      </span>
                    </Link>
                  );
                }

                return (
                  <div key={day.day}>
                    <button
                      type="button"
                      onClick={() => setOpenDay(isOpen ? -1 : day.day)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        isOpen && "bg-sidebar-accent text-sidebar-accent-foreground"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-primary">{dayPercent}%</span>
                        Day{day.day}
                      </span>
                      <ChevronDown
                        className={cn("size-4 transition-transform", isOpen && "rotate-180")}
                      />
                    </button>

                    {isOpen && (
                      <div className="mt-1 ml-3 space-y-2 border-l border-sidebar-border pl-3">
                        {day.lessons.map((lesson) => {
                          const lessonView = viewRelease(
                            lessonRelease(day, lesson),
                            showStaffMenu
                          );
                          if (!lessonView.visible) return null;

                          // 잠긴 Lesson은 제목만 남기고 STEP 목록을 펼치지 않는다.
                          if (!lessonView.canEnter) {
                            return (
                              <div key={lesson.lessonNumber}>
                                <p className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                  <Lock className="size-3" />
                                  Lesson {lesson.lessonNumber} · {SCHEDULED_NOTICE.badge}
                                </p>
                              </div>
                            );
                          }

                          return (
                          <div key={lesson.lessonNumber}>
                            <p className="px-2 py-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                              Lesson {lesson.lessonNumber} · {lesson.title}
                            </p>
                            <div className="space-y-0.5">
                              {lesson.steps.map((step) => {
                                const href = routes.step(week.week, day.day, step.stepNumber);
                                const isActive = pathname === href;
                                const isDone = Boolean(steps[step.id]?.completed);
                                return (
                                  <Link
                                    key={step.id}
                                    href={href}
                                    onClick={onNavigate}
                                    className={cn(
                                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                                      isActive
                                        ? "bg-primary/10 font-semibold text-primary"
                                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent"
                                    )}
                                  >
                                    {isDone ? (
                                      <CheckCircle2 className="size-4 shrink-0 text-success" />
                                    ) : (
                                      <Circle className="size-4 shrink-0 text-muted-foreground/50" />
                                    )}
                                    <span className="truncate">
                                      STEP{step.stepNumber} · {step.title}
                                    </span>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div>
          <p className="px-3 pt-2 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            커뮤니티
          </p>
          <div className="space-y-1">{BOARD_LINKS.map(renderLink)}</div>
        </div>

        <div>
          <p className="px-3 pt-2 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            도구
          </p>
          <div className="space-y-1">{TOOL_LINKS.map(renderLink)}</div>
        </div>

        <div>
          <div className="space-y-1">{UTILITY_LINKS.map(renderLink)}</div>
        </div>

        <div>
          <p className="px-3 pt-2 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            콘텐츠 · 저장공간
          </p>
          <div className="space-y-1">{BUILDER_LINKS.map(renderLink)}</div>
        </div>

        {showStaffMenu && (
          <div>
            <p className="px-3 pt-2 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              강사 전용
            </p>
            <div className="space-y-1">{STAFF_LINKS.map(renderLink)}</div>
          </div>
        )}
      </nav>

      <div className="border-t border-sidebar-border px-4 py-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            전체 진행률
          </span>
          <span className="font-semibold text-primary">{overallPercent}%</span>
        </div>
        <Progress value={overallPercent} className="h-1.5" />
      </div>
    </div>
  );
}
