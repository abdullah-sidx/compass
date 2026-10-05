import seedJson from "../data/seed.json";
import type {
  Project,
  Parcel,
  Stage,
  Payment,
  AuditEvent,
  MonthlySnapshot,
  ParcelStatus,
  StatsResponse,
} from "./types";

interface SeedDataStore {
  projects: Project[];
  parcels: Parcel[];
  stagesByProject: Record<string, Stage[]>;
  payments: Payment[];
  monthlySnapshots: MonthlySnapshot[];
  auditEvents: AuditEvent[];
}

// In-memory data store initialized from seed
let store: SeedDataStore = {
  projects: (seedJson.projects as unknown) as Project[],
  parcels: (seedJson.parcels as unknown) as Parcel[],
  stagesByProject: (seedJson.stagesByProject as unknown) as Record<string, Stage[]>,
  payments: (seedJson.payments as unknown) as Payment[],
  monthlySnapshots: (seedJson.monthlySnapshots as unknown) as MonthlySnapshot[],
  auditEvents: (seedJson.auditEvents as unknown) as AuditEvent[],
};

export function getProjects(filters?: {
  state?: string;
  sector?: string;
  riskLevel?: string;
}): Project[] {
  let list = [...store.projects];
  if (filters?.state && filters.state.toLowerCase() !== "all") {
    list = list.filter(
      (p) => p.state.toLowerCase() === filters.state!.toLowerCase()
    );
  }
  if (filters?.sector) {
    list = list.filter(
      (p) => p.sector.toLowerCase() === filters.sector!.toLowerCase()
    );
  }
  if (filters?.riskLevel) {
    list = list.filter(
      (p) => p.riskLevel.toLowerCase() === filters.riskLevel!.toLowerCase()
    );
  }
  return list;
}

export function getProjectById(id: string): Project | undefined {
  return store.projects.find((p) => p.id === id);
}

export function getParcels(filters?: {
  state?: string;
  project?: string;
  status?: string;
}): Parcel[] {
  let list = [...store.parcels];
  if (filters?.state && filters.state.toLowerCase() !== "all") {
    list = list.filter(
      (p) => p.state.toLowerCase() === filters.state!.toLowerCase()
    );
  }
  if (filters?.project && filters.project.toLowerCase() !== "all") {
    list = list.filter(
      (p) => p.projectId.toLowerCase() === filters.project!.toLowerCase()
    );
  }
  if (filters?.status && filters.status.toLowerCase() !== "all") {
    list = list.filter(
      (p) => p.status.toLowerCase() === filters.status!.toLowerCase()
    );
  }
  return list;
}

export function getParcelByUlpin(ulpin: string): Parcel | undefined {
  return store.parcels.find(
    (p) => p.ulpin.toUpperCase() === ulpin.trim().toUpperCase()
  );
}

export function getProjectStages(projectId: string): Stage[] {
  return store.stagesByProject[projectId] || [];
}

export function getPayments(projectId?: string): Payment[] {
  if (projectId) {
    return store.payments.filter((pmt) => pmt.projectId === projectId);
  }
  return store.payments;
}

export function getAuditEvents(projectId?: string): AuditEvent[] {
  if (projectId) {
    return store.auditEvents.filter((e) => e.projectId === projectId);
  }
  return store.auditEvents;
}

export function getMonthlySnapshots(): MonthlySnapshot[] {
  return store.monthlySnapshots;
}

export function getAllStates(): string[] {
  const states = Array.from(new Set(store.projects.map((p) => p.state)));
  return states.sort();
}

export function getStats(stateFilter?: string): StatsResponse {
  const isAll = !stateFilter || stateFilter.toLowerCase() === "all";
  const projects = isAll
    ? store.projects
    : store.projects.filter(
        (p) => p.state.toLowerCase() === stateFilter.toLowerCase()
      );

  const parcels = isAll
    ? store.parcels
    : store.parcels.filter(
        (p) => p.state.toLowerCase() === stateFilter.toLowerCase()
      );

  const totalAreaNotifiedHa = Number(
    parcels.reduce((sum, p) => sum + p.areaHa, 0).toFixed(2)
  );

  const totalCompDue = parcels.reduce((sum, p) => sum + p.compensationDue, 0);
  const totalCompPaid = parcels.reduce((sum, p) => sum + p.compensationPaid, 0);

  const totalCompensationDueCr = Number((totalCompDue / 10000000).toFixed(2));
  const totalCompensationPaidCr = Number((totalCompPaid / 10000000).toFixed(2));

  const possessedCount = parcels.filter(
    (p) => p.status === "PossessionCompleted"
  ).length;

  const possessionAchievedPct =
    parcels.length > 0 ? Math.round((possessedCount / parcels.length) * 100) : 0;

  const projectsAtRiskCount = projects.filter(
    (p) => p.riskLevel === "High"
  ).length;

  const familiesAffectedCount = parcels.reduce(
    (sum, p) => sum + p.familiesAffected,
    0
  );

  const parcelsByStatus: Record<ParcelStatus, number> = {
    Notified: 0,
    UnderAssessment: 0,
    CompensationPaid: 0,
    PossessionCompleted: 0,
    Delayed: 0,
  };

  for (const p of parcels) {
    if (parcelsByStatus[p.status] !== undefined) {
      parcelsByStatus[p.status]++;
    }
  }

  // Top states by area
  const stateAreaMap: Record<string, { areaHa: number; projectsCount: number }> = {};
  for (const p of store.parcels) {
    if (!stateAreaMap[p.state]) {
      stateAreaMap[p.state] = { areaHa: 0, projectsCount: 0 };
    }
    stateAreaMap[p.state].areaHa += p.areaHa;
  }
  for (const prj of store.projects) {
    if (stateAreaMap[prj.state]) {
      stateAreaMap[prj.state].projectsCount++;
    }
  }

  const topStatesByArea = Object.entries(stateAreaMap)
    .map(([state, val]) => ({
      state,
      areaHa: Number(val.areaHa.toFixed(2)),
      projectsCount: val.projectsCount,
    }))
    .sort((a, b) => b.areaHa - a.areaHa);

  return {
    totalProjects: projects.length,
    totalAreaNotifiedHa,
    totalCompensationDueCr,
    totalCompensationPaidCr,
    possessionAchievedPct,
    projectsAtRiskCount,
    parcelsCount: parcels.length,
    familiesAffectedCount,
    parcelsByStatus,
    topStatesByArea,
    monthlyTrend: store.monthlySnapshots,
  };
}

export function resetStore(): void {
  store = {
    projects: (seedJson.projects as unknown) as Project[],
    parcels: (seedJson.parcels as unknown) as Parcel[],
    stagesByProject: (seedJson.stagesByProject as unknown) as Record<string, Stage[]>,
    payments: (seedJson.payments as unknown) as Payment[],
    monthlySnapshots: (seedJson.monthlySnapshots as unknown) as MonthlySnapshot[],
    auditEvents: (seedJson.auditEvents as unknown) as AuditEvent[],
  };
}
