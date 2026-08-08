import type { LessonContent } from "./types";
import { DEFAULT_LAYOUT, DEFAULT_THEME } from "./types";

// 블록 엔진이 실제로 도는지 확인하기 위한 샘플 Lesson 1개.
// 실제 수업 콘텐츠가 아니라 각 블록 유형의 동작 확인용이다 —
// 2주차 실제 콘텐츠 대량 생성은 이번 단계 범위 밖.

const base = { visibility: "visible" as const, layout: DEFAULT_LAYOUT, theme: DEFAULT_THEME };
const wide = { ...base, layout: { ...DEFAULT_LAYOUT, width: "wide" as const } };

export const SAMPLE_LESSON_ID = "sample-block-showcase";

export function buildSampleLesson(): LessonContent {
  const now = Date.now();
  return {
    id: SAMPLE_LESSON_ID,
    courseId: "default-course",
    week: 2,
    day: 1,
    lesson: 99,
    title: "블록 엔진 샘플",
    description: "17종 블록이 실제로 렌더링되는지 확인하는 데모 Lesson입니다.",
    durationMinutes: 10,
    status: "published",
    version: 1,
    createdAt: now,
    updatedAt: now,
    pages: [
      {
        id: "sample-p1",
        title: "1. 글 + 이미지",
        layout: "standard",
        blocks: [
          {
            ...base,
            id: "sample-b1",
            type: "rich-text",
            title: "서식 있는 글 블록",
            data: {
              markdown:
                "이 블록은 **마크다운**을 지원합니다.\n\n- 목록\n- *기울임*\n- `코드`\n\n> 인용문도 됩니다.",
            },
          },
          {
            ...base,
            id: "sample-b2",
            type: "text-image",
            title: "글 + 이미지 블록",
            data: {
              markdown: "왼쪽에는 설명이, 오른쪽에는 이미지가 배치됩니다.",
              imageUrl: "/next.svg",
              alt: "샘플 이미지",
              imagePosition: "right",
            },
          },
          { ...base, id: "sample-b3", type: "divider", data: { style: "line" } },
          {
            ...base,
            id: "sample-b4",
            type: "image",
            data: { url: "/vercel.svg", alt: "샘플 이미지", caption: "이미지 블록 + 캡션" },
          },
        ],
      },
      {
        id: "sample-p2",
        title: "2. 인포그래픽",
        layout: "wide",
        blocks: [
          {
            ...wide,
            id: "sample-b5",
            type: "infographic",
            title: "단계형",
            data: {
              variant: "steps",
              items: [
                { label: "고객 증거", description: "실제 자료 수집" },
                { label: "세그먼트", description: "문제 기준 분류" },
                { label: "가치제안", description: "한 문장으로 압축" },
              ],
            },
          },
          {
            ...wide,
            id: "sample-b6",
            type: "infographic",
            title: "체크리스트형",
            data: {
              variant: "checklist",
              items: [
                { label: "근거 있는 내용만 사용했는가" },
                { label: "사람이 최종 승인했는가" },
              ],
            },
          },
        ],
      },
      {
        id: "sample-p3",
        title: "3. HTML 직접 입력",
        layout: "standard",
        blocks: [
          {
            ...base,
            id: "sample-b7",
            type: "html",
            title: "관리자가 붙여넣은 HTML",
            description: "iframe에 격리되어 렌더링됩니다(스크립트 미승인 상태).",
            data: {
              html: `<div style="font-family:system-ui;padding:24px;background:#EEF2FF;border-radius:12px">
  <h2 style="margin:0 0 8px;color:#4F46E5">HTML 블록</h2>
  <p style="margin:0;color:#334155">이 내용은 sandbox iframe 안에서 그려집니다.</p>
</div>`,
            },
          },
        ],
      },
      {
        id: "sample-p4",
        title: "4. 기존 HTML 파일",
        layout: "fullscreen",
        blocks: [
          {
            ...base,
            id: "sample-b8",
            type: "html-file",
            layout: { ...DEFAULT_LAYOUT, width: "full", spacing: "none" },
            data: {
              src: "/lesson-content/week2/day1/lesson1/page01.html",
              trustedScript: true,
              designWidth: 1280,
              designHeight: 720,
            },
          },
        ],
      },
      {
        id: "sample-p5",
        title: "5. 외부 실습 + 프롬프트",
        layout: "practice",
        blocks: [
          {
            ...base,
            id: "sample-b9",
            type: "prompt",
            title: "AI에 붙여넣을 프롬프트",
            data: {
              prompt:
                "아래 고객 후기만을 근거로 반복 문제, 촉발 사건, 현재 대안을 표로 정리해줘. 자료에 없는 내용은 '검증 필요'로 표시할 것.",
              targetTool: "ChatGPT",
              copyable: true,
            },
          },
          {
            ...base,
            id: "sample-b10",
            type: "external-link",
            title: "외부 도구에서 실습하기",
            data: {
              url: "https://chatgpt.com",
              buttonLabel: "ChatGPT 열기",
              openInNewTab: true,
              showSecurityNotice: true,
              requireCompletionCheck: true,
            },
          },
          {
            ...base,
            id: "sample-b11",
            type: "internal-app",
            title: "앱 안에서 실습하기",
            data: {
              route: "/mentor",
              practiceName: "AI Mentor 진단",
              outputArtifactType: "custom",
              completionNote: "진단을 실행한 뒤 돌아와 완료를 표시하세요.",
              requireCompletionCheck: true,
            },
          },
        ],
      },
      {
        id: "sample-p6",
        title: "6. 입력 + 저장",
        layout: "practice",
        blocks: [
          {
            ...base,
            id: "sample-b12",
            type: "input-form",
            title: "내 사업 정보 입력",
            data: {
              fields: [
                {
                  id: "idea",
                  label: "사업 아이디어 한 문장",
                  kind: "short-text",
                  required: true,
                  placeholder: "예: 소규모 카페용 재고 자동화",
                },
                { id: "problem", label: "해결하려는 문제", kind: "long-text", required: false },
              ],
              artifactType: "business-idea",
            },
          },
          {
            ...base,
            id: "sample-b13",
            type: "save-artifact",
            title: "결과물 저장",
            data: {
              artifactType: "business-idea",
              artifactTitle: "사업 아이디어",
              sourceBlockId: "sample-b12",
              buttonLabel: "내 프로젝트에 저장",
            },
          },
          {
            ...base,
            id: "sample-b14",
            type: "result-preview",
            title: "저장된 결과 미리보기",
            data: { artifactType: "business-idea", emptyMessage: "위에서 저장하면 여기 나타납니다." },
          },
          {
            ...base,
            id: "sample-b15",
            type: "download",
            title: "자료 받기",
            data: { url: "/next.svg", fileName: "sample.svg", sizeLabel: "SVG" },
          },
        ],
      },
      {
        id: "sample-p7",
        title: "7. 퀴즈 + 회고",
        layout: "standard",
        blocks: [
          {
            ...base,
            id: "sample-b16",
            type: "quiz",
            title: "이해도 확인",
            data: {
              questions: [
                {
                  id: "q1",
                  question: "AI 결과를 다룰 때 올바른 태도는?",
                  choices: [
                    { id: "a", text: "검토 없이 바로 게시한다" },
                    { id: "b", text: "근거·추론·검증필요로 구분한다" },
                  ],
                  correctChoiceId: "b",
                  explanation: "AI 결과는 항상 근거 수준을 구분해서 다뤄야 합니다.",
                },
              ],
            },
          },
          {
            ...base,
            id: "sample-b17",
            type: "reflection",
            title: "오늘의 회고",
            data: {
              questions: ["가장 중요하다고 느낀 한 가지는?", "내 사업에 바로 적용할 것은?"],
            },
          },
        ],
      },
    ],
  };
}
