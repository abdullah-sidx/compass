"use client";

import React, { useState, useEffect } from "react";
import type { ProjectRiskFeatures } from "@/lib/types";
import { predict, type PredictionResult } from "@/lib/risk";
import {
  RotateCcw,
  Sliders,
  TrendingDown,
  TrendingUp,
  Minus,
  Sparkles,
  TreePine,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface WhatIfSimulatorProps {
  actualFeatures: ProjectRiskFeatures;
  baselineDelayMonths: number;
  baselineScore: number;
  onSimulationChange: (simulated: {
    overrides: Partial<ProjectRiskFeatures>;
    prediction: PredictionResult;
    isSimulated: boolean;
  }) => void;
}

export default function WhatIfSimulator({
  actualFeatures,
  baselineDelayMonths,
  baselineScore,
  onSimulationChange,
}: WhatIfSimulatorProps) {
  // Slider states initialized to project actuals
  const [openObjections, setOpenObjections] = useState<number>(
    actualFeatures.openObjections
  );
  const [stageDelayDays, setStageDelayDays] = useState<number>(
    actualFeatures.stageDelayDays
  );
  const [compensationPaidPct, setCompensationPaidPct] = useState<number>(
    actualFeatures.compensationPaidPct
  );
  const [forestClearancePending, setForestClearancePending] = useState<boolean>(
    actualFeatures.forestClearancePending
  );

  // Check if any value is modified from baseline
  const isSimulated =
    openObjections !== actualFeatures.openObjections ||
    stageDelayDays !== actualFeatures.stageDelayDays ||
    compensationPaidPct !== actualFeatures.compensationPaidPct ||
    forestClearancePending !== actualFeatures.forestClearancePending;

  // Run prediction with overrides
  const overrides: Partial<ProjectRiskFeatures> = {
    openObjections,
    stageDelayDays,
    compensationPaidPct,
    forestClearancePending,
  };

  const simulatedPrediction = predict(actualFeatures, overrides);

  // Notify parent on state change
  useEffect(() => {
    onSimulationChange({
      overrides,
      prediction: simulatedPrediction,
      isSimulated,
    });
  }, [
    openObjections,
    stageDelayDays,
    compensationPaidPct,
    forestClearancePending,
  ]);

  const delayDelta = Number(
    (simulatedPrediction.estDelayMonths - baselineDelayMonths).toFixed(1)
  );
  const scoreDelta = simulatedPrediction.score - baselineScore;

  const handleReset = () => {
    setOpenObjections(actualFeatures.openObjections);
    setStageDelayDays(actualFeatures.stageDelayDays);
    setCompensationPaidPct(actualFeatures.compensationPaidPct);
    setForestClearancePending(actualFeatures.forestClearancePending);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Interactive What-If Simulation Studio</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Live Recomputation
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate statutory and operational interventions to forecast project delay shifts instantly
            </p>
          </div>
        </div>

        {/* Reset Button */}
        <div className="flex items-center gap-2">
          {isSimulated && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Actuals</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Simulation Impact Banner */}
      <div
        className={`my-4 p-4 rounded-xl border transition-all duration-300 ${
          !isSimulated
            ? "bg-slate-50/80 border-slate-200/80 text-slate-600"
            : delayDelta < 0
            ? "bg-emerald-50/90 border-emerald-200 text-emerald-900"
            : delayDelta > 0
            ? "bg-rose-50/90 border-rose-200 text-rose-900"
            : "bg-blue-50/90 border-blue-200 text-blue-900"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                !isSimulated
                  ? "bg-slate-200 text-slate-600"
                  : delayDelta < 0
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200"
                  : delayDelta > 0
                  ? "bg-rose-600 text-white shadow-sm shadow-rose-200"
                  : "bg-blue-600 text-white"
              }`}
            >
              {delayDelta < 0 ? (
                <TrendingDown className="w-5 h-5" />
              ) : delayDelta > 0 ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <Minus className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {isSimulated ? "Simulated Scenario Outcome" : "Baseline State"}
                </span>
                {isSimulated && (
                  <span
                    className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                      delayDelta < 0
                        ? "bg-emerald-200 text-emerald-900"
                        : delayDelta > 0
                        ? "bg-rose-200 text-rose-900"
                        : "bg-slate-200 text-slate-800"
                    }`}
                  >
                    {delayDelta > 0 ? `+${delayDelta.toFixed(1)}` : delayDelta.toFixed(1)} months
                  </span>
                )}
              </div>

              <p className="text-xs font-medium mt-0.5 opacity-90">
                {isSimulated
                  ? delayDelta < 0
                    ? `Projected delay falls from ${baselineDelayMonths.toFixed(1)} mo to ${simulatedPrediction.estDelayMonths.toFixed(1)} mo (saves ${Math.abs(delayDelta).toFixed(1)} months)`
                    : delayDelta > 0
                    ? `Projected delay climbs from ${baselineDelayMonths.toFixed(1)} mo to ${simulatedPrediction.estDelayMonths.toFixed(1)} mo (adds ${delayDelta.toFixed(1)} months)`
                    : "No net shift in estimated delay duration"
                  : "Move any slider below to test policy interventions and observe instant risk score adjustments."}
              </p>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-2 self-end sm:self-center font-mono">
            <div className="px-3 py-1.5 bg-white/80 rounded-lg border border-slate-200/60 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                Simulated Delay
              </span>
              <span className="text-sm font-bold text-slate-800">
                +{simulatedPrediction.estDelayMonths.toFixed(1)} mo
              </span>
            </div>

            <div className="px-3 py-1.5 bg-white/80 rounded-lg border border-slate-200/60 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                Risk Score
              </span>
              <span
                className={`text-sm font-bold ${
                  simulatedPrediction.score >= 70
                    ? "text-rose-600"
                    : simulatedPrediction.score >= 40
                    ? "text-amber-600"
                    : "text-emerald-600"
                }`}
              >
                {simulatedPrediction.score}/100 ({simulatedPrediction.level})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Slider 1: Open Objections */}
        <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/70 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div>
              <label
                htmlFor="slider-objections"
                className="text-xs font-bold text-slate-800"
              >
                Open Objections (Section 15)
              </label>
              <span className="text-[10px] text-slate-400 block">
                Standardized β: +0.954 · Each objection adds ~3 days delay
              </span>
            </div>
            <div className="text-right">
              <span className="text-base font-bold text-slate-900 font-mono">
                {openObjections}
              </span>
              <span className="text-[10px] text-slate-400 ml-1">objections</span>
            </div>
          </div>

          <input
            id="slider-objections"
            type="range"
            min={0}
            max={50}
            step={1}
            value={openObjections}
            onChange={(e) => setOpenObjections(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />

          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-medium">
            <span>0 (Fully Disposed)</span>
            <span className="text-slate-600 font-semibold">
              Actual: {actualFeatures.openObjections}
            </span>
            <span>50 (Heavy Backlog)</span>
          </div>
        </div>

        {/* Slider 2: Stage Delay Days */}
        <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/70 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div>
              <label
                htmlFor="slider-stagedelay"
                className="text-xs font-bold text-slate-800"
              >
                Stage Delay / SLA Slippage
              </label>
              <span className="text-[10px] text-slate-400 block">
                Standardized β: +0.871 · Elapsed days past statutory stage target
              </span>
            </div>
            <div className="text-right">
              <span className="text-base font-bold text-slate-900 font-mono">
                {stageDelayDays}
              </span>
              <span className="text-[10px] text-slate-400 ml-1">days</span>
            </div>
          </div>

          <input
            id="slider-stagedelay"
            type="range"
            min={0}
            max={120}
            step={1}
            value={stageDelayDays}
            onChange={(e) => setStageDelayDays(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />

          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-medium">
            <span>0 days (On Schedule)</span>
            <span className="text-slate-600 font-semibold">
              Actual: {actualFeatures.stageDelayDays} d
            </span>
            <span>120 days overdue</span>
          </div>
        </div>

        {/* Slider 3: Compensation Paid % */}
        <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/70 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div>
              <label
                htmlFor="slider-compensation"
                className="text-xs font-bold text-slate-800"
              >
                Compensation Disbursed (%)
              </label>
              <span className="text-[10px] text-slate-400 block">
                Standardized β: -0.763 · High disbursement mitigates landowner disputes
              </span>
            </div>
            <div className="text-right">
              <span className="text-base font-bold text-slate-900 font-mono">
                {compensationPaidPct}%
              </span>
              <span className="text-[10px] text-slate-400 ml-1">disbursed</span>
            </div>
          </div>

          <input
            id="slider-compensation"
            type="range"
            min={0}
            max={100}
            step={1}
            value={compensationPaidPct}
            onChange={(e) => setCompensationPaidPct(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />

          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-medium">
            <span>0% (No Payout)</span>
            <span className="text-slate-600 font-semibold">
              Actual: {actualFeatures.compensationPaidPct}%
            </span>
            <span>100% (Fully Paid)</span>
          </div>
        </div>

        {/* Toggle 4: Forest Clearance Pending */}
        <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/70 hover:border-slate-300 transition-colors flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <TreePine className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">
                  Forest Clearance Pending (Stage-I MoEFCC)
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Standardized β: +1.321 · Diversion approval adds ~3.2 months
              </span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={forestClearancePending}
              onClick={() => setForestClearancePending(!forestClearancePending)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                forestClearancePending ? "bg-rose-500" : "bg-emerald-500"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  forestClearancePending ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Status:</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                  forestClearancePending
                    ? "bg-rose-100 text-rose-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {forestClearancePending ? "Clearance Pending (Diversion Active)" : "Cleared / Not Required"}
              </span>
            </div>

            <span className="text-[10px] text-slate-400">
              Actual: {actualFeatures.forestClearancePending ? "Pending" : "Cleared"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
