import { notFound } from "next/navigation";
import { getDay } from "@/features/curriculum/data";
import { DayHero } from "@/components/step/DayHero";
import { StepList } from "@/components/step/StepList";
import { ComingSoon } from "@/components/common/ComingSoon";
import { DayGate } from "@/components/curriculum/DayGate";

export default async function DayPage({
  params,
}: {
  params: Promise<{ week: string; day: string }>;
}) {
  const { week, day } = await params;
  const dayMeta = getDay(Number(week), Number(day));

  if (!dayMeta) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-8 sm:py-10">
      {/* DayGate가 잠금을 판정한다. 잠겨 있으면 아래 내용은 렌더링되지 않는다.
          Hero는 게이트 안에 둔다 — 잠긴 Day에서 진행률·목표가 먼저 보이면
          들어갈 수 있는 것처럼 읽힌다. */}
      <DayGate day={dayMeta}>
        <DayHero day={dayMeta} />
        {dayMeta.status === "coming-soon" ? (
          <ComingSoon title={dayMeta.title} goal={dayMeta.goal} />
        ) : (
          <StepList lessons={dayMeta.lessons} day={dayMeta} />
        )}
      </DayGate>
    </div>
  );
}
