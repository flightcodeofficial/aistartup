import { create } from "zustand";
import { persist } from "zustand/middleware";

interface InstructorSyncState {
  followInstructor: boolean;
  setFollowInstructor: (value: boolean) => void;
}

export const useInstructorSyncStore = create<InstructorSyncState>()(
  persist(
    (set) => ({
      followInstructor: false,
      setFollowInstructor: (value) => set({ followInstructor: value }),
    }),
    { name: "ai-school-instructor-sync-pref", skipHydration: true }
  )
);
