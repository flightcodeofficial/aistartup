import fs from "node:fs";
import path from "node:path";

// Lesson Content Engine — Gemini가 만드는 pageNN.html을 수정 없이
// public/lesson-content/week{W}/day{D}/lesson{L}/ 폴더에 넣기만 하면 자동으로
// 렌더링되는 구조. 이 파일이 그 폴더 구조를 읽는 유일한 지점이다.
// 서버 전용(fs 사용) — 클라이언트에서 쓸 경로 유틸은 lessonContentPaths.ts 참고.
//
// 폴더 규격:
//   public/lesson-content/week{W}/day{D}/lesson{L}/
//     manifest.json
//     page08.html, page09.html, ...
//
// manifest.json 스펙(Gemini 실제 산출물 기준):
//   { "pages": [ { "page": 8, "file": "page08.html", "title": "..." }, ... ] }
// "page" 번호는 Lesson 안에서 1부터 시작한다는 보장이 없다 — 하루 전체 슬라이드를
// 이어서 매기는 경우(Lesson1이 1~7이면 Lesson2는 8부터) 흔하다. 그래서 pageCount나
// "pageNN.html" 파일명 패턴을 가정하지 않고, manifest의 pages[] 배열을 유일한
// 진실의 소스로 삼는다 — 페이지 번호도, 실제 파일명도, 순서도 전부 여기서 읽는다.
// "page"는 문자열("08")로 올 수도 있어 항상 Number()로 변환한다.
// manifest.json이 없으면 "아직 콘텐츠 없음"으로 처리한다.

export interface LessonContentPage {
  pageNumber: number;
  file: string;
  title: string;
}

export interface LessonContentManifest {
  /** pageNumber 오름차순으로 정렬되어 있다. */
  pages: LessonContentPage[];
}

function lessonContentDir(week: number, day: number, lesson: number): string {
  return path.join(process.cwd(), "public", "lesson-content", `week${week}`, `day${day}`, `lesson${lesson}`);
}

export function getLessonManifest(week: number, day: number, lesson: number): LessonContentManifest | null {
  const manifestPath = path.join(lessonContentDir(week, day, lesson), "manifest.json");
  try {
    if (!fs.existsSync(manifestPath)) return null;
    const raw = fs.readFileSync(manifestPath, "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.pages)) return null;

    const pages: LessonContentPage[] = parsed.pages
      .map((p: { page: unknown; file: unknown; title: unknown }) => ({
        pageNumber: Number(p.page),
        file: String(p.file ?? ""),
        title: String(p.title ?? ""),
      }))
      .filter((p: LessonContentPage) => Number.isFinite(p.pageNumber) && p.file.length > 0)
      .sort((a: LessonContentPage, b: LessonContentPage) => a.pageNumber - b.pageNumber);

    if (pages.length === 0) return null;
    return { pages };
  } catch {
    return null;
  }
}

export function lessonContentFileExists(week: number, day: number, lesson: number, file: string): boolean {
  return fs.existsSync(path.join(lessonContentDir(week, day, lesson), file));
}
