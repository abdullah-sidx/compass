"use client";

import React from "react";
import type { StatsResponse, ParcelStatus } from "@/lib/types";

interface ParcelsByStatusProps {
  stats: StatsResponse;
}

interface StatusItem {
  key: ParcelStatus;
  label: string;
  count: number;
  pct: number;
  dotColor: string;
  barColor: string;
  badgeBg: string;
}

export default function ParcelsByStatus({ stats }: ParcelsByStatusProps) {
  const total = stats.parcelsCount || 1;

  const statusItems: StatusItem[] = [
    {
      key: "Notified",
      label: "Notified",
      count: stats.parcelsByStatus.Notified || 0,
      pct: Math.round(((stats.parcelsByStatus.Notified || 0) / total) * 100),
      dotColor: "bg-blue-600",
      barColor: "bg-blue-600",
      badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      key: "UnderAssessment",
      label: "Under assessment",
      count: stats.parcelsByStatus.UnderAssessment || 0,
      pct: Math.round(((stats.parcelsByStatus.UnderAssessment || 0) / total) * 100),
      dotColor: "bg-amber-500",
      barColor: "bg-amber-500",
      badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      key: "CompensationPaid",
      label: "Compensation paid",
      count: stats.parcelsByStatus.CompensationPaid || 0,
      pct: Math.round(((stats.parcelsByStatus.CompensationPaid || 0) / total) * 100),
      dotColor: "bg-emerald-600",
      barColor: "bg-emerald-600",
      badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      key: "PossessionCompleted",
      label: "Possession completed",
      count: stats.parcelsByStatus.PossessionCompleted || 0,
      pct: Math.round(((stats.parcelsByStatus.PossessionCompleted || 0) / total) * 100),
      dotColor: "bg-purple-600",
      barColor: "bg-purple-600",
      badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      key: "Delayed",
      label: "Delayed / At risk",
      count: stats.parcelsByStatus.Delayed || 0,
      pct: Math.round(((stats.parcelsByStatus.Delayed || 0) / total) * 100),
      dotColor: "bg-red-600",
      barColor: "bg-red-600",
      badgeBg: "bg-red-50 text-red-700 border-red-200",
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Parcels by Status
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {stats.parcelsCount} parcels across all corridor reaches
          </p>
        </div>
      </div>

      <div className="mt-3.5 space-y-3">
        {statusItems.map((item) => (
          <div key={item.key} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${item.dotColor}`} />
                <span className="font-medium text-slate-700">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-900">
                  {item.count}
                </span>
                <span className="text-slate-400 text-[11px]">({item.pct}%)</span>
              </div>
            </div>

            {/* Horizontal progress meter */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${item.barColor}`}
                style={{ width: `${Math.max(item.pct, item.count > 0 ? 3 : 0)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
