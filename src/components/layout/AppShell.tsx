import { Suspense, type ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ProjectAutoSync } from "@/components/projects/ProjectAutoSync";
import { StoreStatusBanner } from "@/components/layout/StoreStatusBanner";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <ProjectAutoSync />
      <aside className="hidden w-72 shrink-0 border-r border-border lg:block">
        <div className="sticky top-0 h-screen">
          <Suspense fallback={<div className="h-full bg-sidebar" />}>
            <Sidebar />
          </Suspense>
        </div>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <Header />
        <StoreStatusBanner />
        <main className="scrollbar-thin flex-1 overflow-y-auto bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  );
}
