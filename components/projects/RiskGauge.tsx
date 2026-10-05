"use client";

import React from "react";
import type { RiskLevel } from "@/lib/types";
import { ArrowDownRight, ArrowUpRight, Gauge, Minus } from "lucide-react";

interface RiskGaugeProps {
  score: number;
  level: RiskLevel;
  estDelayMonths: number;
  baselineScore?: number;
  baselineDelayMonths?: number;
  isSimulated?: boolean;
}

export default function RiskGauge({
  score,
  level,
  estDelayMonths,
  baselineScore,
  baselineDelayMonths,
  isSimulated = false,
}: RiskGaugeProps) {
  // Clamp score between 0 and 100
  const clampedScore = Math.min(100, Math.max(0, score));

  // Determine colors based on level
  const isHigh = level === "High";
  const isMedium = level === "Medium";

  const levelColor = isHigh
    ? "#ef4444" // red
    : isMedium
    ? "#f59e0b" // amber
    : "#10b981"; // green

  const levelBgClass = isHigh
    ? "bg-rose-50 text-rose-700 border-rose-200"
    : isMedium
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-emerald-50 text-emerald-700 border-emerald-200";

  // Semi-circle gauge geometry
  // Arc angles: 180 degrees from -180 deg to 0 deg
  const radius = 80;
  const strokeWidth = 14;
  const cx = 110;
  const cy = 100;
  const circumference = Math.PI * radius; // Half-circle perimeter
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  // Delay comparison
  const delayDelta =
    baselineDelayMonths !== undefined
      ? Number((estDelayMonths - baselineDelayMonths).toFixed(1))
      : 0;

  const scoreDelta =
    baselineScore !== undefined ? clampedScore - baselineScore : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col items-center justify-between relative overflow-hidden">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
              AI Delay-Risk Gauge
            </h3>
            <p className="text-[11px] text-slate-500">
              Interpretable linear delay model
            </p>
          </div>
        </div>

        {/* Level Chip */}
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-2xs ${levelBgClass}`}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: levelColor }}
          />
          <span>{level} Risk</span>
        </div>
      </div>

      {/* SVG Semi-Circle Gauge */}
      <div className="relative flex flex-col items-center justify-center my-3">
        <svg width="220" height="125" viewBox="0 0 220 125" className="overflow-visible">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="45%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <path
            d="M 30,100 A 80,80 0 0,1 190,100"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Value Arc */}
          <path
            d="M 30,100 A 80,80 0 0,1 190,100"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
          />

          {/* Ticks & Threshold Markers */}
          {/* Low boundary (40%) */}
          <circle cx="75" cy="42" r="2.5" fill="#64748b" opacity="0.6" />
          {/* High boundary (70%) */}
          <circle cx="145" cy="42" r="2.5" fill="#64748b" opacity="0.6" />
        </svg>

        {/* Center Numbers */}
        <div className="absolute top-[52px] flex flex-col items-center justify-center text-center">
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-baseline">
            <span>{clampedScore}</span>
            <span className="text-xs text-slate-400 font-medium ml-0.5">/100</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Risk Index
          </span>
        </div>
      </div>

      {/* Threshold Legend Labels */}
      <div className="w-full flex items-center justify-between text-[10px] text-slate-400 font-medium px-4 pb-2">
        <span className="text-emerald-600 font-semibold">Low (0-39)</span>
        <span className="text-amber-600 font-semibold">Med (40-69)</span>
        <span className="text-rose-600 font-semibold">High (70+)</span>
      </div>

      {/* Delay Metrics Box */}
      <div className="w-full bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between mt-1">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
            Estimated Delay
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span
              className={`text-lg font-bold ${
                estDelayMonths > 6.8
                  ? "text-rose-600"
                  : estDelayMonths > 3.2
                  ? "text-amber-600"
                  : "text-emerald-600"
              }`}
            >
              +{estDelayMonths.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 font-medium">months</span>
          </div>
        </div>

        {/* Simulation Difference Pill */}
        {isSimulated && baselineDelayMonths !== undefined ? (
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Simulation Shift
            </span>
            <div
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold mt-0.5 ${
                delayDelta < 0
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : delayDelta > 0
                  ? "bg-rose-100 text-rose-800 border border-rose-300"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {delayDelta < 0 ? (
                <ArrowDownRight className="w-3.5 h-3.5" />
              ) : delayDelta > 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <Minus className="w-3.5 h-3.5" />
              )}
              <span>
                {delayDelta > 0 ? `+${delayDelta.toFixed(1)}` : delayDelta.toFixed(1)} mo
              </span>
            </div>
            {scoreDelta !== 0 && (
              <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                Score: {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta} pts
              </span>
            )}
          </div>
        ) : (
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Statutory Baseline
            </span>
            <span className="text-xs font-semibold text-slate-700 block mt-0.5">
              Target SLA: 12 mo
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
