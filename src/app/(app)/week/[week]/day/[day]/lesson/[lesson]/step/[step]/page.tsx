import { notFound } from "next/navigation";
import { flattenSteps, getDay, getStep } from "@/features/curriculum/data";
import { routes } from "@/lib/routes";
import { StepContentList } from "@/components/step/StepContentList";
import { QuizStage } from "@/components/step/QuizStage";
import { InstructorNoteAccordion } from "@/components/step/InstructorNoteAccordion";
import { StepCompleteBar } from "@/components/step/StepCompleteBar";
import { SetLastPosition } from "@/components/step/SetLastPosition";
import { NoteEditor } from "@/components/step/NoteEditor";
import { PracticeSectionShell } from "@/components/practice/PracticeSectionShell";
import { PracticeDispatcher } from "@/components/practice/PracticeDispatcher";
import { Badge } from "@/components/ui/badge";

export default async function StepPage({
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

  const prevHref = prevStep ? routes.step(week, day, prevStep.stepNumber) : routes.day(week, day);
  const nextHref = nextStep ? routes.step(week, day, nextStep.stepNumber) : routes.day(week, day);

  const theoryBlocks = step.blocks.filter((b) => b.kind === "theory");
  const exampleBlocks = step.blocks.filter((b) => b.kind === "visual" || b.kind === "case");
  const summaryBlocks = step.blocks.filter((b) => b.kind === "takeaway");

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-8 sm:py-10">
      <SetLastPosition week={week} day={day} stepNumber={stepNumber} />

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
            Lesson {lesson.lessonNumber} · {lesson.title}
          </Badge>
          <Badge variant="outline" className="border-muted-foreground/20 text-muted-foreground">
            STEP {step.stepNumber} / {allSteps.length}
          </Badge>
        </div>
        <h1 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl">{step.title}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">{step.summary}</p>
      </div>

      <InstructorNoteAccordion script={step.instructorScript} />

      <StepContentList blocks={theoryBlocks} />
      <StepContentList blocks={exampleBlocks} />

      <QuizStage stepId={step.id} quiz={step.quiz} />

      <PracticeSectionShell practice={step.practice}>
        <PracticeDispatcher step={step} />
      </PracticeSectionShell>

      <StepContentList blocks={summaryBlocks} />

      <NoteEditor stepId={step.id} />

      <StepCompleteBar stepId={step.id} stepTitle={step.title} prevHref={prevHref} nextHref={nextHref} />
    </div>
  );
}
