-- ============================================================================
-- 0003_resources.sql
--
-- 커뮤니티 "자료실"(/community/resources)을 로컬 IndexedDB 데모에서
-- Supabase Storage 기반 공유 자료실로 전환한다.
--
-- lesson_assets와 같은 모양(메타데이터는 테이블, 실물 파일은 private Storage
-- 버킷)이지만 별도 테이블/버킷을 쓴다 — 자료실 자료는 특정 Lesson에 종속되지
-- 않고(공개 여부가 Lesson published 상태를 따르지 않는다), 강사가 올리면
-- 로그인한 모든 학생이 항상 볼 수 있어야 하기 때문이다.
-- ============================================================================

create table if not exists public.resources (
  id               text primary key,
  title            text not null,
  description      text,
  file_name        text,
  mime_type        text,
  size             bigint,
  storage_path     text unique,
  link_url         text,
  uploaded_by_name text,
  created_by       uuid references auth.users(id) on delete set null,
  download_count   integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  -- 파일이든 링크든 최소 하나는 있어야 "자료"라고 부를 수 있다.
  constraint resources_has_content check (storage_path is not null or link_url is not null)
);

drop trigger if exists resources_set_updated_at on public.resources;
create trigger resources_set_updated_at
  before update on public.resources
  for each row execute function public.set_updated_at();

create index if not exists resources_recent_idx on public.resources (created_at desc);

alter table public.resources enable row level security;

-- 로그인한 사람(학생·강사 모두)은 목록을 볼 수 있다. 실제 파일 접근은 Storage
-- 정책이 별도로 통제한다.
drop policy if exists resources_select_all on public.resources;
create policy resources_select_all on public.resources
  for select to authenticated using (true);

-- 업로드·수정·삭제는 강사·관리자만.
drop policy if exists resources_staff_write on public.resources;
create policy resources_staff_write on public.resources
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- ============================================================================
-- Storage — resource-files 버킷
-- ============================================================================
--
-- private 버킷. 로그인한 사용자는 resources 테이블에 실제로 등록된 파일만
-- 읽을 수 있다(고아 경로 추측 방지). 쓰기는 강사만.

insert into storage.buckets (id, name, public)
values ('resource-files', 'resource-files', false)
on conflict (id) do nothing;

drop policy if exists resource_files_read on storage.objects;
create policy resource_files_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'resource-files'
    and (
      public.is_staff()
      or exists (
        select 1 from public.resources r
        where r.storage_path = storage.objects.name
      )
    )
  );

drop policy if exists resource_files_write on storage.objects;
create policy resource_files_write on storage.objects
  for insert to authenticated
  with check (bucket_id = 'resource-files' and public.is_staff());

drop policy if exists resource_files_update on storage.objects;
create policy resource_files_update on storage.objects
  for update to authenticated
  using (bucket_id = 'resource-files' and public.is_staff())
  with check (bucket_id = 'resource-files' and public.is_staff());

drop policy if exists resource_files_delete on storage.objects;
create policy resource_files_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'resource-files' and public.is_staff());
