import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Mic, Quote } from "lucide-react";
import { flattenSteps, getDay, getStep } from "@/features/curriculum/data";
import { routes } from "@/lib/routes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InstructorBroadcaster } from "@/components/instructor/InstructorBroadcaster";

export default async function InstructorStepPage({
  params,
}: {
  params: Promise<{ week: string; day: string; lesson: string; step: string }>;
}) {
  const { week: weekParam, day: dayParam, step: stepParam } = await params;
  const week = Number(weekParam);
  const day = Number(dayParam);
  const stepNumber = Number(stepParam);

  const dayMeta = getDay(week, day);
  const step = getStep(week, day, stepNumber);
  const lesson = dayMeta?.lessons.find((l) => l.steps.some((s) => s.stepNumber === stepNumber));
  if (!dayMeta || !step || !lesson) notFound();

  const allSteps = flattenSteps(dayMeta);
  const stepIndex = allSteps.findIndex((s) => s.stepNumber === stepNumber);
  const prevStep = allSteps[stepIndex - 1];
  const nextStep = allSteps[stepIndex + 1];

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-8 sm:py-10">
      <InstructorBroadcaster week={week} day={day} stepNumber={stepNumber} />

      <div className="flex items-center justify-between">
        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
          Lesson {lesson.lessonNumber} · STEP {step.stepNumber} / {allSteps.length} · 강사 모드
        </Badge>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={!prevStep} asChild={Boolean(prevStep)}>
            {prevStep ? (
              <Link href={routes.instructor(week, day, prevStep.stepNumber)}>
                <ChevronLeft className="size-4" />
                이전
              </Link>
            ) : (
              <span>
                <ChevronLeft className="size-4" />
                이전
              </span>
            )}
          </Button>
          <Button size="sm" disabled={!nextStep} asChild={Boolean(nextStep)}>
            {nextStep ? (
              <Link href={routes.instructor(week, day, nextStep.stepNumber)}>
                다음
                <ChevronRight className="size-4" />
              </Link>
            ) : (
              <span>
                다음
                <ChevronRight className="size-4" />
              </span>
            )}
          </Button>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{step.title}</h1>

      <div className="rounded-2xl border-2 border-primary/20 bg-primary/[0.03] p-6 sm:p-8">
        <p className="mb-3 flex items-center gap-2 text-sm font-bold text-primary">
          <Mic className="size-4" />
          강사 멘트
        </p>
        <p className="text-base leading-relaxed whitespace-pre-line text-foreground sm:text-lg">
          {step.instructorScript}
        </p>
      </div>

      <div className="rounded-2xl bg-hero-gradient p-6 text-center text-white sm:p-8">
        <Quote className="mx-auto size-5 text-white/40" />
        <p className="mx-auto mt-3 max-w-xl text-lg font-bold sm:text-xl">{step.keyMessage}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          진행 순서 한눈에 보기
        </p>
        <ol className="space-y-2 text-sm">
          {step.blocks
            .filter((b) => b.kind === "theory")
            .map((block, i) => (
              <li key={`theory-${i}`} className="flex gap-2">
                <span className="font-semibold text-primary">① Theory</span>
                <span className="text-foreground/80">{block.kind === "theory" ? block.heading : ""}</span>
              </li>
            ))}
          {step.blocks
            .filter((b) => b.kind === "visual" || b.kind === "case")
            .map((block, i) => (
              <li key={`example-${i}`} className="flex gap-2">
                <span className="font-semibold text-primary">② Example</span>
                <span className="text-foreground/80">
                  {block.kind === "visual" || block.kind === "case" ? block.heading : ""}
                </span>
              </li>
            ))}
          <li className="flex gap-2">
            <span className="font-semibold text-primary">③ Quiz</span>
            <span className="text-foreground/80">{step.quiz.length}문항</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-primary">④ Practice</span>
            <span className="text-foreground/80">
              {step.practice.title} (약 {step.practice.estimatedMinutes}분)
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-primary">⑤ AI</span>
            <span className="text-foreground/80">Practice 안에서 AI 결과가 생성됩니다</span>
          </li>
          {step.blocks
            .filter((b) => b.kind === "takeaway")
            .map((block, i) => (
              <li key={`summary-${i}`} className="flex gap-2">
                <span className="font-semibold text-primary">⑥ Summary</span>
                <span className="text-foreground/80">{block.kind === "takeaway" ? block.message : ""}</span>
              </li>
            ))}
        </ol>
      </div>
    </div>
  );
}
