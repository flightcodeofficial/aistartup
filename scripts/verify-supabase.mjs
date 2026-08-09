// STEP24 검증 하네스.
//
// 실행: node scripts/verify-supabase.mjs
// .env.local의 URL/anon 키만 쓴다(service_role 없이도 전부 검증 가능해야 한다).
//
// 검증 항목은 STEP24 16번 A~G와 19번 완료기준을 그대로 따라간다.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);

const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const stamp = Date.now();
const ACCOUNTS = {
  instructor: { email: "verify-instructor@mailinator.com", password: "Verify!12345" },
  studentB: { email: `verify-student-b-${stamp}@mailinator.com`, password: "Verify!12345" },
  studentD: { email: `verify-student-d-${stamp}@mailinator.com`, password: "Verify!12345" },
};

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

function fresh() {
  // 계정마다 독립 클라이언트(세션 격리)
  return createClient(URL_, KEY, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function signUpOrIn(client, { email, password }) {
  const up = await client.auth.signUp({ email, password });
  if (up.data.session) return up.data.session;
  const inn = await client.auth.signInWithPassword({ email, password });
  if (inn.error) throw new Error(`${email}: ${up.error?.message ?? inn.error.message}`);
  return inn.data.session;
}

// ── 0. 스키마 존재 ──────────────────────────────────────────────────────────
const probe = fresh();
for (const t of [
  "profiles",
  "cohorts",
  "consent_logs",
  "courses",
  "lessons",
  "projects",
  "project_artifacts",
  "lesson_submissions",
  "lesson_assets",
]) {
  const { error } = await probe.from(t).select("*").limit(1);
  const missing = error && /schema cache|does not exist/i.test(error.message);
  check(`schema: ${t}`, !missing, error ? error.message : "");
}
if (results.some((r) => !r.ok)) {
  console.log("\n스키마가 없어 나머지 검증을 건너뜁니다. supabase/migrations/0001_init.sql 을 먼저 실행하세요.");
  process.exit(1);
}

// ── A. Auth ────────────────────────────────────────────────────────────────
const cInstructor = fresh();
const cStudentB = fresh();
const cStudentD = fresh();

let sessions;
try {
  sessions = {
    instructor: await signUpOrIn(cInstructor, ACCOUNTS.instructor),
    studentB: await signUpOrIn(cStudentB, ACCOUNTS.studentB),
    studentD: await signUpOrIn(cStudentD, ACCOUNTS.studentD),
  };
  check("A. 계정 3개 로그인", true);
} catch (e) {
  check("A. 계정 3개 로그인", false, e.message);
  console.log("\n이메일 확인(Confirm email)이 켜져 있으면 자동 검증이 막힙니다.");
  console.log("Authentication → Providers → Email → 'Confirm email'을 잠시 끄고 다시 실행하세요.");
  process.exit(1);
}

// profiles 트리거 + 기본 role
const { data: profB } = await cStudentB.from("profiles").select("id,role,email,profile_completed").eq("id", sessions.studentB.user.id).maybeSingle();
check("A. 가입 시 profile 자동 생성", Boolean(profB), profB ? `role=${profB.role}` : "없음");
check("A. 기본 role = student", profB?.role === "student", `실제 ${profB?.role}`);

// 자가 승격 차단
const { error: escalate } = await cStudentB
  .from("profiles")
  .update({ role: "admin" })
  .eq("id", sessions.studentB.user.id);
const { data: afterEscalate } = await cStudentB
  .from("profiles")
  .select("role")
  .eq("id", sessions.studentB.user.id)
  .maybeSingle();
check("G. 학생이 스스로 admin 승격 불가", afterEscalate?.role === "student", escalate ? escalate.message : `role=${afterEscalate?.role}`);

// 세션 복원
const { data: restored } = await cStudentB.auth.getSession();
check("A. 세션 유지", Boolean(restored.session));

// ── STEP24-A. 프로필 온보딩 ────────────────────────────────────────────────
check("A2. 가입 직후 profile_completed=false", profB?.profile_completed === false, `실제 ${profB?.profile_completed}`);

// 학생A: 광고 "동의" 로 온보딩 완료
const consentTrue = { email: true, sms: true, phone: true };
const { error: setupErrA } = await cStudentB
  .from("profiles")
  .update({
    full_name: "학생비",
    phone: "010-1234-5678",
    region: "광주",
    marketing_consent_channels: consentTrue,
    profile_completed: true,
    profile_completed_at: new Date().toISOString(),
  })
  .eq("id", sessions.studentB.user.id);
check("A2. 온보딩 저장(동의)", !setupErrA, setupErrA?.message ?? "");

const { data: afterSetup } = await cStudentB
  .from("profiles")
  .select("full_name,phone,region,marketing_consent_channels,profile_completed")
  .eq("id", sessions.studentB.user.id)
  .maybeSingle();
check("A2. profile_completed=true", afterSetup?.profile_completed === true);
check(
  "A2. 광고 3채널 모두 true",
  afterSetup?.marketing_consent_channels?.email === true &&
    afterSetup?.marketing_consent_channels?.sms === true &&
    afterSetup?.marketing_consent_channels?.phone === true
);

// consent log 기록
const logRows = ["email", "sms", "phone"].map((channel) => ({
  user_id: sessions.studentB.user.id,
  consent_type: "marketing",
  channel,
  consented: true,
  policy_version: "v1",
}));
const { error: logErr } = await cStudentB.from("consent_logs").insert(logRows);
check("A2. consent log 생성(동의)", !logErr, logErr?.message ?? "");

// 학생D: 광고 "비동의"
const consentFalse = { email: false, sms: false, phone: false };
await cStudentD
  .from("profiles")
  .update({
    full_name: "학생디",
    phone: "010-9999-8888",
    marketing_consent_channels: consentFalse,
    profile_completed: true,
    profile_completed_at: new Date().toISOString(),
  })
  .eq("id", sessions.studentD.user.id);
const { data: dProfile } = await cStudentD
  .from("profiles")
  .select("marketing_consent_channels,profile_completed")
  .eq("id", sessions.studentD.user.id)
  .maybeSingle();
check(
  "A2. 비동의 시 3채널 모두 false",
  dProfile?.marketing_consent_channels?.email === false &&
    dProfile?.marketing_consent_channels?.sms === false &&
    dProfile?.marketing_consent_channels?.phone === false
);
check("A2. 비동의여도 학습 가능(profile_completed=true)", dProfile?.profile_completed === true);
await cStudentD.from("consent_logs").insert(
  ["email", "sms", "phone"].map((channel) => ({
    user_id: sessions.studentD.user.id,
    consent_type: "marketing",
    channel,
    consented: false,
    policy_version: "v1",
  }))
);

// 동의 → 비동의 변경: 이전 로그가 보존되고 새 이력이 쌓인다
await cStudentB.from("profiles").update({ marketing_consent_channels: consentFalse }).eq("id", sessions.studentB.user.id);
await cStudentB.from("consent_logs").insert(
  ["email", "sms", "phone"].map((channel) => ({
    user_id: sessions.studentB.user.id,
    consent_type: "marketing",
    channel,
    consented: false,
    policy_version: "v1",
  }))
);
const { data: bLogs } = await cStudentB
  .from("consent_logs")
  .select("channel,consented,created_at")
  .order("created_at", { ascending: true });
check("A2. 동의 변경 시 새 이력 추가", (bLogs?.length ?? 0) >= 6, `${bLogs?.length}건`);
check(
  "A2. 이전 동의 이력 보존",
  (bLogs ?? []).some((l) => l.consented === true) && (bLogs ?? []).some((l) => l.consented === false)
);

// 과거 로그는 고치거나 지울 수 없다
const { error: logUpdErr } = await cStudentB.from("consent_logs").update({ consented: true }).eq("consented", false);
const { error: logDelErr } = await cStudentB.from("consent_logs").delete().eq("consented", false);
const { data: logsAfter } = await cStudentB.from("consent_logs").select("id");
check(
  "A2. 과거 consent log UPDATE/DELETE 불가",
  (logsAfter?.length ?? 0) === (bLogs?.length ?? 0),
  `${logUpdErr?.message ?? ""} ${logDelErr?.message ?? ""}`.trim() || `${logsAfter?.length}건 유지`
);

// 타 사용자 프로필 접근
const { data: otherProfile } = await cStudentD
  .from("profiles")
  .select("id,full_name")
  .eq("id", sessions.studentB.user.id);
check("G. 학생D가 학생B 프로필 조회 불가", (otherProfile?.length ?? 0) === 0);

await cStudentD.from("profiles").update({ full_name: "탈취" }).eq("id", sessions.studentB.user.id);
const { data: bNameCheck } = await cStudentB
  .from("profiles")
  .select("full_name")
  .eq("id", sessions.studentB.user.id)
  .maybeSingle();
check("G. 학생D가 학생B 프로필 수정 불가", bNameCheck?.full_name === "학생비", `실제 ${bNameCheck?.full_name}`);

// 타 사용자 consent log 조회 불가
const { data: dSeesLogs } = await cStudentD.from("consent_logs").select("user_id");
check(
  "G. 학생D가 학생B 동의이력 조회 불가",
  !(dSeesLogs ?? []).some((l) => l.user_id === sessions.studentB.user.id)
);

// cohorts 읽기
const { error: cohortReadErr } = await cStudentB.from("cohorts").select("id,name").limit(1);
check("A2. 학생이 기수 조회 가능", !cohortReadErr, cohortReadErr?.message ?? "");
const { error: cohortWriteErr } = await cStudentB
  .from("cohorts")
  .insert({ course_id: "default-course", name: "무단 기수" });
check("G. 학생이 기수 생성 불가", Boolean(cohortWriteErr), cohortWriteErr?.message ?? "차단되지 않음");

// ── B/C. Lesson ────────────────────────────────────────────────────────────
// instructor를 강사로 승격해야 lesson을 쓸 수 있다. anon 키로는 못 하므로 안내만 한다.
const { data: profI } = await cInstructor.from("profiles").select("role").eq("id", sessions.instructor.user.id).maybeSingle();
const instructorIsStaff = profI?.role === "instructor" || profI?.role === "admin";

if (!instructorIsStaff) {
  console.log(`\n[안내] Lesson 쓰기 검증에는 강사 계정이 필요합니다. SQL Editor에서:`);
  console.log(`  update public.profiles set role='instructor' where email='${ACCOUNTS.instructor.email}';`);
  console.log(`그 뒤 이 스크립트를 다시 실행하면 B~D 항목까지 검증합니다.\n`);
}

const LESSON_ID = `verify-lesson-${stamp}`;
if (instructorIsStaff) {
  const draft = {
    id: LESSON_ID,
    course_id: "default-course",
    week: 99,
    day: 1,
    lesson: 1,
    title: "검증용 Lesson",
    content: { pages: [{ id: "p1", title: "p1", layout: "standard", blocks: [] }] },
    status: "draft",
    version: 1,
  };
  const { error: insErr } = await cInstructor.from("lessons").insert(draft);
  check("C. 강사가 draft 저장", !insErr, insErr?.message ?? "");

  // 학생은 draft를 볼 수 없어야 한다
  const { data: draftSeen } = await cStudentB.from("lessons").select("id").eq("id", LESSON_ID);
  check("G. 학생이 draft lesson 조회 불가", (draftSeen?.length ?? 0) === 0);

  // 게시
  const { error: pubErr } = await cInstructor
    .from("lessons")
    .update({ status: "published", version: 2, published_at: new Date().toISOString() })
    .eq("id", LESSON_ID);
  check("C. 게시 + version 증가", !pubErr, pubErr?.message ?? "");

  // 학생이 published를 본다 (다른 클라이언트 = 다른 브라우저 상황)
  const { data: pubSeen } = await cStudentB
    .from("lessons")
    .select("id,version,content")
    .eq("week", 99)
    .eq("day", 1)
    .eq("lesson", 1)
    .eq("status", "published");
  check("B. 다른 계정에서 published lesson 로드", (pubSeen?.length ?? 0) === 1, `version=${pubSeen?.[0]?.version}`);

  // 학생은 lesson을 수정할 수 없다
  const { error: stuWrite } = await cStudentB.from("lessons").update({ title: "해킹" }).eq("id", LESSON_ID);
  const { data: titleAfter } = await cInstructor.from("lessons").select("title").eq("id", LESSON_ID).maybeSingle();
  check("G. 학생이 lesson 수정 불가", titleAfter?.title === "검증용 Lesson", stuWrite?.message ?? "");
}

// ── E. Workspace + G. 격리 ─────────────────────────────────────────────────
const PROJECT_B = `verify-project-b-${stamp}`;
const { error: projErr } = await cStudentB.from("projects").insert({
  id: PROJECT_B,
  user_id: sessions.studentB.user.id,
  title: "학생B 프로젝트",
  status: "active",
  metadata: {},
});
check("E. 학생B 프로젝트 생성", !projErr, projErr?.message ?? "");

const ARTIFACT_B = `verify-artifact-b-${stamp}`;
const { error: artErr } = await cStudentB.from("project_artifacts").insert({
  id: ARTIFACT_B,
  project_id: PROJECT_B,
  artifact_type: "customer-analysis-foundation",
  title: "학생B 결과물",
  content: "비밀 내용",
  version: 1,
});
check("E. 학생B artifact 저장", !artErr, artErr?.message ?? "");

// 같은 계정 다른 클라이언트 = "다른 PC에서 같은 계정 로그인"
const cStudentB2 = fresh();
await signUpOrIn(cStudentB2, ACCOUNTS.studentB);
const { data: restoredProjects } = await cStudentB2.from("projects").select("id,title");
const { data: restoredArtifacts } = await cStudentB2.from("project_artifacts").select("id,content");
check(
  "E. 다른 브라우저에서 같은 계정 → 프로젝트 복원",
  restoredProjects?.some((p) => p.id === PROJECT_B) ?? false
);
check(
  "E. 다른 브라우저에서 같은 계정 → artifact 복원",
  restoredArtifacts?.some((a) => a.id === ARTIFACT_B) ?? false
);

// 다른 계정은 못 본다
const { data: dProjects } = await cStudentD.from("projects").select("id");
const { data: dArtifacts } = await cStudentD.from("project_artifacts").select("id");
check("G. 학생D가 학생B 프로젝트 조회 불가", !(dProjects ?? []).some((p) => p.id === PROJECT_B));
check("G. 학생D가 학생B artifact 조회 불가", !(dArtifacts ?? []).some((a) => a.id === ARTIFACT_B));

// 다른 계정은 못 고친다
const { error: dUpdate } = await cStudentD.from("projects").update({ title: "탈취" }).eq("id", PROJECT_B);
const { data: titleCheck } = await cStudentB.from("projects").select("title").eq("id", PROJECT_B).maybeSingle();
check("G. 학생D가 학생B 프로젝트 수정 불가", titleCheck?.title === "학생B 프로젝트", dUpdate?.message ?? "");

// 남의 프로젝트에 artifact를 심을 수 없다
const { error: dInsert } = await cStudentD.from("project_artifacts").insert({
  id: `verify-inject-${stamp}`,
  project_id: PROJECT_B,
  artifact_type: "custom",
  title: "주입",
  content: "x",
  version: 1,
});
check("G. 학생D가 학생B 프로젝트에 artifact 주입 불가", Boolean(dInsert), dInsert?.message ?? "차단되지 않음");

// ── F. Submission (진행상태 이어하기) ──────────────────────────────────────
const SUB_ID = `verify-sub-${stamp}`;
const payload = {
  quizAnswers: { "block-quiz": { q1: "c3" } },
  formValues: { "block-form": { f1: "학생B 답변" } },
  reflections: { "block-ref": "회고 내용" },
  completions: { "block-link": true },
  savedAt: Date.now(),
};
const { error: subErr } = await cStudentB.from("lesson_submissions").insert({
  id: SUB_ID,
  project_id: PROJECT_B,
  lesson_id: "w2-d1-l1-customer-analysis",
  status: "in-progress",
  data: payload,
});
check("F. 진행상태 저장", !subErr, subErr?.message ?? "");

const { data: subRestored } = await cStudentB2
  .from("lesson_submissions")
  .select("data")
  .eq("project_id", PROJECT_B)
  .eq("lesson_id", "w2-d1-l1-customer-analysis")
  .maybeSingle();
check(
  "F. 다른 브라우저에서 진행상태 이어하기",
  subRestored?.data?.formValues?.["block-form"]?.f1 === "학생B 답변" &&
    subRestored?.data?.completions?.["block-link"] === true
);

const { data: dSubs } = await cStudentD.from("lesson_submissions").select("id");
check("G. 학생D가 학생B 진행상태 조회 불가", !(dSubs ?? []).some((s) => s.id === SUB_ID));

// 본인은 이어서 UPDATE할 수 있어야 한다(진행 중 계속 저장).
const { error: subUpdErr } = await cStudentB
  .from("lesson_submissions")
  .update({ data: { ...payload, formValues: { "block-form": { f1: "학생B 수정된 답변" } } } })
  .eq("id", SUB_ID);
const { data: subAfterOwnUpdate } = await cStudentB
  .from("lesson_submissions")
  .select("data")
  .eq("id", SUB_ID)
  .maybeSingle();
check(
  "F. 본인 진행상태 UPDATE 가능",
  !subUpdErr && subAfterOwnUpdate?.data?.formValues?.["block-form"]?.f1 === "학생B 수정된 답변",
  subUpdErr?.message ?? ""
);

// 다른 학생은 이 행을 UPDATE할 수 없어야 한다.
const { error: subHackUpdErr } = await cStudentD
  .from("lesson_submissions")
  .update({ status: "submitted" })
  .eq("id", SUB_ID);
const { data: subAfterHackAttempt } = await cStudentB
  .from("lesson_submissions")
  .select("status")
  .eq("id", SUB_ID)
  .maybeSingle();
check(
  "G. 학생D가 학생B 진행상태 UPDATE 불가",
  subAfterHackAttempt?.status === "in-progress",
  subHackUpdErr?.message ?? `실제 status=${subAfterHackAttempt?.status}`
);

// ── D. Storage ─────────────────────────────────────────────────────────────
const png = Uint8Array.from(
  atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="),
  (c) => c.charCodeAt(0)
);
const assetPath = `lessons/shared/verify-${stamp}/pixel.png`;
if (instructorIsStaff) {
  const { error: upErr } = await cInstructor.storage
    .from("lesson-assets")
    .upload(assetPath, png, { contentType: "image/png" });
  check("D. 강사 이미지 업로드", !upErr, upErr?.message ?? "");

  const { error: stuUpErr } = await cStudentB.storage
    .from("lesson-assets")
    .upload(`lessons/shared/hack-${stamp}/x.png`, png, { contentType: "image/png" });
  check("G. 학생이 이미지 업로드 불가", Boolean(stuUpErr), stuUpErr?.message ?? "차단되지 않음");

  if (!upErr) {
    await cInstructor.from("lesson_assets").insert({
      id: `verify-asset-${stamp}`,
      lesson_id: LESSON_ID,
      file_name: "pixel.png",
      mime_type: "image/png",
      size: png.length,
      storage_path: assetPath,
    });
    const { data: signed, error: signErr } = await cStudentB.storage
      .from("lesson-assets")
      .createSignedUrl(assetPath, 60);
    check("D. 학생이 published lesson 이미지 접근", Boolean(signed?.signedUrl), signErr?.message ?? "");
  }
}

// ── 정리 ───────────────────────────────────────────────────────────────────
// consent_logs는 정책상 지울 수 없으므로 남는다(검증 계정이라 문제 없음).
await cStudentB.from("lesson_submissions").delete().eq("id", SUB_ID);
await cStudentB.from("project_artifacts").delete().eq("id", ARTIFACT_B);
await cStudentB.from("projects").delete().eq("id", PROJECT_B);
if (instructorIsStaff) {
  await cInstructor.from("lesson_assets").delete().eq("id", `verify-asset-${stamp}`);
  await cInstructor.storage.from("lesson-assets").remove([assetPath]);
  await cInstructor.from("lessons").delete().eq("id", LESSON_ID);
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} 통과`);
if (failed.length) {
  console.log("실패:");
  failed.forEach((f) => console.log(`  - ${f.name}: ${f.detail}`));
  process.exit(1);
}
