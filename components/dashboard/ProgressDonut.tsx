"use client";

import React, { useState, useEffect } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import type { StatsResponse } from "@/lib/types";

interface ProgressDonutProps {
  stats: StatsResponse;
}

interface DonutCategory {
  name: string;
  count: number;
  pct: number;
  color: string;
}

export default function ProgressDonut({ stats }: ProgressDonutProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const total = stats.parcelsCount || 1;
  const possessionCount = stats.parcelsByStatus.PossessionCompleted || 0;
  const inProgressCount =
    (stats.parcelsByStatus.CompensationPaid || 0) +
    (stats.parcelsByStatus.UnderAssessment || 0);
  const notStartedCount = stats.parcelsByStatus.Notified || 0;
  const delayedCount = stats.parcelsByStatus.Delayed || 0;

  const data: DonutCategory[] = [
    {
      name: "Possession achieved",
      count: possessionCount,
      pct: Math.round((possessionCount / total) * 100),
      color: "#9333ea", // purple
    },
    {
      name: "In progress",
      count: inProgressCount,
      pct: Math.round((inProgressCount / total) * 100),
      color: "#10b981", // green / emerald
    },
    {
      name: "Not started",
      count: notStartedCount,
      pct: Math.round((notStartedCount / total) * 100),
      color: "#2563eb", // blue
    },
    {
      name: "Delayed",
      count: delayedCount,
      pct: Math.round((delayedCount / total) * 100),
      color: "#dc2626", // red
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Land Acquisition Progress
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Phase status of {stats.parcelsCount} parcels
          </p>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full">
          {stats.possessionAchievedPct}% Taken
        </span>
      </div>

      {/* Donut Chart Container */}
      <div className="relative w-full h-48 my-2 flex items-center justify-center">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="count"
                strokeWidth={2}
                stroke="#ffffff"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as DonutCategory;
                    return (
                      <div className="bg-slate-900 text-white text-xs rounded-lg py-1.5 px-3 shadow-lg border border-slate-800">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-slate-300">
                          {item.count} parcels ({item.pct}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-36 h-36 rounded-full border-4 border-slate-100 border-t-purple-600 animate-spin" />
        )}

        {/* Center Text inside Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
            {stats.possessionAchievedPct}%
          </span>
          <span className="text-[10px] uppercase font-semibold text-slate-400 mt-1 tracking-wider">
            Possession
          </span>
        </div>
      </div>

      {/* Categories Legend with counts & percentages */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
        {data.map((cat) => (
          <div
            key={cat.name}
            className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50/70 border border-slate-100"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-slate-600 truncate text-[11px] font-medium">
                {cat.name}
              </span>
            </div>
            <span className="font-semibold text-slate-900 text-[11px] ml-1">
              {cat.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
