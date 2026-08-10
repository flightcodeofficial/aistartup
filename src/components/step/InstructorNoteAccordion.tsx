"use client";

import { Mic } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/features/auth/AuthProvider";
import { isStaff } from "@/features/auth/types";
import { isSupabaseConfigured } from "@/lib/supabase/env";

// 강사 전용 스크립트다 — 학생 화면에는 절대 보이면 안 된다.
// (로컬 모드는 역할 개념이 없어 그대로 통과시킨다.)
export function InstructorNoteAccordion({ script }: { script: string }) {
  const { state } = useAuth();
  if (isSupabaseConfigured && !(state.status === "signed-in" && isStaff(state.user.role))) {
    return null;
  }

  return (
    <Accordion type="single" collapsible className="rounded-2xl border border-border bg-muted/30 px-4">
      <AccordionItem value="script" className="border-none">
        <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline">
          <span className="flex items-center gap-2">
            <Mic className="size-4 text-primary" />
            강사 설명 스크립트 보기
          </span>
        </AccordionTrigger>
        <AccordionContent className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
          {script}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
