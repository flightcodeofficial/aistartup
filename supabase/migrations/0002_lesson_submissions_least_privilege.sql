-- ────────────────────────────────────────────────────────────────────────────
-- lesson_submissions 최소 권한 정리.
--
-- 배경: Studio 미리보기에서 "서버 진행상태 저장 실패(42501)" 콘솔 경고가 관찰됐다.
-- scripts/verify-supabase.mjs를 확장해 실제 학생 계정으로 재현한 결과(48/50 통과,
-- 나머지 2건은 무관한 leftover 테스트 데이터 문제) — 소유자 select/insert/update,
-- 다른 학생의 select/update 차단까지 기존 submissions_owner_all 정책에서 전부
-- 정상 동작함을 확인했다. 즉 정책 설계 자체는 이미 올바르며, 관찰된 403은 정책
-- 결함이 아니라 그 순간의 클라이언트 상태(동시에 터진 realtime 채널 크래시 등)에서
-- 비롯된 것으로 보인다.
--
-- 그럼에도 기존 submissions_owner_all은 "for all"이라 학생에게 DELETE 권한까지
-- 암묵적으로 열어준다. 앱 코드 어디에도 lesson_submissions.delete() 호출이
-- 없으므로(진행상태는 덮어쓸 뿐 지우지 않는다), 실제로 쓰는 select/insert/update
-- 세 가지로만 명시적으로 좁힌다 — 동작은 그대로 두고 불필요한 권한만 제거한다.
-- ────────────────────────────────────────────────────────────────────────────

drop policy if exists submissions_owner_all on public.lesson_submissions;

drop policy if exists submissions_owner_select on public.lesson_submissions;
create policy submissions_owner_select on public.lesson_submissions
  for select to authenticated
  using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

drop policy if exists submissions_owner_insert on public.lesson_submissions;
create policy submissions_owner_insert on public.lesson_submissions
  for insert to authenticated
  with check (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

drop policy if exists submissions_owner_update on public.lesson_submissions;
create policy submissions_owner_update on public.lesson_submissions
  for update to authenticated
  using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

-- submissions_staff_read(강사 읽기 전용)는 그대로 둔다 — 손대지 않는다.
