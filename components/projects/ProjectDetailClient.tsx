"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, Calendar, CheckCircle2, ChevronRight, FileSpreadsheet, Info, Layers, MapPin, ShieldAlert, Sparkles, Users } from "lucide-react";
import type { Project, ProjectRiskFeatures } from "@/lib/types";
import { predict, getRecommendedActions, type PredictionResult } from "@/lib/risk";
import RiskGauge from "./RiskGauge";
import WhyAtRiskBars from "./WhyAtRiskBars";
import WhatIfSimulator from "./WhatIfSimulator";
import RecommendedActions from "./RecommendedActions";
import { formatArea, formatCurrencyCr } from "@/lib/formatters";

interface ProjectDetailClientProps {
  project: Project;
}

export default function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  // Extract project baseline risk features
  const actualFeatures: ProjectRiskFeatures = {
    landAreaHa: project.landAreaHa,
    parcelsCount: project.parcelsCount,
    familiesAffected: project.familiesAffected,
    openObjections: project.openObjections,
    disputes: project.disputes,
    stageDelayDays: project.stageDelayDays,
    compensationPaidPct: project.compensationPaidPct,
    forestClearancePending: project.forestClearancePending,
  };

  // Baseline prediction
  const baselinePrediction = predict(actualFeatures);

  // Simulation state
  const [currentPrediction, setCurrentPrediction] = useState<PredictionResult>(baselinePrediction);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const [simulatedFeatures, setSimulatedFeatures] = useState<ProjectRiskFeatures>(actualFeatures);

  const handleSimulationChange = (sim: {
    overrides: Partial<ProjectRiskFeatures>;
    prediction: PredictionResult;
    isSimulated: boolean;
  }) => {
    setCurrentPrediction(sim.prediction);
    setIsSimulated(sim.isSimulated);
    setSimulatedFeatures({
      ...actualFeatures,
      ...sim.overrides,
    });
  };

  // Dynamic recommendations based on current (actual or simulated) top factors
  const currentActions = getRecommendedActions(
    currentPrediction.topFactors,
    simulatedFeatures
  );

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Breadcrumb Navigation & Top Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Projects Portfolio</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-semibold truncate max-w-xs">
            {project.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            ID: <span className="font-mono text-slate-800">{project.id}</span>
          </span>
          <Link
            href={`/parcels?project=${encodeURIComponent(project.id)}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>View {project.parcelsCount} Parcels on Map</span>
          </Link>
        </div>
      </div>

      {/* Honest Prototype Banner */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-amber-900">
        <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs">
          <span className="font-bold">Prototype model trained on synthetic data (SIH26016 Demo): </span>
          <span>
            Delay predictions, risk scores, and what-if simulation outputs are computed directly in the browser via an interpretable standardized linear model (held-out R² = 0.976, n = 3,000). Not for official statutory determination.
          </span>
        </div>
      </div>

      {/* Project Overview Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize border border-slate-200">
                {project.sector}
              </span>
              <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                {project.agency}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Started {project.startDate}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {project.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-600">
              <div className="flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{project.state}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <span>Current Stage:</span>
                <span className="font-bold text-slate-800 bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                  {project.stage}
                </span>
              </div>
            </div>
          </div>

          {/* Key Issue Alert Box */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 max-w-md lg:w-96 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Primary Obstacle / Key Issue
              </span>
              <p className="text-xs font-semibold text-slate-800 mt-0.5">
                {project.keyIssue}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                <span>{project.openObjections} objections</span>
                <span>·</span>
                <span>{project.disputes} disputes</span>
                <span>·</span>
                <span className={project.forestClearancePending ? "text-rose-600 font-semibold" : "text-emerald-600 font-semibold"}>
                  {project.forestClearancePending ? "Forest clearance pending" : "Forest cleared"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Physical & Financial Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Land Area Notified
            </span>
            <span className="text-base font-bold text-slate-900 mt-0.5 block">
              {formatArea(project.landAreaHa)}
            </span>
            <span className="text-[11px] text-slate-500">
              {project.parcelsCount} contiguous parcels
            </span>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Families Affected
            </span>
            <span className="text-base font-bold text-slate-900 mt-0.5 block">
              {project.familiesAffected} Families
            </span>
            <span className="text-[11px] text-slate-500">
              R&R entitlement tracking
            </span>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Compensation Disbursed
            </span>
            <span className="text-base font-bold text-slate-900 mt-0.5 block">
              {project.compensationPaidPct}% Paid
            </span>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${project.compensationPaidPct}%` }}
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Stage Slippage (Elapsed)
            </span>
            <span className="text-base font-bold text-slate-900 mt-0.5 block">
              {project.stageDelayDays} Days
            </span>
            <span className="text-[11px] text-slate-500">
              Relative to statutory SLA
            </span>
          </div>
        </div>
      </div>

      {/* Row 1: Risk Gauge (Left) + Why At Risk Bars (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 xl:col-span-4">
          <RiskGauge
            score={currentPrediction.score}
            level={currentPrediction.level}
            estDelayMonths={currentPrediction.estDelayMonths}
            baselineScore={project.riskScore}
            baselineDelayMonths={project.estDelayMonths}
            isSimulated={isSimulated}
          />
        </div>

        <div className="lg:col-span-7 xl:col-span-8">
          <WhyAtRiskBars
            factors={currentPrediction.topFactors}
            isSimulated={isSimulated}
          />
        </div>
      </div>

      {/* Row 2: Interactive What-If Simulator Studio */}
      <WhatIfSimulator
        actualFeatures={actualFeatures}
        baselineDelayMonths={project.estDelayMonths}
        baselineScore={project.riskScore}
        onSimulationChange={handleSimulationChange}
      />

      {/* Row 3: Recommended Actions Policy Deck */}
      <RecommendedActions
        actions={currentActions}
        isSimulated={isSimulated}
      />
    </div>
  );
}
