import riskModelJson from "@/public/model/risk-model.json";
import type { ProjectRiskFeatures, RiskLevel } from "./types";

export interface FactorContribution {
  featureKey: string;
  name: string;
  label: string;
  rawVal: number | boolean;
  standardizedVal: number;
  coef: number;
  impact: number; // in months
  direction: "increases_risk" | "reduces_risk";
}

export interface PredictionResult {
  score: number; // 0 - 100
  level: RiskLevel;
  estDelayMonths: number;
  intercept: number;
  topFactors: FactorContribution[];
  allFactors: FactorContribution[];
}

export interface RecommendedAction {
  id: string;
  factorKey: string;
  title: string;
  description: string;
  estimatedImpact: string;
  badge: "Urgent" | "Operational" | "Statutory";
}

export const riskModel = riskModelJson;

/**
 * Predict project delay (in months), risk score (0-100), and feature contributions
 * using the standardized Ordinary Least Squares model.
 * Runs completely in the browser with zero server calls.
 */
export function predict(
  features: ProjectRiskFeatures,
  overrides?: Partial<ProjectRiskFeatures>
): PredictionResult {
  const merged: ProjectRiskFeatures = {
    ...features,
    ...(overrides || {}),
  };

  const featureDefs = riskModel.features as Record<
    string,
    { label: string; mean: number; std: number; coef: number; direction: string }
  >;

  let totalDelay = riskModel.intercept;
  const allFactors: FactorContribution[] = [];

  for (const [key, def] of Object.entries(featureDefs)) {
    let rawVal: number;
    if (key === "forestClearancePending") {
      rawVal = merged.forestClearancePending ? 1 : 0;
    } else {
      rawVal = Number((merged as unknown as Record<string, number>)[key] ?? 0);
    }

    const stdVal = (rawVal - def.mean) / (def.std || 1.0);
    const impact = def.coef * stdVal;
    totalDelay += impact;

    allFactors.push({
      featureKey: key,
      name: key,
      label: def.label,
      rawVal: key === "forestClearancePending" ? Boolean(merged.forestClearancePending) : rawVal,
      standardizedVal: Number(stdVal.toFixed(3)),
      coef: def.coef,
      impact: Number(impact.toFixed(2)),
      direction: impact >= 0 ? "increases_risk" : "reduces_risk",
    });
  }

  // Delay cannot be negative
  const estDelayMonths = Number(Math.max(0.2, totalDelay).toFixed(1));

  // Map estimated delay to 0-100 score aligned with thresholds
  // < 3.2 mo -> Low (score 0-39)
  // 3.2 - 6.8 mo -> Medium (score 40-69)
  // >= 6.8 mo -> High (score 70-100)
  const lowMax = riskModel.thresholds.lowMaxDelayMonths; // 3.2
  const medMax = riskModel.thresholds.mediumMaxDelayMonths; // 6.8

  let score: number;
  if (estDelayMonths <= lowMax) {
    score = Math.round((estDelayMonths / lowMax) * 39);
  } else if (estDelayMonths <= medMax) {
    score = 40 + Math.round(((estDelayMonths - lowMax) / (medMax - lowMax)) * 29);
  } else {
    // 6.8 to 14.0+ months maps from 70 to 100
    const highSpan = 14.0 - medMax;
    score = 70 + Math.round(Math.min(30, ((estDelayMonths - medMax) / highSpan) * 30));
  }

  score = Math.min(100, Math.max(0, score));

  let level: RiskLevel = "Low";
  if (score >= riskModel.thresholds.highMinScore) {
    level = "High";
  } else if (score >= 40) {
    level = "Medium";
  }

  // Sort factors by magnitude of impact descending
  const sortedFactors = [...allFactors].sort(
    (a, b) => Math.abs(b.impact) - Math.abs(a.impact)
  );

  return {
    score,
    level,
    estDelayMonths,
    intercept: riskModel.intercept,
    topFactors: sortedFactors.slice(0, 5),
    allFactors: sortedFactors,
  };
}

/**
 * Generate 3 rule-based recommended actions tailored to the project's top risk factors.
 */
export function getRecommendedActions(
  factors: FactorContribution[],
  features: ProjectRiskFeatures
): RecommendedAction[] {
  // Sort factors by highest positive impact (i.e. highest contributors to delay)
  const delayDrivers = [...factors]
    .filter((f) => f.impact > 0)
    .sort((a, b) => b.impact - a.impact);

  const actionCatalog: Record<string, (f: FactorContribution, prj: ProjectRiskFeatures) => RecommendedAction> = {
    forestClearancePending: () => ({
      id: "act-forest",
      factorKey: "forestClearancePending",
      title: "Expedite Stage-I Forest Clearance via PARIVESH",
      description:
        "Convene emergency coordination meeting with Regional MoEFCC Empowered Committee. Submit updated non-forest land CA scheme to release diversion sanction.",
      estimatedImpact: "-3.2 months potential reduction",
      badge: "Statutory",
    }),
    openObjections: (f) => ({
      id: "act-objections",
      factorKey: "openObjections",
      title: "Deploy Dedicated Lok Adalat & CALA Hearing Benches",
      description: `Authorise 2 Additional Collectors to clear the ${f.rawVal} open Section 15 objections via block-level camp hearings within 21 calendar days.`,
      estimatedImpact: "-1.8 months potential reduction",
      badge: "Urgent",
    }),
    stageDelayDays: (f) => ({
      id: "act-stagedelay",
      factorKey: "stageDelayDays",
      title: "Escalate Overdue Approvals to State Monitoring Committee",
      description: `Target the ${f.rawVal}-day stage slippage by invoking Chief Secretary nodal review to enforce statutory approval deadlines across departments.`,
      estimatedImpact: "-2.0 months potential reduction",
      badge: "Urgent",
    }),
    disputes: (f) => ({
      id: "act-disputes",
      factorKey: "disputes",
      title: "Deposit Disputed Award Tranches into LARRA Court Escrow",
      description: `Transfer ${f.rawVal} disputed title claims to the Land Acquisition Authority court escrow under Section 77 to secure possession without stalling ground works.`,
      estimatedImpact: "-1.5 months potential reduction",
      badge: "Statutory",
    }),
    compensationPaidPct: (f, prj) => ({
      id: "act-compensation",
      factorKey: "compensationPaidPct",
      title: "Intensify Direct Benefit Transfer (PFMS) Payout Camps",
      description: `Current disbursement is at ${prj.compensationPaidPct}%. Mobilise village revenue officers to process pending bank account e-KYC and push payout above 85%.`,
      estimatedImpact: "-1.4 months potential reduction",
      badge: "Operational",
    }),
    familiesAffected: (f) => ({
      id: "act-families",
      factorKey: "familiesAffected",
      title: "Rollout R&R Resettlement Package Entitlement Drive",
      description: `Engage district social development officers to verify rehabilitation entitlements for ${f.rawVal} affected project families to prevent local friction.`,
      estimatedImpact: "-0.8 months potential reduction",
      badge: "Operational",
    }),
    parcelsCount: () => ({
      id: "act-parcels",
      factorKey: "parcelsCount",
      title: "Cluster-wise Cadastral Verification & Demarcation",
      description:
        "Deploy DGPS survey teams to expedite concurrent boundary demarcation across contiguous project stretches.",
      estimatedImpact: "-0.6 months potential reduction",
      badge: "Operational",
    }),
    landAreaHa: () => ({
      id: "act-area",
      factorKey: "landAreaHa",
      title: "Phased Section 19 Declaration Scheduling",
      description:
        "Segment the broad corridor into 3 manageable priority packages to allow civil contracting to proceed on unencumbered stretches.",
      estimatedImpact: "-0.5 months potential reduction",
      badge: "Operational",
    }),
  };

  const actions: RecommendedAction[] = [];

  for (const driver of delayDrivers) {
    if (actions.length >= 3) break;
    const generator = actionCatalog[driver.featureKey];
    if (generator) {
      actions.push(generator(driver, features));
    }
  }

  // If compensationPaidPct is low (< 70%) and not already in actions, consider adding it
  if (actions.length < 3 && features.compensationPaidPct < 75 && !actions.some((a) => a.factorKey === "compensationPaidPct")) {
    const dummyFactor: FactorContribution = {
      featureKey: "compensationPaidPct",
      name: "compensationPaidPct",
      label: "Compensation Disbursed (%)",
      rawVal: features.compensationPaidPct,
      standardizedVal: -1.0,
      coef: -0.76,
      impact: 0.76,
      direction: "increases_risk",
    };
    actions.push(actionCatalog.compensationPaidPct(dummyFactor, features));
  }

  // Fill up to 3 with fallback operational actions if needed
  if (actions.length < 3) {
    actions.push({
      id: "act-monitoring",
      factorKey: "general",
      title: "Bi-Weekly Inter-Departmental Milestone Review",
      description:
        "Establish an integrated project management dashboard sync between NHAI/Railways and District Collectorate to resolve operational bottlenecks.",
      estimatedImpact: "-0.5 months potential reduction",
      badge: "Operational",
    });
  }

  return actions.slice(0, 3);
}
