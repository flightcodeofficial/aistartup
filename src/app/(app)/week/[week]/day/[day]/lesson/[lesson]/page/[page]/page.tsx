import { notFound } from "next/navigation";
import { getDay } from "@/features/curriculum/data";
import { getLessonManifest, lessonContentFileExists } from "@/lib/lessonContent";
import { StudentLessonRoute } from "@/components/lesson-player/StudentLessonRoute";
import { LessonGate } from "@/components/curriculum/LessonGate";
import type { LessonPageViewerLessonOption } from "@/components/lesson-content/LessonPageViewer";

// 학생용 Lesson 화면(canonical URL).
//
// 서버에서는 legacy HTML 자료(manifest·파일 존재 여부)만 준비한다.
// 게시된 Block Lesson은 브라우저 저장소에 있어 서버가 알 수 없으므로,
// 둘 중 무엇을 보여줄지는 StudentLessonRoute(클라이언트)가 정한다.
//
// 페이지 번호가 manifest에 없다고 여기서 404를 내면, 페이지 수가 더 많은
// Block Lesson의 deep link(예: 10페이지)가 서버에서 먼저 잘려버린다.
// 그래서 번호 검증은 클라이언트로 넘긴다.

export default async function LessonContentPage({
  params,
}: {
  params: Promise<{ week: string; day: string; lesson: string; page: string }>;
}) {
  const { week: weekParam, day: dayParam, lesson: lessonParam, page: pageParam } = await params;
  const week = Number(weekParam);
  const day = Number(dayParam);
  const lessonNumber = Number(lessonParam);
  const pageNumber = Number(pageParam);

  const dayMeta = getDay(week, day);
  const lessonMeta = dayMeta?.lessons.find((l) => l.lessonNumber === lessonNumber);
  if (!dayMeta || !lessonMeta || !Number.isFinite(pageNumber)) notFound();

  const manifest = getLessonManifest(week, day, lessonNumber);
  const pages = manifest?.pages ?? [];
  const pageIndex = pages.findIndex((p) => p.pageNumber === pageNumber);

  const currentEntry = pageIndex >= 0 ? pages[pageIndex] : undefined;
  const prevPageNumber = pageIndex > 0 ? pages[pageIndex - 1].pageNumber : undefined;
  const nextPageNumber =
    pageIndex >= 0 && pageIndex < pages.length - 1 ? pages[pageIndex + 1].pageNumber : undefined;
  const pageExists =
    Boolean(currentEntry) && lessonContentFileExists(week, day, lessonNumber, currentEntry!.file);

  const otherLessons: LessonPageViewerLessonOption[] = dayMeta.lessons.map((l) => {
    const m = getLessonManifest(week, day, l.lessonNumber);
    return {
      lessonNumber: l.lessonNumber,
      title: l.title,
      hasContent: m !== null,
      firstPageNumber: m?.pages[0]?.pageNumber ?? 1,
    };
  });

  return (
    <LessonGate day={dayMeta} lesson={lessonMeta}>
    <StudentLessonRoute
      week={week}
      day={day}
      lesson={lessonNumber}
      pageNumber={pageNumber}
      legacy={{
        lessonTitle: lessonMeta.title,
        pages,
        currentFile: currentEntry?.file,
        currentPageTitle: currentEntry?.title,
        prevPageNumber,
        nextPageNumber,
        pageExists,
        // manifest가 아예 없는 Lesson은 page=1만 "콘텐츠 준비 중" 화면으로 허용한다.
        hasPage: manifest ? pageIndex !== -1 : pageNumber === 1,
        otherLessons,
      }}
    />
    </LessonGate>
  );
}
