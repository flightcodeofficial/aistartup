import type { Metadata } from "next";
import { Noto_Sans_KR, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { StoreHydrator } from "@/components/layout/StoreHydrator";
import { WorkspaceMigrationRunner } from "@/components/workspace/WorkspaceMigrationRunner";
import { AuthProvider } from "@/features/auth/AuthProvider";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI 창업 스쿨 | 2주차 고객 확보 & 자동화 마케팅",
  description:
    "비개발자 예비창업자를 위한 생성형 AI 기반 창업 실무 과정. 이론부터 실습, AI 분석, 결과 저장까지 하나의 웹앱에서 완성합니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${notoSansKR.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <TooltipProvider delayDuration={150}>
              <StoreHydrator />
              <WorkspaceMigrationRunner />
              {children}
              <Toaster position="top-center" richColors />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
