import type { Polygon } from "geojson";

export type Role =
  | "Ministry"
  | "State"
  | "District"
  | "RequiringBody"
  | "FieldOfficer";

export type ParcelStatus =
  | "Notified"
  | "UnderAssessment"
  | "CompensationPaid"
  | "PossessionCompleted"
  | "Delayed";

export type RiskLevel = "Low" | "Medium" | "High";

export type ProjectSector =
  | "highway"
  | "rail"
  | "metro"
  | "solar"
  | "port"
  | "industrial"
  | "urban";

export type StageName =
  | "Plan & Align"
  | "Notify"
  | "Objections"
  | "Award & Pay"
  | "Possession"
  | "Handover";

export type StageStatus =
  | "Pending"
  | "In review"
  | "Approved"
  | "Returned"
  | "Overdue";

export interface ProjectRiskFeatures {
  landAreaHa: number;
  parcelsCount: number;
  familiesAffected: number;
  openObjections: number;
  disputes: number;
  stageDelayDays: number;
  compensationPaidPct: number;
  forestClearancePending: boolean;
}

export interface Project extends ProjectRiskFeatures {
  id: string;
  name: string;
  sector: ProjectSector;
  state: string;
  agency: string;
  stage: StageName;
  riskScore: number;
  riskLevel: RiskLevel;
  estDelayMonths: number;
  keyIssue: string;
  startDate: string;
}

export interface Parcel {
  ulpin: string; // 14-char alphanumeric
  projectId: string;
  state: string;
  district: string;
  areaHa: number;
  status: ParcelStatus;
  ownerMasked: string;
  familiesAffected: number;
  landValuePerHa: number; // in INR
  compensationDue: number; // in INR
  compensationPaid: number; // in INR
  hasDispute: boolean;
  geometry: Polygon;
}

export interface Stage {
  name: StageName;
  ownerRole: Role;
  startDate: string;
  dueDate: string;
  completedDate?: string | null;
  status: StageStatus;
}

export interface Payment {
  id: string;
  projectId: string;
  parcelUlpin: string;
  amountCr: number;
  beneficiaryMasked: string;
  status: "Pending" | "Processing" | "Completed" | "Failed";
  date: string;
  referenceNo: string;
}

export interface AuditEvent {
  id: string;
  projectId: string;
  actor: string;
  role: Role;
  action: string;
  timestamp: string;
  prevHash: string;
  hash: string;
}

export interface Grievance {
  id: string;
  ulpin: string;
  category: string;
  message: string;
  status: "Open" | "In progress" | "Resolved";
  createdAt: string;
}

export interface MonthlySnapshot {
  month: string;
  areaNotifiedHa: number;
  compensationPaidCr: number;
  possessionPct: number;
  projectsAtRisk: number;
}

export interface StatsResponse {
  totalProjects: number;
  totalAreaNotifiedHa: number;
  totalCompensationDueCr: number;
  totalCompensationPaidCr: number;
  possessionAchievedPct: number;
  projectsAtRiskCount: number;
  parcelsCount: number;
  familiesAffectedCount: number;
  parcelsByStatus: Record<ParcelStatus, number>;
  topStatesByArea: Array<{ state: string; areaHa: number; projectsCount: number }>;
  monthlyTrend: MonthlySnapshot[];
}
