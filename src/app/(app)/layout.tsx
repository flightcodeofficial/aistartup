import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { FollowInstructorListener } from "@/components/layout/FollowInstructorListener";
import { AuthGate } from "@/features/auth/AuthGate";
import { ProfileGate } from "@/features/profile/ProfileGate";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <ProfileGate>
        <AppShell>
          <FollowInstructorListener />
          {children}
        </AppShell>
      </ProfileGate>
    </AuthGate>
  );
}
