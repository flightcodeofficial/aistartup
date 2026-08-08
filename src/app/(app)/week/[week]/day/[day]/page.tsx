import { notFound } from "next/navigation";
import { getDay } from "@/features/curriculum/data";
import { DayHero } from "@/components/step/DayHero";
import { StepList } from "@/components/step/StepList";
import { ComingSoon } from "@/components/common/ComingSoon";

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
      <DayHero day={dayMeta} />
      {dayMeta.status === "coming-soon" ? (
        <ComingSoon title={dayMeta.title} goal={dayMeta.goal} />
      ) : (
        <StepList lessons={dayMeta.lessons} />
      )}
    </div>
  );
}
