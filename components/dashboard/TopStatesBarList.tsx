"use client";

import React from "react";
import type { StatsResponse } from "@/lib/types";
import { formatArea } from "@/lib/formatters";

interface TopStatesBarListProps {
  stats: StatsResponse;
  selectedState: string;
  onSelectState: (state: string) => void;
}

export default function TopStatesBarList({
  stats,
  selectedState,
  onSelectState,
}: TopStatesBarListProps) {
  const topStates = (stats.topStatesByArea || []).slice(0, 5);
  const maxArea = topStates.length > 0 ? topStates[0].areaHa : 1;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Top 5 States by Notified Area
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked by cumulative hectares under acquisition
          </p>
        </div>
      </div>

      <div className="mt-3.5 space-y-3">
        {topStates.map((st, index) => {
          const isSelected = selectedState.toLowerCase() === st.state.toLowerCase();
          const barWidthPct = Math.round((st.areaHa / maxArea) * 100);

          return (
            <button
              key={st.state}
              type="button"
              onClick={() => onSelectState(isSelected ? "All" : st.state)}
              className={`w-full text-left p-2 rounded-lg transition-all group ${
                isSelected
                  ? "bg-blue-50/80 border border-blue-200 shadow-2xs"
                  : "hover:bg-slate-50 border border-transparent"
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                    {index + 1}
                  </span>
                  <span
                    className={`font-semibold transition-colors ${
                      isSelected ? "text-blue-700 font-bold" : "text-slate-800"
                    }`}
                  >
                    {st.state}
                  </span>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded font-normal">
                    {st.projectsCount} {st.projectsCount === 1 ? "project" : "projects"}
                  </span>
                </div>
                <span className="font-semibold text-slate-900 text-xs">
                  {formatArea(st.areaHa)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isSelected ? "bg-blue-600" : "bg-slate-400 group-hover:bg-blue-500"
                  }`}
                  style={{ width: `${Math.max(barWidthPct, 4)}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
