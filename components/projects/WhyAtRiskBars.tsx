"use client";

import React from "react";
import type { FactorContribution } from "@/lib/risk";
import { AlertCircle, CheckCircle2, TrendingDown, TrendingUp } from "lucide-react";

interface WhyAtRiskBarsProps {
  factors: FactorContribution[];
  isSimulated?: boolean;
}

export default function WhyAtRiskBars({
  factors,
  isSimulated = false,
}: WhyAtRiskBarsProps) {
  // Take top 5 factors
  const top5 = factors.slice(0, 5);

  // Find max absolute impact to scale the bar widths proportionally
  const maxAbsImpact = Math.max(...top5.map((f) => Math.abs(f.impact)), 1.0);

  const formatRawValue = (factor: FactorContribution) => {
    if (typeof factor.rawVal === "boolean") {
      return factor.rawVal ? "Pending (Yes)" : "Clear (No)";
    }
    if (factor.featureKey === "compensationPaidPct") {
      return `${factor.rawVal}%`;
    }
    if (factor.featureKey === "stageDelayDays") {
      return `${factor.rawVal} days`;
    }
    if (factor.featureKey === "openObjections") {
      return `${factor.rawVal} objections`;
    }
    if (factor.featureKey === "disputes") {
      return `${factor.rawVal} disputes`;
    }
    if (factor.featureKey === "landAreaHa") {
      return `${factor.rawVal} ha`;
    }
    if (factor.featureKey === "parcelsCount") {
      return `${factor.rawVal} parcels`;
    }
    if (factor.featureKey === "familiesAffected") {
      return `${factor.rawVal} families`;
    }
    return String(factor.rawVal);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
              Why at Risk: Top 5 Factors
            </h3>
            {isSimulated && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Simulated
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Exact per-feature impact (β × standardized value)
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2.5 text-[10px] font-semibold whitespace-nowrap shrink-0">
          <div className="flex items-center gap-1 text-rose-600">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Raises Risk</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Lowers Risk</span>
          </div>
        </div>
      </div>

      {/* Factor Bars List */}
      <div className="divide-y divide-slate-100 flex-1 my-1">
        {top5.map((factor, index) => {
          const isPositiveImpact = factor.impact >= 0;
          const barWidthPct = Math.min(
            100,
            Math.max(8, Math.round((Math.abs(factor.impact) / maxAbsImpact) * 100))
          );

          return (
            <div key={factor.featureKey} className="py-2.5 first:pt-2 last:pb-1">
              {/* Row 1: Label and Value */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-slate-400 font-mono text-[10px]">
                    #{index + 1}
                  </span>
                  <span className="font-semibold text-slate-800 truncate">
                    {factor.label}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {formatRawValue(factor)}
                  </span>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {isPositiveImpact ? (
                    <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                  <span
                    className={`font-bold font-mono text-xs ${
                      isPositiveImpact ? "text-rose-600" : "text-emerald-600"
                    }`}
                  >
                    {isPositiveImpact ? `+${factor.impact.toFixed(2)}` : factor.impact.toFixed(2)} mo
                  </span>
                </div>
              </div>

              {/* Row 2: Diverging Progress Bar */}
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isPositiveImpact
                        ? "bg-rose-500 shadow-2xs shadow-rose-200"
                        : "bg-emerald-500 shadow-2xs shadow-emerald-200"
                    }`}
                    style={{ width: `${barWidthPct}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-mono w-16 text-right">
                  z = {factor.standardizedVal > 0 ? `+${factor.standardizedVal}` : factor.standardizedVal}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Model intercept baseline: 6.8 mo</span>
        <span>Red bars add delay; Green bars mitigate delay</span>
      </div>
    </div>
  );
}
