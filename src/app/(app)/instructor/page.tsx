import Link from "next/link";
import { Presentation, ShieldAlert } from "lucide-react";
import { curriculum } from "@/features/curriculum/data";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export default function InstructorHomePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-8 sm:py-10">
      <div className="bg-hero-gradient rounded-3xl p-6 text-white sm:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
          <Presentation className="size-3.5" />
          강사 모드
        </span>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">진행할 STEP을 선택하세요</h1>
        <p className="mt-2 text-sm text-white/70">
          강사 화면에서 이동하면, &ldquo;강사 화면 따라가기&rdquo;를 켠 학생 탭이 자동으로 같은 STEP을 따라갑니다.
        </p>
        <Button asChild className="mt-4 gap-1.5 bg-white text-primary hover:bg-white/90">
          <Link href={routes.instructorCrm()}>
            <ShieldAlert className="size-4" />
            Student CRM 열기
          </Link>
        </Button>
      </div>

      {curriculum.map((week) =>
        week.days
          .filter((day) => day.status !== "coming-soon")
          .map((day) => (
            <section key={`${week.week}-${day.day}`}>
              <h2 className="mb-3 text-sm font-bold text-foreground">
                {week.week}주차 Day{day.day} · {day.title}
              </h2>
              <div className="space-y-4">
                {day.lessons.map((lesson) => (
                  <div key={lesson.lessonNumber}>
                    <p className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Lesson {lesson.lessonNumber} · {lesson.title}
                    </p>
                    <div className="space-y-2">
                      {lesson.steps.map((step) => (
                        <Link
                          key={step.id}
                          href={routes.instructor(week.week, day.day, step.stepNumber)}
                          className="flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:bg-muted"
                        >
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              STEP{step.stepNumber} · {step.title}
                            </p>
                            <p className="text-xs text-muted-foreground">{step.summary}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
      )}
    </div>
  );
}
