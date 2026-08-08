// 클라이언트 컴포넌트에서도 안전하게 쓸 수 있는 순수 경로 유틸.
// fs를 쓰는 lessonContent.ts(서버 전용)과 분리해서, 클라이언트 번들에 node:fs가
// 끼어들어가지 않게 한다. 파일명은 항상 manifest가 알려주는 값을 그대로 쓴다 —
// "pageNN.html" 같은 이름 규칙을 여기서 가정하지 않는다.

export function lessonContentAssetPath(week: number, day: number, lesson: number, file: string): string {
  return `/lesson-content/week${week}/day${day}/lesson${lesson}/${file}`;
}
