"use client";

import type { BlockLayout, BlockTheme, LessonBlock, LessonContent } from "@/features/lesson-builder/types";
import { createEmptyBlock } from "@/features/lesson-builder/types";
import { ImageSourcePicker } from "./ImageSourcePicker";
import { BlockReferencePicker, collectReferenceableBlocks } from "./BlockReferencePicker";
import { findCatalogEntry } from "@/features/lesson-builder/blockCatalog";
import { ARTIFACT_TYPES, ARTIFACT_TYPE_LABELS } from "@/features/workspace/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Field,
  MEDIA_DISPLAY_OPTIONS,
  MEDIA_FIT_OPTIONS,
  MEDIA_RATIO_OPTIONS,
  NumberField,
  SelectField,
} from "./inspectorFields";
import { HtmlBlockEditor, HtmlFileBlockEditor } from "./HtmlBlockEditor";
import { InputFormEditor, QuizEditor } from "./QuizFormEditors";

// 선택된 블록 하나의 속성을 편집한다.
// 공통 속성(제목/설명/레이아웃/배경/모바일)은 모든 블록이 공유하고,
// data 부분만 블록 타입별로 다른 폼을 보여준다. JSON 직접 편집은 어디에도 없다.

/** 블록 data의 일부만 바꾼 새 블록을 만든다. */
function withData<B extends LessonBlock>(block: B, patch: Partial<B["data"]>): B {
  return { ...block, data: { ...block.data, ...patch } };
}

const ARTIFACT_TYPE_OPTIONS = ARTIFACT_TYPES.map((t) => ({
  value: t,
  label: ARTIFACT_TYPE_LABELS[t],
}));

function ArtifactTypesPicker({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  hint?: string;
}) {
  const toggle = (type: string) =>
    onChange(value.includes(type) ? value.filter((t) => t !== type) : [...value, type]);

  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {ARTIFACT_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => toggle(t)}
            className={
              value.includes(t)
                ? "rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground"
                : "rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground hover:border-primary/40"
            }
          >
            {ARTIFACT_TYPE_LABELS[t]}
          </button>
        ))}
      </div>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function MediaOptions({
  display,
  objectFit,
  aspectRatio,
  mobileRatio,
  onChange,
}: {
  display?: string;
  objectFit?: string;
  aspectRatio?: string;
  mobileRatio?: string;
  onChange: (patch: Record<string, string>) => void;
}) {
  return (
    <>
      <SelectField
        label="표현 크기"
        value={(display ?? "large") as "half" | "large" | "hero" | "fullscreen"}
        options={MEDIA_DISPLAY_OPTIONS}
        onChange={(v) => onChange({ display: v })}
      />
      <SelectField
        label="채우기 방식"
        value={(objectFit ?? "cover") as "contain" | "cover"}
        options={MEDIA_FIT_OPTIONS}
        onChange={(v) => onChange({ objectFit: v })}
      />
      <SelectField
        label="비율"
        value={(aspectRatio ?? "auto") as "auto" | "16/9" | "4/3" | "1/1" | "3/2" | "21/9"}
        options={MEDIA_RATIO_OPTIONS}
        onChange={(v) => onChange({ aspectRatio: v })}
      />
      {mobileRatio !== undefined || true ? (
        <SelectField
          label="모바일 비율"
          value={(mobileRatio ?? "auto") as "auto" | "16/9" | "4/3" | "1/1" | "3/2" | "21/9"}
          options={MEDIA_RATIO_OPTIONS}
          onChange={(v) => onChange({ mobileRatio: v })}
          hint="세로 화면에서 이미지가 너무 커지지 않게 조정합니다."
        />
      ) : null}
    </>
  );
}

function BlockDataEditor({
  block,
  onChange,
  lesson,
}: {
  block: LessonBlock;
  onChange: (next: LessonBlock) => void;
  lesson: LessonContent | null;
}) {
  switch (block.type) {
    case "rich-text":
      return (
        <div className="space-y-3">
          <Field
            label="본문 (마크다운)"
            value={block.data.markdown}
            multiline
            rows={10}
            hint="## 제목, **굵게**, - 목록, > 인용 을 쓸 수 있습니다."
            onChange={(markdown) => onChange(withData(block, { markdown }))}
          />
          <SelectField
            label="강조 정도"
            value={block.data.emphasis ?? "normal"}
            options={[
              { value: "normal" as const, label: "본문" },
              { value: "lead" as const, label: "도입부 (조금 크게)" },
              { value: "hero" as const, label: "히어로 (아주 크게)" },
            ]}
            onChange={(emphasis) => onChange(withData(block, { emphasis }))}
          />
        </div>
      );

    case "image":
      return (
        <div className="space-y-3">
          <ImageSourcePicker
            label="이미지"
            value={block.data.url}
            onChange={(url) => onChange(withData(block, { url }))}
          />
          <Field
            label="대체 텍스트 (alt)"
            value={block.data.alt}
            hint="이미지를 볼 수 없을 때 읽히는 설명입니다."
            onChange={(alt) => onChange(withData(block, { alt }))}
          />
          <Field
            label="캡션"
            value={block.data.caption ?? ""}
            onChange={(caption) => onChange(withData(block, { caption: caption || undefined }))}
          />
          <MediaOptions
            display={block.data.display}
            objectFit={block.data.objectFit}
            aspectRatio={block.data.aspectRatio}
            mobileRatio={block.data.mobileRatio}
            onChange={(patch) => onChange(withData(block, patch as Partial<typeof block.data>))}
          />
        </div>
      );

    case "text-image":
      return (
        <div className="space-y-3">
          <Field
            label="본문 (마크다운)"
            value={block.data.markdown}
            multiline
            onChange={(markdown) => onChange(withData(block, { markdown }))}
          />
          <ImageSourcePicker
            label="이미지"
            value={block.data.imageUrl}
            onChange={(imageUrl) => onChange(withData(block, { imageUrl }))}
          />
          <Field label="대체 텍스트" value={block.data.alt} onChange={(alt) => onChange(withData(block, { alt }))} />
          <SelectField
            label="이미지 위치"
            value={block.data.imagePosition}
            options={[
              { value: "left" as const, label: "왼쪽" },
              { value: "right" as const, label: "오른쪽" },
            ]}
            onChange={(imagePosition) => onChange(withData(block, { imagePosition }))}
          />
        </div>
      );

    case "infographic":
      return (
        <div className="space-y-3">
          <SelectField
            label="형태"
            value={block.data.variant}
            options={[
              { value: "steps" as const, label: "단계" },
              { value: "stats" as const, label: "숫자 강조" },
              { value: "comparison" as const, label: "비교" },
              { value: "checklist" as const, label: "체크리스트" },
              { value: "image" as const, label: "이미지 인포그래픽" },
            ]}
            onChange={(variant) => onChange(withData(block, { variant }))}
          />

          {block.data.variant === "image" ? (
            <>
              <ImageSourcePicker
                label="인포그래픽 이미지"
                value={block.data.imageUrl ?? ""}
                onChange={(imageUrl) => onChange(withData(block, { imageUrl }))}
              />
              <Field
                label="대체 텍스트"
                value={block.data.alt ?? ""}
                onChange={(alt) => onChange(withData(block, { alt }))}
              />
              <Field
                label="캡션"
                value={block.data.caption ?? ""}
                onChange={(caption) => onChange(withData(block, { caption: caption || undefined }))}
              />
              <SelectField
                label="표현 크기"
                value={block.data.display ?? "large"}
                options={MEDIA_DISPLAY_OPTIONS}
                onChange={(display) => onChange(withData(block, { display }))}
              />
              <SelectField
                label="채우기 방식"
                value={block.data.fit ?? "contain"}
                options={MEDIA_FIT_OPTIONS}
                onChange={(fit) => onChange(withData(block, { fit }))}
                hint="인포그래픽은 글씨가 잘리면 안 되므로 보통 '전체 보이기'를 씁니다."
              />
              <SelectField
                label="비율"
                value={block.data.aspectRatio ?? "auto"}
                options={MEDIA_RATIO_OPTIONS}
                onChange={(aspectRatio) => onChange(withData(block, { aspectRatio }))}
              />
            </>
          ) : (
            <Field
              label="항목 (한 줄에 하나: 제목 | 값 | 설명)"
              multiline
              rows={6}
              hint="예)  세그먼트 나누기 | 3개 | 문제 기준으로 분류"
              value={block.data.items
                .map((i) => [i.label, i.value ?? "", i.description ?? ""].join(" | "))
                .join("\n")}
              onChange={(text) =>
                onChange(
                  withData(block, {
                    items: text
                      .split("\n")
                      .map((line) => line.split("|").map((s) => s.trim()))
                      .filter((parts) => parts[0])
                      .map((parts) => ({
                        label: parts[0],
                        value: parts[1] || undefined,
                        description: parts[2] || undefined,
                      })),
                  })
                )
              }
            />
          )}
        </div>
      );

    case "html":
      return (
        <HtmlBlockEditor
          block={block}
          onChange={onChange}
          onConvertToFile={() => {
            const next = createEmptyBlock("html-file");
            onChange({
              ...next,
              id: block.id,
              title: block.title,
              description: block.description,
              visibility: block.visibility,
              layout: block.layout,
              theme: block.theme,
            });
          }}
        />
      );

    case "html-file":
      return (
        <HtmlFileBlockEditor
          block={block}
          onChange={onChange}
          onConvertToInline={() => {
            const next = createEmptyBlock("html");
            onChange({
              ...next,
              id: block.id,
              title: block.title,
              description: block.description,
              visibility: block.visibility,
              layout: block.layout,
              theme: block.theme,
            });
          }}
        />
      );

    case "video":
      return (
        <div className="space-y-3">
          <Field label="영상 URL" value={block.data.url} onChange={(url) => onChange(withData(block, { url }))} />
          <SelectField
            label="제공처"
            value={block.data.provider}
            options={[
              { value: "youtube" as const, label: "YouTube" },
              { value: "vimeo" as const, label: "Vimeo" },
              { value: "file" as const, label: "직접 파일" },
            ]}
            onChange={(provider) => onChange(withData(block, { provider }))}
          />
          <Field
            label="캡션"
            value={block.data.caption ?? ""}
            onChange={(caption) => onChange(withData(block, { caption: caption || undefined }))}
          />
        </div>
      );

    case "external-link":
      return (
        <div className="space-y-3">
          <Field
            label="실습명"
            value={block.data.practiceName ?? ""}
            placeholder="예: ChatGPT로 고객 증거 정리하기"
            onChange={(practiceName) => onChange(withData(block, { practiceName: practiceName || undefined }))}
          />
          <Field
            label="실습 설명"
            multiline
            rows={3}
            value={block.data.practiceDescription ?? ""}
            onChange={(v) => onChange(withData(block, { practiceDescription: v || undefined }))}
          />
          <NumberField
            label="예상 시간(분)"
            value={block.data.estimatedMinutes}
            placeholder="10"
            onChange={(estimatedMinutes) => onChange(withData(block, { estimatedMinutes }))}
          />
          <Field label="URL" value={block.data.url} onChange={(url) => onChange(withData(block, { url }))} />
          <Field
            label="버튼 문구"
            value={block.data.buttonLabel}
            onChange={(buttonLabel) => onChange(withData(block, { buttonLabel }))}
          />
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={block.data.openInNewTab}
              onCheckedChange={(v) => onChange(withData(block, { openInNewTab: Boolean(v) }))}
            />
            새 탭에서 열기
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={block.data.showSecurityNotice}
              onCheckedChange={(v) => onChange(withData(block, { showSecurityNotice: Boolean(v) }))}
            />
            보안 경고 표시
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={block.data.requireCompletionCheck}
              onCheckedChange={(v) => onChange(withData(block, { requireCompletionCheck: Boolean(v) }))}
            />
            완료 확인 버튼 표시
          </label>
        </div>
      );

    case "internal-app":
      return (
        <div className="space-y-3">
          <Field
            label="앱 내부 경로"
            value={block.data.route}
            placeholder="/mentor"
            onChange={(route) => onChange(withData(block, { route }))}
          />
          <Field
            label="실습명"
            value={block.data.practiceName}
            onChange={(practiceName) => onChange(withData(block, { practiceName }))}
          />
          <Field
            label="안내 문구"
            value={block.data.completionNote ?? ""}
            onChange={(v) => onChange(withData(block, { completionNote: v || undefined }))}
          />
          <ArtifactTypesPicker
            label="참고할 이전 결과물"
            value={block.data.inputArtifactTypes ?? []}
            hint="학생이 이전 Lesson 결과를 불러와 참고할 수 있습니다."
            onChange={(inputArtifactTypes) =>
              onChange(withData(block, { inputArtifactTypes: inputArtifactTypes.length ? inputArtifactTypes : undefined }))
            }
          />
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={block.data.requireCompletionCheck}
              onCheckedChange={(v) => onChange(withData(block, { requireCompletionCheck: Boolean(v) }))}
            />
            완료 확인 버튼 표시
          </label>
        </div>
      );

    case "quiz":
      return <QuizEditor block={block} onChange={onChange} />;

    case "input-form":
      return (
        <div className="space-y-3">
          <InputFormEditor block={block} onChange={onChange} />
          <ArtifactTypesPicker
            label="불러올 수 있는 이전 결과물"
            value={block.data.inputArtifactTypes ?? []}
            hint="선택하면 학생이 이전 Lesson 결과를 입력칸에 바로 불러올 수 있습니다."
            onChange={(inputArtifactTypes) =>
              onChange(withData(block, { inputArtifactTypes: inputArtifactTypes.length ? inputArtifactTypes : undefined }))
            }
          />
        </div>
      );

    case "prompt":
      return (
        <div className="space-y-3">
          <Field
            label="프롬프트"
            multiline
            rows={8}
            mono
            value={block.data.prompt}
            onChange={(prompt) => onChange(withData(block, { prompt }))}
          />
          <Field
            label="대상 도구"
            value={block.data.targetTool ?? ""}
            placeholder="ChatGPT"
            onChange={(v) => onChange(withData(block, { targetTool: v || undefined }))}
          />
          <ArtifactTypesPicker
            label="내 결과물 덧붙이기 허용"
            value={block.data.inputArtifactTypes ?? []}
            hint="학생이 자기 결과물을 프롬프트 뒤에 붙여서 복사할 수 있습니다."
            onChange={(inputArtifactTypes) =>
              onChange(withData(block, { inputArtifactTypes: inputArtifactTypes.length ? inputArtifactTypes : undefined }))
            }
          />
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={block.data.copyable}
              onCheckedChange={(v) => onChange(withData(block, { copyable: Boolean(v) }))}
            />
            복사 버튼 표시
          </label>
        </div>
      );

    case "download":
      return (
        <div className="space-y-3">
          <Field label="파일 URL" value={block.data.url} onChange={(url) => onChange(withData(block, { url }))} />
          <Field
            label="파일명"
            value={block.data.fileName}
            onChange={(fileName) => onChange(withData(block, { fileName }))}
          />
          <Field
            label="크기 표시 (선택)"
            value={block.data.sizeLabel ?? ""}
            onChange={(v) => onChange(withData(block, { sizeLabel: v || undefined }))}
          />
        </div>
      );

    case "result-preview":
      return (
        <div className="space-y-3">
          <SelectField
            label="보여줄 결과물 유형"
            value={(block.data.artifactType ?? "custom") as (typeof ARTIFACT_TYPES)[number]}
            options={ARTIFACT_TYPE_OPTIONS}
            onChange={(artifactType) => onChange(withData(block, { artifactType }))}
          />
          <Field
            label="비었을 때 문구"
            value={block.data.emptyMessage ?? ""}
            onChange={(v) => onChange(withData(block, { emptyMessage: v || undefined }))}
          />
        </div>
      );

    case "save-artifact":
      return (
        <div className="space-y-3">
          <SelectField
            label="저장할 결과물 유형"
            value={block.data.artifactType as (typeof ARTIFACT_TYPES)[number]}
            options={ARTIFACT_TYPE_OPTIONS}
            onChange={(artifactType) => onChange(withData(block, { artifactType }))}
          />
          <Field
            label="결과물 제목"
            value={block.data.artifactTitle}
            onChange={(artifactTitle) => onChange(withData(block, { artifactTitle }))}
          />
          <BlockReferencePicker
            label="저장할 입력"
            value={block.data.sourceBlockId}
            options={collectReferenceableBlocks(lesson, ["input-form"], block.id)}
            hint="선택한 입력 폼의 내용이 그대로 저장됩니다. 선택하지 않으면 학생이 직접 작성합니다."
            onChange={(sourceBlockId) => onChange(withData(block, { sourceBlockId }))}
          />
          <Field
            label="버튼 문구"
            value={block.data.buttonLabel}
            onChange={(buttonLabel) => onChange(withData(block, { buttonLabel }))}
          />
        </div>
      );

    case "reflection":
      return (
        <div className="space-y-3">
          <Field
            label="회고 질문 (한 줄에 하나)"
            multiline
            rows={5}
            value={block.data.questions.join("\n")}
            onChange={(text) =>
              onChange(withData(block, { questions: text.split("\n").filter((q) => q.trim()) }))
            }
          />
          <Field
            label="안내 문구"
            value={block.data.placeholder ?? ""}
            onChange={(v) => onChange(withData(block, { placeholder: v || undefined }))}
          />
        </div>
      );

    case "divider":
      return (
        <SelectField
          label="구분선 스타일"
          value={block.data.style}
          options={[
            { value: "line" as const, label: "선" },
            { value: "space" as const, label: "여백" },
            { value: "dots" as const, label: "점" },
          ]}
          onChange={(style) => onChange(withData(block, { style }))}
        />
      );
  }
}

export function BlockInspector({
  block,
  onChange,
  lesson = null,
}: {
  block: LessonBlock | null;
  onChange: (next: LessonBlock) => void;
  /** 블록끼리 연결(save-artifact 등)할 때 후보를 찾기 위해 Lesson 전체가 필요하다. */
  lesson?: LessonContent | null;
}) {
  if (!block) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        블록을 선택하면 여기에서 속성을 편집할 수 있습니다.
      </div>
    );
  }

  const entry = findCatalogEntry(block.type);
  const setLayout = (patch: Partial<BlockLayout>) =>
    onChange({ ...block, layout: { ...block.layout, ...patch } });
  const setTheme = (patch: Partial<BlockTheme>) =>
    onChange({ ...block, theme: { ...block.theme, ...patch } });

  return (
    <div className="scrollbar-thin h-full space-y-4 overflow-y-auto p-4">
      <div>
        <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {entry?.icon && <entry.icon className="size-3.5" />}
          {entry?.label ?? block.type}
        </p>
        {entry?.description && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">{entry.description}</p>
        )}
      </div>

      <Field
        label="블록 제목"
        value={block.title ?? ""}
        onChange={(title) => onChange({ ...block, title: title || undefined })}
      />
      <Field
        label="설명"
        value={block.description ?? ""}
        onChange={(description) => onChange({ ...block, description: description || undefined })}
      />

      <hr className="border-border" />
      <BlockDataEditor block={block} onChange={onChange} lesson={lesson} />
      <hr className="border-border" />

      <SelectField
        label="표시 여부"
        value={block.visibility}
        options={[
          { value: "visible" as const, label: "공개" },
          { value: "hidden" as const, label: "숨김" },
          { value: "instructor-only" as const, label: "강사에게만" },
        ]}
        onChange={(visibility) => onChange({ ...block, visibility })}
      />
      <SelectField
        label="폭"
        value={block.layout.width}
        options={[
          { value: "narrow" as const, label: "좁게" },
          { value: "normal" as const, label: "보통" },
          { value: "wide" as const, label: "넓게" },
          { value: "full" as const, label: "전체" },
        ]}
        onChange={(width) => setLayout({ width })}
      />
      <SelectField
        label="정렬"
        value={block.layout.align}
        options={[
          { value: "left" as const, label: "왼쪽" },
          { value: "center" as const, label: "가운데" },
          { value: "right" as const, label: "오른쪽" },
        ]}
        onChange={(align) => setLayout({ align })}
      />
      <SelectField
        label="여백"
        value={block.layout.spacing}
        options={[
          { value: "none" as const, label: "없음" },
          { value: "small" as const, label: "좁게" },
          { value: "medium" as const, label: "보통" },
          { value: "large" as const, label: "넓게" },
        ]}
        onChange={(spacing) => setLayout({ spacing })}
      />
      <SelectField
        label="배경"
        value={block.theme.background ?? "none"}
        options={[
          { value: "none" as const, label: "없음" },
          { value: "muted" as const, label: "연한 회색" },
          { value: "card" as const, label: "카드" },
          { value: "primary-soft" as const, label: "포인트 연한색" },
          { value: "dark" as const, label: "어두운색" },
        ]}
        onChange={(background) => setTheme({ background })}
      />
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={Boolean(block.theme.bordered)}
          onCheckedChange={(v) => setTheme({ bordered: Boolean(v) })}
        />
        테두리 표시
      </label>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={Boolean(block.layout.hideOnMobile)}
          onCheckedChange={(v) => setLayout({ hideOnMobile: Boolean(v) })}
        />
        모바일에서 숨기기
      </label>
    </div>
  );
}
