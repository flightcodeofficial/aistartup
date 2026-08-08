import { create } from "zustand";
import { persist } from "zustand/middleware";

// 수업 중 저장되는 결과물이 "아무 프로젝트에나" 들어가지 않도록,
// 학생이 명시적으로 고른 활성 프로젝트를 기억한다.
// 활성 프로젝트가 없으면 save-artifact 블록은 저장 대신 선택 UI를 보여준다.

interface ActiveProjectState {
  activeProjectId: string | null;
}

interface ActiveProjectActions {
  setActiveProject: (projectId: string | null) => void;
}

export const useActiveProjectStore = create<ActiveProjectState & ActiveProjectActions>()(
  persist(
    (set) => ({
      activeProjectId: null,
      setActiveProject: (activeProjectId) => set({ activeProjectId }),
    }),
    { name: "ai-school-active-project", skipHydration: true }
  )
);
