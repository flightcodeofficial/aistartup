-- ============================================================================
-- AI 창업 스쿨 — 운영 스키마 (STEP24)
--
-- 실행 방법: Supabase Dashboard → SQL Editor → 이 파일 전체 붙여넣기 → Run
-- 여러 번 실행해도 안전하도록 전부 IF NOT EXISTS / DROP-CREATE 로 작성했다.
--
-- 설계 원칙
--  1) 앱의 canonical 타입(src/features/**/types.ts)을 그대로 옮긴다. 새 개념을 만들지 않는다.
--  2) 브라우저는 anon 키만 쓰고, 권한은 전부 RLS가 통제한다.
--  3) role은 사용자가 고르는 값이 아니라 서버의 profiles.role 값이다.
--  4) 파일 실물은 Storage에 두고 DB에는 메타데이터만 둔다.
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 0. 공통 유틸
-- ────────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- updated_at 자동 갱신
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- 1. profiles — auth.users 1:1 확장. role의 유일한 출처.
-- ────────────────────────────────────────────────────────────────────────────

do $$ begin
  create type public.user_role as enum ('student', 'instructor', 'admin');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  display_name text,
  role         public.user_role not null default 'student',

  -- 온보딩에서 받는 기본정보. 수업 진행·결과물 관리·문의(AS) 응대에 쓴다.
  full_name    text,
  -- 국제번호로 확장할 수 있게 문자열로 둔다(자릿수 제약을 DB에 박지 않는다).
  phone        text,
  region       text,

  -- 광고성 정보 수신. 채널별로 나눠 저장해서 나중에 일부만 끌 수 있게 한다.
  -- null = 아직 응답하지 않음(온보딩 미완료). 응답하면 3개 키가 모두 채워진다.
  marketing_consent_channels jsonb,

  -- 소속 기수. enrollment 테이블 없이 느슨하게만 연결한다.
  cohort_id    uuid,

  profile_completed    boolean not null default false,
  profile_completed_at timestamptz,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 이미 만들어진 DB에도 컬럼이 붙도록(재실행 안전)
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists region text;
alter table public.profiles add column if not exists marketing_consent_channels jsonb;
alter table public.profiles add column if not exists cohort_id uuid;
alter table public.profiles add column if not exists profile_completed boolean not null default false;
alter table public.profiles add column if not exists profile_completed_at timestamptz;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 가입 시 프로필 자동 생성. role은 항상 student로 시작한다 —
-- 사용자가 가입 폼에서 강사/관리자를 고를 수 없어야 하기 때문이다.
-- 승격은 관리자가 DB에서 직접 한다(맨 아래 안내 참고).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, ''), '@', 1)),
    'student'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 이 SQL을 돌리기 전에 이미 가입한 계정이 있으면 트리거가 지나갔으므로 프로필이 없다.
-- 여기서 한 번 채워준다(이미 있으면 건너뛴다).
insert into public.profiles (id, email, display_name, role)
select u.id,
       u.email,
       coalesce(u.raw_user_meta_data ->> 'display_name', split_part(coalesce(u.email, ''), '@', 1)),
       'student'
from auth.users u
on conflict (id) do nothing;

-- role과 email은 브라우저에서 온 요청으로는 못 바꾼다.
--
-- RLS의 with check로도 막을 수 있지만, 트리거로 두면 "왜 실패했는지"가 분명해지고
-- 정책을 나중에 손대다가 구멍이 생겨도 여기서 한 번 더 걸린다.
--
-- security invoker 인 것이 중요하다.
--   security definer 로 두면 함수 안의 current_user 가 "호출자"가 아니라 "함수 소유자
--   (postgres)"로 나온다. 그러면 아래 관리자 판별이 항상 참이 되어 보호가 통째로 무력해진다.
--   invoker 로 둬야 PostgREST가 SET ROLE 로 바꿔놓은 실제 역할(authenticated/anon/
--   service_role)이 그대로 보인다.
--
-- 허용 목록 방식(기본은 차단)을 쓴다. 나중에 Supabase가 새 클라이언트 역할을 추가해도
-- 자동으로 열리지 않는다.
create or replace function public.protect_profile_identity()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  caller text := current_user;
begin
  -- DB 관리 컨텍스트: SQL Editor(postgres), 서버측 service_role, Supabase 내부 관리 역할.
  -- 이 경로는 브라우저에서 절대 도달할 수 없다(anon 키로는 이 역할이 될 수 없다).
  if caller in ('postgres', 'supabase_admin', 'service_role', 'supabase_auth_admin') then
    return new;
  end if;

  -- 앱 관리자(profiles.role='admin')가 화면에서 하는 운영 작업.
  if public.is_admin() then
    return new;
  end if;

  -- 여기서부터는 authenticated / anon — 즉 일반 사용자.
  if new.role is distinct from old.role then
    raise exception 'role은 사용자가 변경할 수 없습니다.';
  end if;
  -- 이메일은 로그인 계정(auth.users)에서 따라온다. 프로필에서 바꾸지 않는다.
  if new.email is distinct from old.email then
    raise exception 'email은 프로필에서 변경할 수 없습니다.';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_identity on public.profiles;
create trigger profiles_protect_identity
  before update on public.profiles
  for each row execute function public.protect_profile_identity();

-- 정책에서 재귀 없이 role을 읽기 위한 헬퍼.
-- (policy 안에서 profiles를 select하면 profiles 정책이 다시 평가되어 무한 재귀가 난다.
--  security definer 함수로 감싸 그 고리를 끊는다.)
create or replace function public.current_role_name()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role::text from public.profiles where id = auth.uid()), 'student');
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role_name() in ('instructor', 'admin');
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role_name() = 'admin';
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. courses
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists public.courses (
  id          text primary key,
  title       text not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists courses_set_updated_at on public.courses;
create trigger courses_set_updated_at
  before update on public.courses
  for each row execute function public.set_updated_at();

insert into public.courses (id, title, description)
values ('default-course', 'AI 창업 스쿨', '생성형 AI 기반 창업 실무 및 자동화 과정')
on conflict (id) do nothing;

-- ────────────────────────────────────────────────────────────────────────────
-- 2-1. cohorts — 기수(예: 2026 광주 AI창업 1기)
--      지금은 profiles.cohort_id로만 느슨하게 연결한다. 나중에 enrollment 테이블을
--      끼워 넣어도 이 테이블은 그대로 쓸 수 있다.
-- ────────────────────────────────────────────────────────────────────────────

do $$ begin
  create type public.cohort_status as enum ('upcoming', 'active', 'closed');
exception when duplicate_object then null;
end $$;

create table if not exists public.cohorts (
  id         uuid primary key default gen_random_uuid(),
  course_id  text not null references public.courses(id) on delete restrict,
  name       text not null,
  starts_at  date,
  ends_at    date,
  status     public.cohort_status not null default 'upcoming',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists cohorts_set_updated_at on public.cohorts;
create trigger cohorts_set_updated_at
  before update on public.cohorts
  for each row execute function public.set_updated_at();

create index if not exists cohorts_course_idx on public.cohorts (course_id, status);

-- profiles.cohort_id 외래키는 cohorts가 만들어진 뒤에 건다.
do $$ begin
  alter table public.profiles
    add constraint profiles_cohort_fk
    foreign key (cohort_id) references public.cohorts(id) on delete set null;
exception when duplicate_object then null;
end $$;

-- ────────────────────────────────────────────────────────────────────────────
-- 2-2. consent_logs — 동의/철회 이력. "현재 상태"가 아니라 "언제 무엇을 바꿨는가".
--      한 번 쌓인 로그는 고치거나 지우지 않는다(정책으로 막는다).
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists public.consent_logs (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  -- 지금은 'marketing' 하나. 운영 안내(서비스 필수 메시지)는 동의 대상이 아니라 여기 없다.
  consent_type   text not null,
  channel        text not null check (channel in ('email', 'sms', 'phone')),
  consented      boolean not null,
  policy_version text not null default 'v1',
  created_at     timestamptz not null default now()
);

create index if not exists consent_logs_user_idx
  on public.consent_logs (user_id, created_at desc);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. lessons — Block 기반 Lesson. content에 LessonContent JSON 전체를 담는다.
--    id는 앱이 만드는 문자열 id를 그대로 쓴다(예: w2-d1-l1-customer-analysis).
-- ────────────────────────────────────────────────────────────────────────────

do $$ begin
  create type public.lesson_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null;
end $$;

create table if not exists public.lessons (
  id               text primary key,
  course_id        text not null references public.courses(id) on delete restrict,
  week             integer not null,
  day              integer not null,
  lesson           integer not null,
  title            text not null,
  description      text,
  duration_minutes integer,
  content          jsonb not null,
  status           public.lesson_status not null default 'draft',
  version          integer not null default 1,
  created_by       uuid references auth.users(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  published_at     timestamptz
);

drop trigger if exists lessons_set_updated_at on public.lessons;
create trigger lessons_set_updated_at
  before update on public.lessons
  for each row execute function public.set_updated_at();

-- 학생 resolver가 매번 때리는 조회: week/day/lesson + published
create index if not exists lessons_coord_idx
  on public.lessons (course_id, week, day, lesson);
create index if not exists lessons_published_coord_idx
  on public.lessons (week, day, lesson)
  where status = 'published';

-- 같은 좌표에 published Lesson이 둘이면 학생 화면이 어느 쪽을 볼지 알 수 없다.
create unique index if not exists lessons_one_published_per_coord
  on public.lessons (course_id, week, day, lesson)
  where status = 'published';

-- ────────────────────────────────────────────────────────────────────────────
-- 4. projects — WorkspaceProject 매핑
-- ────────────────────────────────────────────────────────────────────────────

do $$ begin
  create type public.project_status as enum ('active', 'archived');
exception when duplicate_object then null;
end $$;

create table if not exists public.projects (
  id          text primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  description text,
  course_id   text references public.courses(id) on delete set null,
  status      public.project_status not null default 'active',
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create index if not exists projects_user_idx on public.projects (user_id, updated_at desc);

-- ────────────────────────────────────────────────────────────────────────────
-- 5. project_artifacts — ProjectArtifact 매핑
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists public.project_artifacts (
  id              text primary key,
  project_id      text not null references public.projects(id) on delete cascade,
  lesson_id       text,
  source_block_id text,
  artifact_type   text not null,
  title           text not null,
  content         text not null default '',
  version         integer not null default 1,
  fields          jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists project_artifacts_set_updated_at on public.project_artifacts;
create trigger project_artifacts_set_updated_at
  before update on public.project_artifacts
  for each row execute function public.set_updated_at();

create index if not exists project_artifacts_project_idx
  on public.project_artifacts (project_id, updated_at desc);
create index if not exists project_artifacts_type_idx
  on public.project_artifacts (artifact_type);

-- 같은 (project, block)에서 저장하면 새로 만들지 않고 version을 올려 갱신한다.
-- 앱 로직과 DB 제약을 일치시켜 중복 저장을 막는다.
create unique index if not exists project_artifacts_project_block_uniq
  on public.project_artifacts (project_id, source_block_id)
  where source_block_id is not null;

-- ────────────────────────────────────────────────────────────────────────────
-- 6. lesson_submissions — LessonSubmission 매핑.
--    quiz/form/reflection/실습완료 상태를 data JSON 하나에 담는다(블록별 테이블 금지).
-- ────────────────────────────────────────────────────────────────────────────

do $$ begin
  create type public.submission_status as enum ('in-progress', 'submitted');
exception when duplicate_object then null;
end $$;

create table if not exists public.lesson_submissions (
  id           text primary key,
  project_id   text not null references public.projects(id) on delete cascade,
  lesson_id    text not null,
  page_id      text,
  block_id     text,
  status       public.submission_status not null default 'in-progress',
  submitted_at timestamptz,
  data         jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

drop trigger if exists lesson_submissions_set_updated_at on public.lesson_submissions;
create trigger lesson_submissions_set_updated_at
  before update on public.lesson_submissions
  for each row execute function public.set_updated_at();

create index if not exists lesson_submissions_project_idx
  on public.lesson_submissions (project_id, updated_at desc);

-- 한 프로젝트의 한 Lesson 진행상태는 하나로 유지한다(다른 PC에서 이어하기의 기준).
create unique index if not exists lesson_submissions_project_lesson_uniq
  on public.lesson_submissions (project_id, lesson_id)
  where block_id is null and page_id is null;

-- ────────────────────────────────────────────────────────────────────────────
-- 7. lesson_assets — Storage object의 메타데이터만. 파일 실물은 Storage에 있다.
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists public.lesson_assets (
  id           text primary key,
  lesson_id    text,
  file_name    text not null,
  mime_type    text not null,
  size         bigint not null default 0,
  storage_path text not null unique,
  created_by   uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

drop trigger if exists lesson_assets_set_updated_at on public.lesson_assets;
create trigger lesson_assets_set_updated_at
  before update on public.lesson_assets
  for each row execute function public.set_updated_at();

create index if not exists lesson_assets_recent_idx on public.lesson_assets (created_at desc);

-- ============================================================================
-- RLS
-- ============================================================================

alter table public.profiles           enable row level security;
alter table public.cohorts            enable row level security;
alter table public.consent_logs       enable row level security;
alter table public.courses            enable row level security;
alter table public.lessons            enable row level security;
alter table public.projects           enable row level security;
alter table public.project_artifacts  enable row level security;
alter table public.lesson_submissions enable row level security;
alter table public.lesson_assets      enable row level security;

-- ── profiles ────────────────────────────────────────────────────────────────
drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_staff());

-- 본인 프로필 수정. role/email 변경은 위의 트리거가 막는다.
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── cohorts ─────────────────────────────────────────────────────────────────
-- 학생은 기수를 읽을 수 있어야 자기 소속을 볼 수 있다. 관리는 staff만.
drop policy if exists cohorts_select_all on public.cohorts;
create policy cohorts_select_all on public.cohorts
  for select to authenticated using (true);

drop policy if exists cohorts_staff_write on public.cohorts;
create policy cohorts_staff_write on public.cohorts
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- ── consent_logs ────────────────────────────────────────────────────────────
-- 본인 이력만 보고, 본인 이력만 남길 수 있다.
-- UPDATE/DELETE 정책을 아예 만들지 않아서 일반 사용자는 과거 로그를 고치거나 지울 수 없다
-- (RLS가 켜진 테이블은 해당 명령의 정책이 없으면 전부 거부된다).
drop policy if exists consent_logs_select_own on public.consent_logs;
create policy consent_logs_select_own on public.consent_logs
  for select to authenticated
  using (user_id = auth.uid() or public.is_staff());

drop policy if exists consent_logs_insert_own on public.consent_logs;
create policy consent_logs_insert_own on public.consent_logs
  for insert to authenticated
  with check (user_id = auth.uid());

-- ── courses ─────────────────────────────────────────────────────────────────
drop policy if exists courses_select_all on public.courses;
create policy courses_select_all on public.courses
  for select to authenticated using (true);

drop policy if exists courses_staff_write on public.courses;
create policy courses_staff_write on public.courses
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- ── lessons ─────────────────────────────────────────────────────────────────
-- 학생은 published만 본다. draft/archived는 조회 자체가 안 된다.
drop policy if exists lessons_select_published on public.lessons;
create policy lessons_select_published on public.lessons
  for select to authenticated
  using (status = 'published' or public.is_staff());

drop policy if exists lessons_staff_insert on public.lessons;
create policy lessons_staff_insert on public.lessons
  for insert to authenticated
  with check (public.is_staff());

drop policy if exists lessons_staff_update on public.lessons;
create policy lessons_staff_update on public.lessons
  for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists lessons_admin_delete on public.lessons;
create policy lessons_admin_delete on public.lessons
  for delete to authenticated
  using (public.is_admin());

-- ── projects ────────────────────────────────────────────────────────────────
drop policy if exists projects_owner_all on public.projects;
create policy projects_owner_all on public.projects
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 강사는 학생 결과를 읽을 수 있다(CRM). 쓰기는 못 한다.
drop policy if exists projects_staff_read on public.projects;
create policy projects_staff_read on public.projects
  for select to authenticated
  using (public.is_staff());

-- ── project_artifacts ───────────────────────────────────────────────────────
drop policy if exists artifacts_owner_all on public.project_artifacts;
create policy artifacts_owner_all on public.project_artifacts
  for all to authenticated
  using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

drop policy if exists artifacts_staff_read on public.project_artifacts;
create policy artifacts_staff_read on public.project_artifacts
  for select to authenticated
  using (public.is_staff());

-- ── lesson_submissions ──────────────────────────────────────────────────────
drop policy if exists submissions_owner_all on public.lesson_submissions;
create policy submissions_owner_all on public.lesson_submissions
  for all to authenticated
  using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

drop policy if exists submissions_staff_read on public.lesson_submissions;
create policy submissions_staff_read on public.lesson_submissions
  for select to authenticated
  using (public.is_staff());

-- ── lesson_assets ───────────────────────────────────────────────────────────
-- 메타데이터는 로그인 사용자면 읽을 수 있다(어느 Lesson에 붙었는지 판단용).
-- 실제 파일 접근 통제는 아래 Storage 정책이 한다.
drop policy if exists assets_select_all on public.lesson_assets;
create policy assets_select_all on public.lesson_assets
  for select to authenticated using (true);

drop policy if exists assets_staff_write on public.lesson_assets;
create policy assets_staff_write on public.lesson_assets
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- ============================================================================
-- Storage — lesson-assets 버킷
-- ============================================================================
--
-- private 버킷으로 만든다. 학생은 published Lesson에 쓰인 이미지를 봐야 하지만,
-- draft Lesson의 이미지가 URL만 알면 보이는 상태는 피한다.
--
-- 읽기 정책: "이 파일을 참조하는 lesson_assets 행이 있고, 그 asset이 붙은 Lesson이
--            published이거나, asset이 아직 어느 Lesson에도 안 붙었으면 staff만"
-- 앱은 createSignedUrl로 짧은 수명의 URL을 받아 <img>에 넣는다.

insert into storage.buckets (id, name, public)
values ('lesson-assets', 'lesson-assets', false)
on conflict (id) do nothing;

drop policy if exists lesson_assets_read on storage.objects;
create policy lesson_assets_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'lesson-assets'
    and (
      public.is_staff()
      or exists (
        select 1
        from public.lesson_assets a
        join public.lessons l on l.id = a.lesson_id
        where a.storage_path = storage.objects.name
          and l.status = 'published'
      )
    )
  );

drop policy if exists lesson_assets_write on storage.objects;
create policy lesson_assets_write on storage.objects
  for insert to authenticated
  with check (bucket_id = 'lesson-assets' and public.is_staff());

drop policy if exists lesson_assets_update on storage.objects;
create policy lesson_assets_update on storage.objects
  for update to authenticated
  using (bucket_id = 'lesson-assets' and public.is_staff())
  with check (bucket_id = 'lesson-assets' and public.is_staff());

drop policy if exists lesson_assets_delete on storage.objects;
create policy lesson_assets_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'lesson-assets' and public.is_staff());

-- ============================================================================
-- 운영 메모
-- ============================================================================
--
-- 강사/관리자 승격은 사용자가 못 하고, 여기서 직접 한다:
--
--   update public.profiles set role = 'admin'
--   where email = '나의이메일@example.com';
--
-- 첫 관리자를 만들 때는 먼저 앱에서 한 번 로그인해 auth.users 행을 만든 뒤
-- 위 SQL을 실행한다.
