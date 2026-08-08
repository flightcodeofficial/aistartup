import type { ReactNode } from "react";
import { StaffOnly } from "@/features/auth/StaffOnly";

/** /admin 아래 Lesson Studio 전체를 강사·관리자에게만 보여준다. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <StaffOnly>{children}</StaffOnly>;
}
