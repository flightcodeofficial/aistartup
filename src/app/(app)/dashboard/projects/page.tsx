import { redirect } from "next/navigation";

// 통합 이후 프로젝트 목록의 정본은 /workspace 다.
// 기존 링크·북마크가 깨지지 않도록 여기서 리다이렉트만 한다.
export default function LegacyProjectsListPage() {
  redirect("/workspace");
}
