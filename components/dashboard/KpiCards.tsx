"use client";

import React from "react";
import {
  Layers,
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import type { StatsResponse } from "@/lib/types";
import {
  formatArea,
  formatCurrencyCr,
  formatPercentage,
  calculateDelta,
  type DeltaInfo,
} from "@/lib/formatters";

interface KpiCardsProps {
  stats: StatsResponse;
  selectedState: string;
}

export default function KpiCards({ stats, selectedState }: KpiCardsProps) {
  // Compute Month-over-Month changes from the seeded monthly snapshots
  const snapshots = stats.monthlyTrend || [];
  const latestSnapshot = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
  const prevSnapshot = snapshots.length > 1 ? snapshots[snapshots.length - 2] : null;

  // 1. Total Area Notified Delta
  const areaDelta: DeltaInfo =
    latestSnapshot && prevSnapshot
      ? calculateDelta(latestSnapshot.areaNotifiedHa, prevSnapshot.areaNotifiedHa, "%", false)
      : { text: "0% vs last mo", isPositive: true, isNeutral: true, sentiment: "neutral" };

  // 2. Compensation Paid Delta
  const compDelta: DeltaInfo =
    latestSnapshot && prevSnapshot
      ? calculateDelta(latestSnapshot.compensationPaidCr, prevSnapshot.compensationPaidCr, "%", false)
      : { text: "0% vs last mo", isPositive: true, isNeutral: true, sentiment: "neutral" };

  // 3. Possession Achieved Delta
  const possessionDelta: DeltaInfo =
    latestSnapshot && prevSnapshot
      ? calculateDelta(latestSnapshot.possessionPct, prevSnapshot.possessionPct, "%", false)
      : { text: "0% vs last mo", isPositive: true, isNeutral: true, sentiment: "neutral" };

  // 4. Projects at Risk Delta (fewer at-risk projects is positive/good!)
  const riskDelta: DeltaInfo =
    latestSnapshot && prevSnapshot
      ? calculateDelta(latestSnapshot.projectsAtRisk, prevSnapshot.projectsAtRisk, "%", true)
      : { text: "0% vs last mo", isPositive: true, isNeutral: true, sentiment: "neutral" };

  const cards = [
    {
      id: "kpi-area",
      label: "Total Area Notified",
      value: formatArea(stats.totalAreaNotifiedHa),
      subtext: `${stats.parcelsCount} parcels tracked${
        selectedState !== "All" ? ` in ${selectedState}` : " nationwide"
      }`,
      delta: areaDelta,
      icon: Layers,
      iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    },
    {
      id: "kpi-compensation",
      label: "Compensation Paid",
      value: formatCurrencyCr(stats.totalCompensationPaidCr),
      subtext: `of ${formatCurrencyCr(stats.totalCompensationDueCr)} due (${
        stats.totalCompensationDueCr > 0
          ? Math.round((stats.totalCompensationPaidCr / stats.totalCompensationDueCr) * 100)
          : 0
      }%)`,
      delta: compDelta,
      icon: IndianRupee,
      iconBg: "bg-amber-50 text-amber-600 border border-amber-100",
    },
    {
      id: "kpi-possession",
      label: "Possession Achieved",
      value: formatPercentage(stats.possessionAchievedPct),
      subtext: `${stats.parcelsByStatus.PossessionCompleted || 0} of ${
        stats.parcelsCount
      } parcels taken`,
      delta: possessionDelta,
      icon: CheckCircle2,
      iconBg: "bg-purple-50 text-purple-600 border border-purple-100",
    },
    {
      id: "kpi-risk",
      label: "Projects at Risk",
      value: `${stats.projectsAtRiskCount}`,
      subtext: `${stats.totalProjects} active projects${
        selectedState !== "All" ? ` in ${selectedState}` : ""
      }`,
      delta: riskDelta,
      icon: AlertTriangle,
      iconBg: "bg-rose-50 text-rose-600 border border-rose-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card) => {
        const Icon = card.icon;
        const delta = card.delta;

        return (
          <div
            key={card.id}
            className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow transition-shadow flex flex-col justify-between"
          >
            {/* Top row: Icon */}
            <div className="flex items-center justify-between">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center shadow-xs ${card.iconBg}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                {selectedState !== "All" ? selectedState : "National"}
              </span>
            </div>

            {/* Middle row: Big Metric Value */}
            <div className="mt-4">
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {card.value}
              </div>
            </div>

            {/* Bottom row: Label and Delta Pill */}
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-slate-600">{card.label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[140px]">
                  {card.subtext}
                </p>
              </div>

              {/* Delta Badge */}
              <div
                className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold flex-shrink-0 ${
                  delta.sentiment === "positive"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : delta.sentiment === "negative"
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                {delta.sentiment === "positive" ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : delta.sentiment === "negative" ? (
                  <ArrowDownRight className="w-3 h-3" />
                ) : (
                  <Minus className="w-3 h-3" />
                )}
                <span>{delta.text}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
