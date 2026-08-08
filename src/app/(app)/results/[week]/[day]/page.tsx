import { notFound } from "next/navigation";
import { getDay } from "@/features/curriculum/data";
import { ResultsArchive } from "@/components/practice/ResultsArchive";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ week: string; day: string }>;
}) {
  const { week: weekParam, day: dayParam } = await params;
  const week = Number(weekParam);
  const day = Number(dayParam);
  const dayMeta = getDay(week, day);

  if (!dayMeta) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-8 sm:py-10">
      <div>
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {week}주차 · Day{day} 결과 모아보기
        </p>
        <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
          내가 만든 {dayMeta.title.replace(/^DAY \d+\s*—\s*/, "")}
        </h1>
      </div>
      <ResultsArchive week={week} day={day} dayTitle={dayMeta.title} />
    </div>
  );
}
