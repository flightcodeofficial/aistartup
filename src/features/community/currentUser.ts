// 지금은 로그인이 없으므로 브라우저별 게스트 프로필을 하나 생성해 재사용한다.
// 나중에 Supabase Auth를 붙이면 이 파일만 실제 로그인 사용자 조회로 교체하면 된다.

import type { UserProfile } from "./types";

const STORAGE_KEY = "ai-school-guest-profile";
const AVATAR_COLORS = ["#4F46E5", "#8B5CF6", "#F5A623", "#10B981", "#E11D48", "#0EA5E9"];

function randomId() {
  return `guest-${Math.random().toString(36).slice(2, 10)}`;
}

function randomNickname() {
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `학습자-${num}`;
}

let cached: UserProfile | null = null;

export function getCurrentUser(): UserProfile {
  if (cached) return cached;
  if (typeof window === "undefined") {
    // 서버 사이드에서는 임시값만 반환하고, 클라이언트에서 실제 값으로 교체된다.
    return { id: "guest", nickname: "학습자", avatarColor: AVATAR_COLORS[0], createdAt: 0 };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw) {
    cached = JSON.parse(raw) as UserProfile;
    return cached;
  }

  const profile: UserProfile = {
    id: randomId(),
    nickname: randomNickname(),
    avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    createdAt: Date.now(),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  cached = profile;
  return profile;
}
