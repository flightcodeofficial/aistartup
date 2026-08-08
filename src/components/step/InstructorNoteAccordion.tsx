import { Mic } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function InstructorNoteAccordion({ script }: { script: string }) {
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
