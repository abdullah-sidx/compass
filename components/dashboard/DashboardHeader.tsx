"use client";

import React from "react";
import { Clock, MapPin, ChevronDown } from "lucide-react";

interface DashboardHeaderProps {
  selectedState: string;
  onSelectState: (state: string) => void;
  allStates: string[];
  lastUpdatedDate: string;
}

export default function DashboardHeader({
  selectedState,
  onSelectState,
  allStates,
  lastUpdatedDate,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Land Acquisition Control Tower
          </h1>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Monitoring
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1 font-normal">
          Monitor · Track · Accelerate · SIH26016 Real-Time National Decision Support
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Dynamic Last Updated timestamp */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/80 rounded-lg text-xs font-medium text-slate-600 border border-slate-200/60">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Last updated: <span className="font-semibold text-slate-800">{lastUpdatedDate}</span>
          </span>
        </div>

        {/* Global State Filter Dropdown */}
        <div className="relative inline-flex items-center">
          <MapPin className="w-4 h-4 text-blue-600 absolute left-3 pointer-events-none z-10" />
          <select
            value={selectedState}
            onChange={(e) => onSelectState(e.target.value)}
            aria-label="Filter by State"
            className="pl-9 pr-9 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer"
          >
            <option value="All">All States (National)</option>
            {allStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
