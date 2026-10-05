"use client";

import React, { useState, useMemo } from "react";
import { getStats, getProjects, getAllStates } from "@/lib/data";
import DashboardHeader from "./DashboardHeader";
import KpiCards from "./KpiCards";
import ProgressDonut from "./ProgressDonut";
import ParcelsByStatus from "./ParcelsByStatus";
import TopStatesBarList from "./TopStatesBarList";
import MapSlotPlaceholder from "./MapSlotPlaceholder";
import ProjectsAtRiskTable from "./ProjectsAtRiskTable";

export default function OverviewDashboard() {
  const [selectedState, setSelectedState] = useState<string>("All");

  const allStates = useMemo(() => getAllStates(), []);

  // Compute reactive statistics from seeded store
  const stats = useMemo(() => {
    return getStats(selectedState);
  }, [selectedState]);

  // Compute reactive projects list from seeded store
  const projects = useMemo(() => {
    return getProjects({ state: selectedState });
  }, [selectedState]);

  // Dynamic last updated timestamp from the latest monthly snapshot
  const lastUpdatedMonth = useMemo(() => {
    if (stats.monthlyTrend && stats.monthlyTrend.length > 0) {
      return stats.monthlyTrend[stats.monthlyTrend.length - 1].month;
    }
    return "Oct 2025";
  }, [stats.monthlyTrend]);

  return (
    <div className="space-y-6">
      {/* 1. Dashboard Header */}
      <DashboardHeader
        selectedState={selectedState}
        onSelectState={setSelectedState}
        allStates={allStates}
        lastUpdatedMonth={lastUpdatedMonth}
      />

      {/* 2. Four KPI Cards */}
      <KpiCards stats={stats} selectedState={selectedState} />

      {/* 3. Three-Column Arrangement: Left Charts, Centre Map Slot, Right Risk Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Donut progress, Parcels by status, Top 5 states */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          <ProgressDonut stats={stats} />
          <ParcelsByStatus stats={stats} />
          <TopStatesBarList
            stats={stats}
            selectedState={selectedState}
            onSelectState={setSelectedState}
          />
        </div>

        {/* Centre Column: Reserved Land Acquisition Map Slot */}
        <div className="lg:col-span-8 xl:col-span-5">
          <MapSlotPlaceholder stats={stats} selectedState={selectedState} />
        </div>

        {/* Right Column: Projects at Risk Table */}
        <div className="lg:col-span-12 xl:col-span-4">
          <ProjectsAtRiskTable
            projects={projects}
            selectedState={selectedState}
          />
        </div>
      </div>
    </div>
  );
}
