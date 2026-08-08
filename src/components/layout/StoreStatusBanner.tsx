"use client";

import { useEffect, useState } from "react";
import { CloudOff, WifiOff } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/env";

// 서버가 안 될 때 학생이 "왜 저장이 안 되지?"를 혼자 추측하지 않게 알려준다.
// 완전한 오프라인 동기화 엔진을 만들지는 않는다 — 상태만 정직하게 보여준다.

export function StoreStatusBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-warning/15 px-4 py-2 text-xs text-warning-foreground">
      {isSupabaseConfigured ? (
        <>
          <CloudOff className="size-3.5 shrink-0" />
          네트워크가 끊겼습니다. 입력한 내용은 이 브라우저에 보관되며, 연결되면 다시 저장을
          시도합니다.
        </>
      ) : (
        <>
          <WifiOff className="size-3.5 shrink-0" />
          오프라인 상태입니다. 저장은 이 브라우저에만 됩니다.
        </>
      )}
    </div>
  );
}
