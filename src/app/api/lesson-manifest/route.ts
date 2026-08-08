import { NextResponse } from "next/server";
import { getLessonManifest } from "@/lib/lessonContent";

// 관리자 Lesson Studio가 기존 HTML 콘텐츠를 가져올 때 쓰는 읽기 전용 엔드포인트.
// manifest 조회는 fs를 쓰기 때문에 서버에서만 가능해서 여기로 뺐다.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const week = Number(searchParams.get("week"));
  const day = Number(searchParams.get("day"));
  const lesson = Number(searchParams.get("lesson"));

  if (!Number.isFinite(week) || !Number.isFinite(day) || !Number.isFinite(lesson)) {
    return NextResponse.json({ error: "week/day/lesson 값이 올바르지 않습니다." }, { status: 400 });
  }

  const manifest = getLessonManifest(week, day, lesson);
  if (!manifest) {
    return NextResponse.json({ error: "해당 위치에 콘텐츠가 없습니다." }, { status: 404 });
  }

  return NextResponse.json({ pages: manifest.pages });
}
