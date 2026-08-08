import { getWorkspaceDb, WORKSPACE_STORES } from "@/lib/workspaceDb";
import { getProjectsDb, PROJECT_STORES } from "@/lib/projectsDb";
import { workspaceRepository } from "./index";
import type { ArtifactType, ProjectMetadata } from "./types";
import type { Project as LegacyProject, ProjectArtifacts } from "@/features/projects/types";

// features/projects(고정필드 12개) → features/workspace(Project + Artifact) 1회 마이그레이션.
//
// 안전 원칙:
// 1) 레거시 데이터는 절대 지우거나 수정하지 않는다 — 읽기만 한다. 실패해도 원본은 그대로 남는다.
// 2) migrationVersion을 meta 스토어에 기록해서 두 번 돌지 않는다.
// 3) 이미 workspace에 같은 id의 프로젝트가 있으면 덮어쓰지 않고 건너뛴다(conflict로 집계).
// 4) artifact는 (projectId + sourceBlockId)로 중복을 판단한다. 마이그레이션이 만든 artifact는
//    sourceBlockId를 "legacy:{field}"로 고정해서, 재실행해도 중복 생성되지 않는다.
// 5) 프로젝트 단위로 try/catch — 하나가 실패해도 나머지는 계속 진행하고 실패만 집계한다.
//    (실패한 프로젝트는 migrationVersion이 올라가도 재실행 함수로 다시 시도할 수 있다)

const MIGRATION_KEY = "legacy-projects-migration";
export const CURRENT_MIGRATION_VERSION = 1;

/** 레거시 12개 고정필드 → artifactType 매핑. 실제 코드의 필드명을 그대로 옮긴 것이다. */
export const LEGACY_FIELD_TO_ARTIFACT_TYPE: Record<keyof ProjectArtifacts, ArtifactType> = {
  icp: "icp",
  ecp: "ecp",
  persona: "persona",
  journey: "journey",
  valueProposition: "value-proposition",
  landingPage: "landing",
  marketing: "marketing",
  ir: "ir",
  pitch: "pitch",
  faq: "faq",
  businessModel: "business-model",
  automation: "automation",
};

const LEGACY_FIELD_LABELS: Record<keyof ProjectArtifacts, string> = {
  icp: "ICP",
  ecp: "ECP",
  persona: "페르소나",
  journey: "고객 여정",
  valueProposition: "가치제안",
  landingPage: "랜딩페이지",
  marketing: "마케팅",
  ir: "IR",
  pitch: "피치",
  faq: "FAQ",
  businessModel: "비즈니스 모델",
  automation: "자동화",
};

export interface MigrationReport {
  ran: boolean;
  version: number;
  projectsMigrated: number;
  artifactsCreated: number;
  skipped: number;
  conflicts: number;
  failures: { projectId: string; reason: string }[];
  notes: string[];
}

const EMPTY_REPORT: MigrationReport = {
  ran: false,
  version: CURRENT_MIGRATION_VERSION,
  projectsMigrated: 0,
  artifactsCreated: 0,
  skipped: 0,
  conflicts: 0,
  failures: [],
  notes: [],
};

async function readMigrationVersion(): Promise<number> {
  const dbPromise = getWorkspaceDb();
  if (!dbPromise) return CURRENT_MIGRATION_VERSION; // 서버 사이드에서는 실행하지 않음
  const db = await dbPromise;
  const value = await db.get(WORKSPACE_STORES.meta, MIGRATION_KEY);
  return typeof value === "number" ? value : 0;
}

async function writeMigrationVersion(version: number): Promise<void> {
  const dbPromise = getWorkspaceDb();
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.put(WORKSPACE_STORES.meta, version, MIGRATION_KEY);
}

async function readLegacyProjects(): Promise<LegacyProject[]> {
  const dbPromise = getProjectsDb();
  if (!dbPromise) return [];
  try {
    const db = await dbPromise;
    if (!db.objectStoreNames.contains(PROJECT_STORES.projects)) return [];
    return (await db.getAll(PROJECT_STORES.projects)) as LegacyProject[];
  } catch {
    return [];
  }
}

/** 마이그레이션이 만든 artifact인지 식별하는 고정 키. 재실행 시 중복 방지에 쓴다. */
function legacyBlockId(field: keyof ProjectArtifacts): string {
  return `legacy:${field}`;
}

async function migrateOneProject(
  legacy: LegacyProject,
  report: MigrationReport
): Promise<void> {
  // 이미 같은 id로 옮겨진 프로젝트가 있으면 절대 덮어쓰지 않는다.
  const existingProject = await workspaceRepository.getProject(legacy.id);

  if (!existingProject) {
    const metadata: ProjectMetadata = {
      ownerNickname: legacy.ownerNickname,
      isPrimary: legacy.isPrimary,
      visibility: legacy.visibility,
      shareMode: legacy.shareMode,
      publicFieldKeys: legacy.publicFieldKeys,
      likeCount: legacy.likeCount,
      commentCount: legacy.commentCount,
      feedbackCount: legacy.feedbackCount,
      lastAiUseAt: legacy.lastAiUseAt,
      legacyVersions: legacy.versions?.map((v) => ({
        versionNumber: v.versionNumber,
        note: v.note,
        createdAt: v.createdAt,
      })),
      migratedFrom: "features/projects",
    };

    await workspaceRepository.createProject({
      id: legacy.id, // 레거시 id 유지 → 기존 deep link가 그대로 살아있다
      title: legacy.title,
      description: legacy.summary,
      metadata,
      createdAt: legacy.createdAt,
      updatedAt: legacy.updatedAt,
    });
    report.projectsMigrated += 1;
  } else {
    report.conflicts += 1;
    report.notes.push(`${legacy.title}: 이미 workspace에 존재해 프로젝트 생성은 건너뜀`);
  }

  // 12개 고정필드 → artifact. 빈 필드는 만들지 않는다.
  const existingArtifacts = await workspaceRepository.listArtifacts(legacy.id);
  const existingBlockIds = new Set(existingArtifacts.map((a) => a.sourceBlockId).filter(Boolean));

  for (const field of Object.keys(LEGACY_FIELD_TO_ARTIFACT_TYPE) as (keyof ProjectArtifacts)[]) {
    const content = legacy.draftArtifacts?.[field]?.trim();
    if (!content) {
      report.skipped += 1;
      continue;
    }
    if (existingBlockIds.has(legacyBlockId(field))) {
      report.skipped += 1; // 이미 옮긴 artifact — 재실행해도 중복 생성 안 함
      continue;
    }
    await workspaceRepository.saveArtifact({
      projectId: legacy.id,
      artifactType: LEGACY_FIELD_TO_ARTIFACT_TYPE[field],
      title: LEGACY_FIELD_LABELS[field],
      content,
      sourceBlockId: legacyBlockId(field),
    });
    report.artifactsCreated += 1;
  }
}

/**
 * 앱 시작 시 호출. 중복 생성이 불가능하도록 설계돼 있어(idempotent) 매번 안전하게 재실행된다.
 * 이미 옮긴 프로젝트/필드는 skipped 또는 conflicts로만 집계되고 데이터는 건드리지 않는다.
 */
export async function runLegacyProjectMigration(): Promise<MigrationReport> {
  const report: MigrationReport = { ...EMPTY_REPORT, failures: [], notes: [] };

  if (typeof window === "undefined") return report;

  // 버전 플래그로 "한 번만 실행"하지 않는다.
  // 레거시 저장소는 통합 이후에도 (구버전 탭, 아직 전환 안 된 경로 등에서) 데이터가
  // 더 생길 수 있어서, 한 번 완료 처리해버리면 그 뒤에 생긴 데이터가 영영 안 옮겨진다.
  // 이 마이그레이션은 프로젝트 id와 sourceBlockId("legacy:{field}")로 중복을 막기 때문에
  // 매번 다시 스캔해도 안전하고(idempotent), 옮길 게 없으면 사실상 공짜다.
  const legacyProjects = await readLegacyProjects();
  if (legacyProjects.length === 0) {
    await writeMigrationVersion(CURRENT_MIGRATION_VERSION);
    report.notes.push("옮길 레거시 프로젝트가 없음");
    return report;
  }

  report.ran = true;
  for (const legacy of legacyProjects) {
    try {
      await migrateOneProject(legacy, report);
    } catch (error) {
      // 한 프로젝트가 실패해도 나머지는 계속 진행한다. 레거시 원본은 건드리지 않았으므로 안전.
      report.failures.push({
        projectId: legacy.id,
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // 실패가 있으면 버전을 올리지 않는다 → 다음 실행 때 자동으로 다시 시도한다.
  if (report.failures.length === 0) {
    await writeMigrationVersion(CURRENT_MIGRATION_VERSION);
  } else {
    report.notes.push("실패한 프로젝트가 있어 버전을 올리지 않음 — 다음 실행 시 재시도");
  }

  return report;
}

export async function getMigrationStatus(): Promise<{ version: number; done: boolean }> {
  const version = await readMigrationVersion();
  return { version, done: version >= CURRENT_MIGRATION_VERSION };
}
