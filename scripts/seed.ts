import fs from "fs";
import path from "path";
import crypto from "crypto";
import type {
  Project,
  Parcel,
  Stage,
  Payment,
  AuditEvent,
  MonthlySnapshot,
  ParcelStatus,
  ProjectSector,
  RiskLevel,
  StageName,
  Role,
} from "../lib/types";
import { predict } from "../lib/risk";

export const AS_OF_DATE = "2026-10-05";

// Deterministic PRNG (Mulberry32)
function createPrng(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = createPrng(42);

function randBetween(min: number, max: number): number {
  return min + random() * (max - min);
}

function randInt(min: number, max: number): number {
  return Math.floor(randBetween(min, max + 1));
}

function choice<T>(arr: T[]): T {
  return arr[Math.floor(random() * arr.length)];
}

// 14-character alphanumeric ULPIN generator
const ulpinChars = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
function generateUlpin(stateCode: string, index: number): string {
  let suffix = "";
  for (let i = 0; i < 10; i++) {
    suffix += ulpinChars[Math.floor(random() * ulpinChars.length)];
  }
  const prefix = stateCode.substring(0, 2).toUpperCase();
  const padIndex = (index % 100).toString().padStart(2, "0");
  return `${prefix}${padIndex}${suffix.substring(0, 10)}`;
}

const maskedNames = [
  "R****h K***r",
  "S***t P***l",
  "A***t S***h",
  "L***a D**i",
  "M***h Y***v",
  "V***m S***a",
  "P***a R**o",
  "K***n N***k",
  "B***u M***o",
  "D***k J***i",
  "A***n G***a",
  "S***h C***y",
  "G***l S***i",
  "R***i K***n",
  "H***h V***a",
];

interface ProjectConfig {
  id: string;
  name: string;
  sector: ProjectSector;
  state: string;
  stateCode: string;
  agency: string;
  district: string;
  startCoord: [number, number]; // [lng, lat]
  bearingDeg: number;
  corridorLengthKm: number;
  parcelsCount: number;
  keyIssue: string;
  startDate: string;
  forestClearancePending: boolean;
  baseRisk: RiskLevel;
}

const projectConfigs: ProjectConfig[] = [
  {
    id: "PRJ-001",
    name: "Mumbai-Nagpur Super Expressway Reach 4",
    sector: "highway",
    state: "Maharashtra",
    stateCode: "MH",
    agency: "MSRDC",
    district: "Wardha",
    startCoord: [78.55, 20.74],
    bearingDeg: 35,
    corridorLengthKm: 12,
    parcelsCount: 22,
    keyIssue: "Farmer protest over solatium rates",
    startDate: "2024-03-15",
    forestClearancePending: false,
    baseRisk: "High",
  },
  {
    id: "PRJ-002",
    name: "Western Dedicated Freight Corridor Link",
    sector: "rail",
    state: "Gujarat",
    stateCode: "GJ",
    agency: "DFCCIL",
    district: "Vadodara",
    startCoord: [73.18, 22.31],
    bearingDeg: 12,
    corridorLengthKm: 11,
    parcelsCount: 20,
    keyIssue: "Title disputes in ancestral undivided holdings",
    startDate: "2023-11-10",
    forestClearancePending: false,
    baseRisk: "Medium",
  },
  {
    id: "PRJ-003",
    name: "Bengaluru Metro Phase 3 Outer Ring Reach",
    sector: "metro",
    state: "Karnataka",
    stateCode: "KA",
    agency: "BMRCL",
    district: "Bengaluru Urban",
    startCoord: [77.62, 12.91],
    bearingDeg: 350,
    corridorLengthKm: 8,
    parcelsCount: 20,
    keyIssue: "High commercial valuation & title disputes",
    startDate: "2024-01-20",
    forestClearancePending: false,
    baseRisk: "High",
  },
  {
    id: "PRJ-004",
    name: "Bhadla Mega Solar Park Grid Evacuation 400kV",
    sector: "solar",
    state: "Rajasthan",
    stateCode: "RJ",
    agency: "RSPCL",
    district: "Phalodi",
    startCoord: [72.18, 27.52],
    bearingDeg: 80,
    corridorLengthKm: 14,
    parcelsCount: 18,
    keyIssue: "None (Progress on schedule)",
    startDate: "2024-06-01",
    forestClearancePending: false,
    baseRisk: "Low",
  },
  {
    id: "PRJ-005",
    name: "Ganga Expressway Link Feeder Highway",
    sector: "highway",
    state: "Uttar Pradesh",
    stateCode: "UP",
    agency: "UPEIDA",
    district: "Unnao",
    startCoord: [80.48, 26.54],
    bearingDeg: 115,
    corridorLengthKm: 15,
    parcelsCount: 24,
    keyIssue: "Incomplete compensation disbursement to tenants",
    startDate: "2023-09-01",
    forestClearancePending: false,
    baseRisk: "Medium",
  },
  {
    id: "PRJ-006",
    name: "Machilipatnam Deepwater Port Hinterland Rail",
    sector: "port",
    state: "Andhra Pradesh",
    stateCode: "AP",
    agency: "AP Maritime Board",
    district: "Krishna",
    startCoord: [81.13, 16.18],
    bearingDeg: 285,
    corridorLengthKm: 10,
    parcelsCount: 18,
    keyIssue: "Coastal wetland environmental clearance review",
    startDate: "2024-04-12",
    forestClearancePending: false,
    baseRisk: "Medium",
  },
  {
    id: "PRJ-007",
    name: "Angul-Sukinda Heavy Mineral Rail Corridor",
    sector: "rail",
    state: "Odisha",
    stateCode: "OD",
    agency: "East Coast Railway",
    district: "Dhenkanal",
    startCoord: [85.60, 20.98],
    bearingDeg: 65,
    corridorLengthKm: 13,
    parcelsCount: 22,
    keyIssue: "Forest clearance pending in Reserve Forest patch",
    startDate: "2023-08-15",
    forestClearancePending: true,
    baseRisk: "High",
  },
  {
    id: "PRJ-008",
    name: "Chennai-Bengaluru Industrial Corridor Node C",
    sector: "industrial",
    state: "Tamil Nadu",
    stateCode: "TN",
    agency: "SIPCOT",
    district: "Ranipet",
    startCoord: [79.33, 12.92],
    bearingDeg: 240,
    corridorLengthKm: 9,
    parcelsCount: 20,
    keyIssue: "Gram Sabha resolution delayed for common grazing lands",
    startDate: "2024-02-18",
    forestClearancePending: false,
    baseRisk: "Medium",
  },
  {
    id: "PRJ-009",
    name: "Indore-Pithampur Multi-Modal Logistics Hub",
    sector: "industrial",
    state: "Madhya Pradesh",
    stateCode: "MP",
    agency: "MPIDC",
    district: "Dhar",
    startCoord: [75.68, 22.61],
    bearingDeg: 195,
    corridorLengthKm: 10,
    parcelsCount: 19,
    keyIssue: "None (Advance possession in progress)",
    startDate: "2024-05-10",
    forestClearancePending: false,
    baseRisk: "Low",
  },
  {
    id: "PRJ-010",
    name: "Eastern Peripheral Logistics Expressway Spur",
    sector: "highway",
    state: "Haryana",
    stateCode: "HR",
    agency: "NHAI",
    district: "Palwal",
    startCoord: [77.32, 28.14],
    bearingDeg: 160,
    corridorLengthKm: 11,
    parcelsCount: 21,
    keyIssue: "Multiple court stay petitions on circle rate revision",
    startDate: "2023-12-05",
    forestClearancePending: false,
    baseRisk: "High",
  },
  {
    id: "PRJ-011",
    name: "Dholera SIR Dedicated Water Supply Spine",
    sector: "urban",
    state: "Gujarat",
    stateCode: "GJ",
    agency: "DSIRDA",
    district: "Ahmedabad",
    startCoord: [72.22, 22.25],
    bearingDeg: 140,
    corridorLengthKm: 10,
    parcelsCount: 18,
    keyIssue: "None (92% compensation disbursed)",
    startDate: "2024-01-05",
    forestClearancePending: false,
    baseRisk: "Low",
  },
  {
    id: "PRJ-012",
    name: "Jewar Airport Aerocity Phase 2 Transit Ring",
    sector: "urban",
    state: "Uttar Pradesh",
    stateCode: "UP",
    agency: "YEIDA",
    district: "Gautam Buddha Nagar",
    startCoord: [77.58, 28.19],
    bearingDeg: 45,
    corridorLengthKm: 8,
    parcelsCount: 20,
    keyIssue: "Farmer group objection on rehabilitation site",
    startDate: "2024-03-01",
    forestClearancePending: false,
    baseRisk: "Medium",
  },
  {
    id: "PRJ-013",
    name: "Pune Ring Road Western Bypass Segment",
    sector: "highway",
    state: "Maharashtra",
    stateCode: "MH",
    agency: "MSRDC",
    district: "Pune",
    startCoord: [73.74, 18.52],
    bearingDeg: 175,
    corridorLengthKm: 12,
    parcelsCount: 23,
    keyIssue: "High valuation and green zone reclassification queries",
    startDate: "2024-02-14",
    forestClearancePending: true,
    baseRisk: "High",
  },
  {
    id: "PRJ-014",
    name: "Visakhapatnam Metro Phase 1 Steel Plant Reach",
    sector: "metro",
    state: "Andhra Pradesh",
    stateCode: "AP",
    agency: "AMRC",
    district: "Visakhapatnam",
    startCoord: [83.18, 17.69],
    bearingDeg: 215,
    corridorLengthKm: 9,
    parcelsCount: 19,
    keyIssue: "Encroachment regularisation claims",
    startDate: "2024-07-01",
    forestClearancePending: false,
    baseRisk: "Medium",
  },
  {
    id: "PRJ-015",
    name: "Tumakuru Machine Tool Park Extension",
    sector: "industrial",
    state: "Karnataka",
    stateCode: "KA",
    agency: "KIADB",
    district: "Tumakuru",
    startCoord: [77.10, 13.34],
    bearingDeg: 110,
    corridorLengthKm: 10,
    parcelsCount: 19,
    keyIssue: "None (Handover nearing completion)",
    startDate: "2023-10-15",
    forestClearancePending: false,
    baseRisk: "Low",
  },
];

const stageNames: StageName[] = [
  "Plan & Align",
  "Notify",
  "Objections",
  "Award & Pay",
  "Possession",
  "Handover",
];

const stageOwnerRoles: Record<StageName, Role> = {
  "Plan & Align": "RequiringBody",
  Notify: "Ministry",
  Objections: "District",
  "Award & Pay": "State",
  Possession: "FieldOfficer",
  Handover: "RequiringBody",
};

// Generate small contiguous polygon parcels along a corridor line
function generateParcelsForProject(
  config: ProjectConfig
): { parcels: Parcel[]; totalAreaHa: number } {
  const parcels: Parcel[] = [];
  const [startLng, startLat] = config.startCoord;
  const rad = (config.bearingDeg * Math.PI) / 180;
  const dx = Math.sin(rad); // east-west
  const dy = Math.cos(rad); // north-south
  const px = -dy; // perpendicular vector east-west
  const py = dx; // perpendicular vector north-south

  // Approx km to degree: 1 deg lat ~ 111 km, 1 deg lng ~ 111 * cos(lat) km
  const latKm = 1 / 111;
  const lngKm = 1 / (111 * Math.cos((startLat * Math.PI) / 180));

  let currentDistKm = 0;
  let totalArea = 0;

  for (let i = 0; i < config.parcelsCount; i++) {
    const parcelLengthKm = randBetween(0.12, 0.28); // 120m - 280m
    const corridorWidthKm = randBetween(0.06, 0.12); // 60m - 120m
    const areaHa = Number(
      ((parcelLengthKm * 1000 * (corridorWidthKm * 1000)) / 10000).toFixed(2)
    );
    totalArea += areaHa;

    const startSegKm = currentDistKm;
    const endSegKm = currentDistKm + parcelLengthKm;
    currentDistKm = endSegKm;

    // Rectangle vertices along the corridor
    const halfW = corridorWidthKm / 2;

    const p1Lng = (startLng + (dx * startSegKm - px * halfW) * lngKm);
    const p1Lat = (startLat + (dy * startSegKm - py * halfW) * latKm);

    const p2Lng = (startLng + (dx * endSegKm - px * halfW) * lngKm);
    const p2Lat = (startLat + (dy * endSegKm - py * halfW) * latKm);

    const p3Lng = (startLng + (dx * endSegKm + px * halfW) * lngKm);
    const p3Lat = (startLat + (dy * endSegKm + py * halfW) * latKm);

    const p4Lng = (startLng + (dx * startSegKm + px * halfW) * lngKm);
    const p4Lat = (startLat + (dy * startSegKm + py * halfW) * latKm);

    // Status assignment based on project risk & progress
    let status: ParcelStatus = "UnderAssessment";
    let hasDispute = false;

    if (config.baseRisk === "High") {
      const r = random();
      if (r < 0.35) {
        status = "Delayed";
        hasDispute = true;
      } else if (r < 0.6) {
        status = "UnderAssessment";
        hasDispute = random() < 0.4;
      } else if (r < 0.85) {
        status = "Notified";
      } else {
        status = "CompensationPaid";
      }
    } else if (config.baseRisk === "Medium") {
      const r = random();
      if (r < 0.15) {
        status = "Delayed";
        hasDispute = true;
      } else if (r < 0.45) {
        status = "UnderAssessment";
      } else if (r < 0.75) {
        status = "CompensationPaid";
      } else if (r < 0.9) {
        status = "PossessionCompleted";
      } else {
        status = "Notified";
      }
    } else {
      // Low risk / advanced
      const r = random();
      if (r < 0.5) {
        status = "PossessionCompleted";
      } else if (r < 0.85) {
        status = "CompensationPaid";
      } else {
        status = "UnderAssessment";
      }
    }

    const landValuePerHa = Math.round(randBetween(2500000, 9500000) / 10000) * 10000;
    const compensationDue = Math.round(areaHa * landValuePerHa * 2.0); // 2x multiplier
    let compensationPaid = 0;
    if (status === "PossessionCompleted" || status === "CompensationPaid") {
      compensationPaid = compensationDue;
    } else if (status === "Delayed") {
      compensationPaid = random() < 0.5 ? Math.round(compensationDue * randBetween(0.1, 0.4)) : 0;
    }

    const ulpin = generateUlpin(config.stateCode, i + 1);
    const familiesAffected = randInt(1, 5);
    const ownerMasked = choice(maskedNames);

    parcels.push({
      ulpin,
      projectId: config.id,
      state: config.state,
      district: config.district,
      areaHa,
      status,
      ownerMasked,
      familiesAffected,
      landValuePerHa,
      compensationDue,
      compensationPaid,
      hasDispute,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [Number(p1Lng.toFixed(6)), Number(p1Lat.toFixed(6))],
            [Number(p2Lng.toFixed(6)), Number(p2Lat.toFixed(6))],
            [Number(p3Lng.toFixed(6)), Number(p3Lat.toFixed(6))],
            [Number(p4Lng.toFixed(6)), Number(p4Lat.toFixed(6))],
            [Number(p1Lng.toFixed(6)), Number(p1Lat.toFixed(6))],
          ],
        ],
      },
    });
  }

  return { parcels, totalAreaHa: Number(totalArea.toFixed(2)) };
}

function generateStagesForProject(project: ProjectConfig, baseRisk: RiskLevel): { stages: Stage[]; currentStage: StageName } {
  const stages: Stage[] = [];
  let currentStage: StageName = "Award & Pay";

  if (baseRisk === "High") {
    currentStage = choice(["Notify", "Objections", "Award & Pay"]);
  } else if (baseRisk === "Medium") {
    currentStage = choice(["Objections", "Award & Pay", "Possession"]);
  } else {
    currentStage = choice(["Award & Pay", "Possession", "Handover"]);
  }

  const currentIndex = stageNames.indexOf(currentStage);

  const asOf = new Date(AS_OF_DATE);

  for (let i = 0; i < stageNames.length; i++) {
    const sName = stageNames[i];
    const role = stageOwnerRoles[sName];

    let sDate: string;
    let dDate: string;
    let status: Stage["status"] = "Pending";
    let completedDate: string | null = null;

    if (i < currentIndex) {
      // Completed stages in the past
      const offsetDays = (currentIndex - i) * 90;
      sDate = new Date(asOf.getTime() - (offsetDays + 80) * 86400000).toISOString().split("T")[0];
      dDate = new Date(asOf.getTime() - (offsetDays) * 86400000).toISOString().split("T")[0];
      completedDate = new Date(asOf.getTime() - (offsetDays + 5) * 86400000).toISOString().split("T")[0];
      status = "Approved";
    } else if (i === currentIndex) {
      // Current active stage
      sDate = new Date(asOf.getTime() - 45 * 86400000).toISOString().split("T")[0];
      if (baseRisk === "High") {
        dDate = new Date(asOf.getTime() - 10 * 86400000).toISOString().split("T")[0]; // Overdue before 2026-10-05
        status = "Overdue";
      } else {
        dDate = new Date(asOf.getTime() + 45 * 86400000).toISOString().split("T")[0]; // In review due in Nov 2026
        status = "In review";
      }
    } else {
      // Future pending stages
      const offsetDays = (i - currentIndex) * 75;
      sDate = new Date(asOf.getTime() + offsetDays * 86400000).toISOString().split("T")[0];
      dDate = new Date(asOf.getTime() + (offsetDays + 60) * 86400000).toISOString().split("T")[0];
      status = "Pending";
    }

    stages.push({
      name: sName,
      ownerRole: role,
      startDate: sDate,
      dueDate: dDate,
      completedDate,
      status,
    });
  }

  return { stages, currentStage };
}

export function generateSeedData() {
  const allParcels: Parcel[] = [];
  const projects: Project[] = [];
  const stagesByProject: Record<string, Stage[]> = {};
  const payments: Payment[] = [];

  for (const cfg of projectConfigs) {
    const { parcels, totalAreaHa } = generateParcelsForProject(cfg);
    allParcels.push(...parcels);

    const { stages, currentStage } = generateStagesForProject(cfg, cfg.baseRisk);
    stagesByProject[cfg.id] = stages;

    const totalFamilies = parcels.reduce((acc, p) => acc + p.familiesAffected, 0);
    const disputesCount = parcels.filter((p) => p.hasDispute).length;
    const delayedCount = parcels.filter((p) => p.status === "Delayed").length;
    const compDueTotal = parcels.reduce((acc, p) => acc + p.compensationDue, 0);
    const compPaidTotal = parcels.reduce((acc, p) => acc + p.compensationPaid, 0);
    const compPaidPct = compDueTotal > 0 ? Math.round((compPaidTotal / compDueTotal) * 100) : 0;

    const openObjections = cfg.baseRisk === "High" ? randInt(18, 45) : cfg.baseRisk === "Medium" ? randInt(5, 16) : randInt(0, 4);
    const stageDelayDays = cfg.baseRisk === "High" ? randInt(45, 120) : cfg.baseRisk === "Medium" ? randInt(15, 40) : randInt(0, 10);
    const disputes = disputesCount + delayedCount;

    const riskFeatures = {
      landAreaHa: totalAreaHa,
      parcelsCount: parcels.length,
      familiesAffected: totalFamilies,
      openObjections,
      disputes,
      stageDelayDays,
      compensationPaidPct: compPaidPct,
      forestClearancePending: cfg.forestClearancePending,
    };

    const prediction = predict(riskFeatures);

    const project: Project = {
      id: cfg.id,
      name: cfg.name,
      sector: cfg.sector,
      state: cfg.state,
      agency: cfg.agency,
      stage: currentStage,
      riskScore: prediction.score,
      riskLevel: prediction.level,
      estDelayMonths: prediction.estDelayMonths,
      keyIssue: cfg.keyIssue,
      startDate: cfg.startDate,
      ...riskFeatures,
    };

    projects.push(project);

    // Create a few payments for parcels that have compensationPaid > 0
    const paidParcels = parcels.filter((p) => p.compensationPaid > 0);
    for (const p of paidParcels.slice(0, 2)) {
      const pmtDate = new Date(new Date(AS_OF_DATE).getTime() - (20 + (payments.length % 5) * 12) * 86400000)
        .toISOString()
        .split("T")[0];
      payments.push({
        id: `PMT-${cfg.stateCode}-${payments.length + 101}`,
        projectId: cfg.id,
        parcelUlpin: p.ulpin,
        amountCr: Number((p.compensationPaid / 10000000).toFixed(2)),
        beneficiaryMasked: p.ownerMasked,
        status: "Completed",
        date: pmtDate,
        referenceNo: `PFMS-TXN-${randInt(100000, 999999)}`,
      });
    }
  }

  // 12 Monthly Snapshots ending in September 2026 (relative to AS_OF_DATE 2026-10-05)
  const monthNames = [
    "Oct 2025", "Nov 2025", "Dec 2025", "Jan 2026", "Feb 2026", "Mar 2026",
    "Apr 2026", "May 2026", "Jun 2026", "Jul 2026", "Aug 2026", "Sep 2026"
  ];

  const currentAreaHa = projects.reduce((acc, p) => acc + p.landAreaHa, 0);
  const currentPaidCr = allParcels.reduce((acc, p) => acc + p.compensationPaid, 0) / 10000000;
  const currentPossessedCount = allParcels.filter((p) => p.status === "PossessionCompleted").length;
  const currentPossessionPct = Math.round((currentPossessedCount / allParcels.length) * 100);
  const highRiskCount = projects.filter((p) => p.riskLevel === "High").length;

  const monthlySnapshots: MonthlySnapshot[] = monthNames.map((month, idx) => {
    const factor = (idx + 1) / 12;
    const isLatest = idx === 11;
    return {
      month,
      areaNotifiedHa: Number((currentAreaHa * (0.65 + 0.35 * factor)).toFixed(1)),
      compensationPaidCr: Number((currentPaidCr * (0.3 + 0.7 * factor)).toFixed(2)),
      possessionPct: Math.round(currentPossessionPct * (0.25 + 0.75 * factor)),
      // Earlier snapshots keep their seeded trend; latest snapshot matches the prediction count exactly
      projectsAtRisk: isLatest ? highRiskCount : Math.max(2, Math.round(highRiskCount + (1 - factor) * 3 - (idx % 2))),
    };
  });

  // Audit Events chain (SHA-256 hash chaining) deterministically anchored to AS_OF_DATE
  const auditEvents: AuditEvent[] = [];
  let prevHash = "0000000000000000000000000000000000000000000000000000000000000000";

  const sampleActions = [
    { actor: "Joint Secretary (Land)", role: "Ministry" as Role, action: "Approved Section 11 Notification draft" },
    { actor: "Competent Authority (CALA)", role: "District" as Role, action: "Completed hearing of Section 15 objections" },
    { actor: "Principal Secretary (Revenue)", role: "State" as Role, action: "Approved revised compensation award matrix" },
    { actor: "Chief Project Manager", role: "RequiringBody" as Role, action: "Submitted optimized corridor alignment proposal" },
    { actor: "Special Land Acquisition Officer", role: "FieldOfficer" as Role, action: "Verified boundary demarcation stones on site" },
  ];

  const asOfMs = new Date(`${AS_OF_DATE}T09:30:00Z`).getTime();

  for (let i = 0; i < 15; i++) {
    const act = sampleActions[i % sampleActions.length];
    const prj = projects[i % projects.length];
    const timestamp = new Date(asOfMs - (15 - i) * 86400000 * 2).toISOString();
    const eventId = `AUD-${(i + 1).toString().padStart(4, "0")}`;
    const payload = `${eventId}|${prj.id}|${act.actor}|${act.role}|${act.action}|${timestamp}|${prevHash}`;
    const hash = crypto.createHash("sha256").update(payload).digest("hex");

    auditEvents.push({
      id: eventId,
      projectId: prj.id,
      actor: act.actor,
      role: act.role,
      action: act.action,
      timestamp,
      prevHash,
      hash,
    });

    prevHash = hash;
  }

  return {
    asOfDate: AS_OF_DATE,
    projects,
    parcels: allParcels,
    stagesByProject,
    payments,
    monthlySnapshots,
    auditEvents,
  };
}

// When run via CLI: write to data/seed.json
if (require.main === module || process.argv[1]?.includes("seed")) {
  const data = generateSeedData();
  const outDir = path.join(__dirname, "../data");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const outFile = path.join(outDir, "seed.json");
  fs.writeFileSync(outFile, JSON.stringify(data, null, 2), "utf-8");
  console.log(`[Seed] Successfully generated synthetic data:`);
  console.log(` - ${data.projects.length} Projects`);
  console.log(` - ${data.parcels.length} Parcels`);
  console.log(` - ${data.monthlySnapshots.length} Monthly Snapshots`);
  console.log(` - ${data.auditEvents.length} Audit Events`);
  console.log(` - ${data.payments.length} Payments`);
  console.log(`Output written to ${outFile}`);
}
