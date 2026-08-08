"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, FileJson, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ExportBundle } from "@/features/export/types";
import { downloadMarkdown } from "@/features/export/toMarkdown";
import { downloadJSON } from "@/features/export/toJSON";
import { downloadPDF } from "@/features/export/toPDF";

export function ExportMenu({
  bundle,
  captureElementId,
}: {
  bundle: ExportBundle;
  captureElementId: string;
}) {
  const [exportingPdf, setExportingPdf] = useState(false);

  const handlePdf = async () => {
    setExportingPdf(true);
    try {
      await downloadPDF(captureElementId, `week${bundle.week}-day${bundle.day}-결과.pdf`);
      toast.success("PDF로 저장했습니다");
    } catch {
      toast.error("PDF 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setExportingPdf(false);
    }
  };

  const handleMarkdown = () => {
    downloadMarkdown(bundle);
    toast.success("Markdown 파일을 저장했습니다");
  };

  const handleJson = () => {
    downloadJSON(bundle);
    toast.success("JSON 파일을 저장했습니다");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={exportingPdf}>
          {exportingPdf ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          내보내기
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handlePdf} disabled={exportingPdf}>
          <FileText className="size-4" />
          PDF 다운로드
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleMarkdown}>
          <FileText className="size-4" />
          Markdown 다운로드
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleJson}>
          <FileJson className="size-4" />
          JSON 다운로드
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
