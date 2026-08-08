"use client";

import { useState } from "react";
import { AlertTriangle, Eye, ShieldCheck, ShieldAlert } from "lucide-react";
import type {
  HtmlBlock,
  HtmlFileBlock,
  HtmlMobileRenderMode,
} from "@/features/lesson-builder/types";
import { SandboxedHtmlFrame } from "@/components/lesson-blocks/SandboxedHtmlFrame";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Field, NumberField } from "./inspectorFields";
import { cn } from "@/lib/utils";

// 관리자가 Gemini/ChatGPT에서 만든 HTML을 그대로 붙여넣고,
// 안전 상태를 눈으로 확인한 뒤 바로 미리볼 수 있게 한다.
// 코더가 파일을 직접 만질 필요가 없어야 한다는 게 이 화면의 목표다.

function SandboxStatus({ trusted }: { trusted: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border p-2.5 text-[11px] leading-relaxed",
        trusted
          ? "border-warning/40 bg-warning/10 text-warning-foreground"
          : "border-success/30 bg-success/10 text-success"
      )}
    >
      <p className="flex items-center gap-1.5 font-semibold">
        {trusted ? <ShieldAlert className="size-3.5" /> : <ShieldCheck className="size-3.5" />}
        {trusted ? "스크립트 실행 허용됨" : "안전 모드 (스크립트 차단)"}
      </p>
      <p className="mt-1">
        {trusted
          ? "이 HTML 안의 JavaScript가 실행됩니다. 직접 만들었거나 내용을 확인한 코드만 허용하세요."
          : "JavaScript가 실행되지 않습니다. 애니메이션·퀴즈 같은 동작이 필요하면 아래를 켜세요."}
      </p>
      <p className="mt-1 opacity-80">
        어떤 경우에도 이 콘텐츠는 격리된 iframe에서만 실행되며, 앱의 로그인 정보·저장 데이터·부모
        화면에는 접근할 수 없습니다.
      </p>
    </div>
  );
}

/** 좁은 화면에서 슬라이드를 축소할지, HTML 자체 반응형 CSS에 맡길지. */
function MobileRenderModeField({
  value = "scale",
  disabled,
  onChange,
}: {
  value?: HtmlMobileRenderMode;
  disabled: boolean;
  onChange: (mode: HtmlMobileRenderMode) => void;
}) {
  return (
    <div>
      <Label>모바일에서 보이는 방식</Label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as HtmlMobileRenderMode)}
        className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm disabled:opacity-50"
      >
        <option value="scale">그대로 축소 (PPT형 슬라이드)</option>
        <option value="responsive">화면 폭에 맞춰 세로로 (반응형 HTML)</option>
      </select>
      <p className="mt-1 text-[11px] text-muted-foreground">
        {disabled
          ? "디자인 가로·세로를 입력하면 선택할 수 있습니다."
          : value === "responsive"
            ? "폰에서는 축소하지 않고 HTML 안의 모바일 CSS가 동작합니다. 글씨가 작아지지 않습니다."
            : "폰에서도 16:9 비율 그대로 줄여서 보여줍니다. 글씨가 작아질 수 있습니다."}
      </p>
    </div>
  );
}

export function HtmlBlockEditor({
  block,
  onChange,
  onConvertToFile,
}: {
  block: HtmlBlock;
  onChange: (next: HtmlBlock) => void;
  onConvertToFile: () => void;
}) {
  const [showPreview, setShowPreview] = useState(true);
  const trusted = Boolean(block.data.trustedScript);

  const setData = (patch: Partial<HtmlBlock["data"]>) =>
    onChange({ ...block, data: { ...block.data, ...patch } });

  return (
    <div className="space-y-3">
      <Field
        label="HTML 코드"
        value={block.data.html}
        multiline
        rows={12}
        mono
        hint="AI가 만들어준 HTML 전체를 그대로 붙여넣으세요. <style>·<script>가 포함돼 있어도 됩니다."
        onChange={(html) => setData({ html })}
      />

      <SandboxStatus trusted={trusted} />

      <label className="flex items-start gap-2 text-sm">
        <Checkbox
          checked={trusted}
          onCheckedChange={(v) => setData({ trustedScript: Boolean(v) })}
          className="mt-0.5"
        />
        <span>
          스크립트 실행 허용
          <span className="block text-[11px] text-muted-foreground">
            애니메이션·인터랙션이 있는 HTML이면 켜세요.
          </span>
        </span>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <NumberField
          label="디자인 가로(px)"
          value={block.data.designWidth}
          placeholder="1280"
          onChange={(designWidth) => setData({ designWidth })}
        />
        <NumberField
          label="디자인 세로(px)"
          value={block.data.designHeight}
          placeholder="720"
          onChange={(designHeight) => setData({ designHeight })}
        />
      </div>
      <p className="-mt-1 text-[11px] text-muted-foreground">
        PPT형 슬라이드면 1280×720을 넣으세요. 화면이 작아도 잘리지 않고 비율대로 축소됩니다. 일반
        HTML이면 비워두세요.
      </p>

      <MobileRenderModeField
        value={block.data.mobileRenderMode}
        disabled={!block.data.designWidth || !block.data.designHeight}
        onChange={(mobileRenderMode) => setData({ mobileRenderMode })}
      />

      <div className="flex flex-wrap gap-1.5">
        <Button variant="outline" size="sm" onClick={() => setShowPreview((v) => !v)} className="gap-1.5">
          <Eye className="size-3.5" />
          {showPreview ? "미리보기 숨기기" : "미리보기 보기"}
        </Button>
        <Button variant="outline" size="sm" onClick={onConvertToFile} className="gap-1.5">
          HTML 파일 방식으로 전환
        </Button>
      </div>

      {showPreview && block.data.html.trim() && (
        <div className="rounded-xl border border-border p-2">
          <p className="mb-1.5 text-[11px] font-semibold text-muted-foreground">미리보기</p>
          <SandboxedHtmlFrame
            html={block.data.html}
            title="HTML 미리보기"
            trustedScript={trusted}
            designWidth={block.data.designWidth}
            designHeight={block.data.designHeight}
            mobileRenderMode={block.data.mobileRenderMode}
          />
        </div>
      )}
    </div>
  );
}

export function HtmlFileBlockEditor({
  block,
  onChange,
  onConvertToInline,
}: {
  block: HtmlFileBlock;
  onChange: (next: HtmlFileBlock) => void;
  onConvertToInline: () => void;
}) {
  const [showPreview, setShowPreview] = useState(true);
  const trusted = Boolean(block.data.trustedScript);

  const setData = (patch: Partial<HtmlFileBlock["data"]>) =>
    onChange({ ...block, data: { ...block.data, ...patch } });

  return (
    <div className="space-y-3">
      <Field
        label="HTML 파일 경로"
        value={block.data.src}
        placeholder="/lesson-content/week2/day1/lesson1/page01.html"
        hint="public 폴더에 올린 파일 경로입니다. / 로 시작해야 합니다."
        onChange={(src) => setData({ src })}
      />

      {block.data.src && !block.data.src.startsWith("/") && (
        <p className="flex items-start gap-1.5 rounded-lg bg-danger/10 p-2 text-[11px] text-danger">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          경로는 / 로 시작해야 합니다.
        </p>
      )}

      <SandboxStatus trusted={trusted} />

      <label className="flex items-start gap-2 text-sm">
        <Checkbox
          checked={trusted}
          onCheckedChange={(v) => setData({ trustedScript: Boolean(v) })}
          className="mt-0.5"
        />
        <span>스크립트 실행 허용</span>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <NumberField
          label="디자인 가로(px)"
          value={block.data.designWidth}
          placeholder="1280"
          onChange={(designWidth) => setData({ designWidth })}
        />
        <NumberField
          label="디자인 세로(px)"
          value={block.data.designHeight}
          placeholder="720"
          onChange={(designHeight) => setData({ designHeight })}
        />
      </div>

      <MobileRenderModeField
        value={block.data.mobileRenderMode}
        disabled={!block.data.designWidth || !block.data.designHeight}
        onChange={(mobileRenderMode) => setData({ mobileRenderMode })}
      />

      <div className="flex flex-wrap gap-1.5">
        <Button variant="outline" size="sm" onClick={() => setShowPreview((v) => !v)} className="gap-1.5">
          <Eye className="size-3.5" />
          {showPreview ? "미리보기 숨기기" : "미리보기 보기"}
        </Button>
        <Button variant="outline" size="sm" onClick={onConvertToInline}>
          직접 붙여넣기 방식으로 전환
        </Button>
      </div>

      {showPreview && block.data.src.startsWith("/") && (
        <div className="rounded-xl border border-border p-2">
          <p className="mb-1.5 text-[11px] font-semibold text-muted-foreground">미리보기</p>
          <SandboxedHtmlFrame
            src={block.data.src}
            title="HTML 파일 미리보기"
            trustedScript={trusted}
            designWidth={block.data.designWidth}
            designHeight={block.data.designHeight}
            mobileRenderMode={block.data.mobileRenderMode}
          />
        </div>
      )}
    </div>
  );
}
