"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Layers,
  Filter,
  MapPin,
  Building2,
  AlertTriangle,
  ChevronRight,
  X,
  Compass,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";
import type { Parcel, Project, ParcelStatus } from "@/lib/types";
import { getParcels, getProjects, getAllStates } from "@/lib/data";
import { formatArea } from "@/lib/formatters";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/geo";
import ParcelMapWrapper from "@/components/map/ParcelMapWrapper";
import ParcelDrawer from "@/components/map/ParcelDrawer";

export default function ParcelsExplorer() {
  const [allParcels] = useState<Parcel[]>(() => getParcels());
  const [allProjects] = useState<Project[]>(() => getProjects());
  const [allStates] = useState<string[]>(() => getAllStates());

  // Filter States
  const [selectedState, setSelectedState] = useState<string>("All");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Selected Parcel for Drawer & Map Highlighting
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);

  // Projects list filtered by state
  const availableProjects = useMemo(() => {
    if (selectedState === "All") return allProjects;
    return allProjects.filter(
      (p) => p.state.toLowerCase() === selectedState.toLowerCase()
    );
  }, [allProjects, selectedState]);

  // When state changes, reset project if invalid
  useEffect(() => {
    if (selectedState !== "All" && selectedProjectId !== "All") {
      const exists = availableProjects.some((p) => p.id === selectedProjectId);
      if (!exists) setSelectedProjectId("All");
    }
  }, [selectedState, selectedProjectId, availableProjects]);

  // Filtered parcels for the list
  const filteredParcels = useMemo(() => {
    return allParcels.filter((p) => {
      // State filter
      if (
        selectedState !== "All" &&
        p.state.toLowerCase() !== selectedState.toLowerCase()
      ) {
        return false;
      }
      // Project filter
      if (
        selectedProjectId !== "All" &&
        p.projectId.toLowerCase() !== selectedProjectId.toLowerCase()
      ) {
        return false;
      }
      // Status filter
      if (
        selectedStatus !== "All" &&
        p.status.toLowerCase() !== selectedStatus.toLowerCase()
      ) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesUlpin = p.ulpin.toLowerCase().includes(q);
        const matchesDistrict = p.district.toLowerCase().includes(q);
        const matchesOwner = p.ownerMasked.toLowerCase().includes(q);
        const matchesState = p.state.toLowerCase().includes(q);
        const matchesProject = p.projectId.toLowerCase().includes(q);
        if (
          !matchesUlpin &&
          !matchesDistrict &&
          !matchesOwner &&
          !matchesState &&
          !matchesProject
        ) {
          return false;
        }
      }
      return true;
    });
  }, [allParcels, selectedState, selectedProjectId, selectedStatus, searchQuery]);

  // Aggregated summary stats for the current filtered slice
  const summaryStats = useMemo(() => {
    const count = filteredParcels.length;
    const totalArea = Number(
      filteredParcels.reduce((sum, p) => sum + p.areaHa, 0).toFixed(1)
    );
    const disputes = filteredParcels.filter((p) => p.hasDispute).length;
    return { count, totalArea, disputes };
  }, [filteredParcels]);

  // Status counts for filter pills
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allParcels.length };
    for (const p of allParcels) {
      counts[p.status] = (counts[p.status] || 0) + 1;
    }
    return counts;
  }, [allParcels]);

  const selectedProject = useMemo(() => {
    if (!selectedParcel) return null;
    return allProjects.find((p) => p.id === selectedParcel.projectId) || null;
  }, [selectedParcel, allProjects]);

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Land Parcels GIS Explorer
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Compass className="w-3 h-3 text-blue-600" />
              Interactive GIS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            303 cadastral parcels · Bounded corridor polygons · ULPIN lifecycle status & PFMS compensation
          </p>
        </div>

        {/* Live Filter Summary Pills */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-slate-400 text-[11px] font-medium mr-1.5">Showing:</span>
            <span className="font-bold text-slate-900">{summaryStats.count}</span>
            <span className="text-slate-400 ml-1">parcels</span>
          </div>

          <div className="px-3 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-slate-400 text-[11px] font-medium mr-1.5">Area:</span>
            <span className="font-bold text-slate-900">{formatArea(summaryStats.totalArea)}</span>
          </div>

          {summaryStats.disputes > 0 && (
            <div className="px-3 py-1 bg-rose-50 rounded-lg border border-rose-200 text-rose-700 font-semibold shadow-2xs flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>{summaryStats.disputes} Disputed</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Map + List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-175px)] min-h-[620px]">
        {/* Left Column: Search & Parcels List */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-xl border border-slate-200/90 shadow-sm flex flex-col h-full overflow-hidden">
          {/* Search Box Header */}
          <div className="p-3.5 border-b border-slate-100 space-y-3 bg-slate-50/50">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ULPIN, District, Owner..."
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                onClick={() => setSelectedStatus("All")}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedStatus === "All"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                All ({statusCounts.All || 0})
              </button>

              {(["Delayed", "UnderAssessment", "Notified", "CompensationPaid", "PossessionCompleted"] as ParcelStatus[]).map(
                (st) => {
                  const color = STATUS_COLORS[st];
                  const label = STATUS_LABELS[st];
                  const isSelected = selectedStatus === st;
                  const count = statusCounts[st] || 0;

                  return (
                    <button
                      key={st}
                      onClick={() => setSelectedStatus(isSelected ? "All" : st)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap border ${
                        isSelected
                          ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                          : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span>{label.split(" ")[0]}</span>
                      <span className="text-[10px] opacity-70">({count})</span>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* List Counter and Sorting */}
          <div className="px-4 py-2 bg-slate-100/60 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>
              {filteredParcels.length} {filteredParcels.length === 1 ? "parcel" : "parcels"} listed
            </span>
            <span className="text-[10px] text-slate-400">Click parcel to fly & inspect</span>
          </div>

          {/* Scrollable Parcel Cards */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredParcels.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No parcels match filters</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Try clearing your search query or adjusting state and status filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedStatus("All");
                    setSelectedState("All");
                    setSelectedProjectId("All");
                  }}
                  className="mt-3 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              filteredParcels.map((parcel) => {
                const isSelected = selectedParcel?.ulpin === parcel.ulpin;
                const statusColor = STATUS_COLORS[parcel.status] || "#64748b";

                return (
                  <div
                    key={parcel.ulpin}
                    onClick={() => setSelectedParcel(parcel)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
                        : "bg-white hover:bg-slate-50 border-slate-200/90 shadow-2xs hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: statusColor }}
                        />
                        <span className="font-mono text-xs font-bold text-slate-900 tracking-tight">
                          {parcel.ulpin}
                        </span>
                      </div>

                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={{
                          backgroundColor: `${statusColor}15`,
                          color: statusColor,
                          border: `1px solid ${statusColor}30`,
                        }}
                      >
                        {STATUS_LABELS[parcel.status] || parcel.status}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1 truncate max-w-[170px]">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{parcel.district}, {parcel.state}</span>
                      </div>
                      <span className="font-semibold text-slate-800">{formatArea(parcel.areaHa)}</span>
                    </div>

                    <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Owner: <span className="text-slate-600 font-mono">{parcel.ownerMasked}</span></span>
                      {parcel.hasDispute ? (
                        <span className="text-rose-600 font-semibold flex items-center gap-0.5">
                          <AlertTriangle className="w-2.5 h-2.5" /> Disputed
                        </span>
                      ) : (
                        <span className="text-slate-400">{parcel.projectId}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Main Column: Full GIS Map */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-xl border border-slate-200/90 shadow-sm flex flex-col h-full overflow-hidden relative">
          <ParcelMapWrapper
            parcels={filteredParcels}
            projects={allProjects}
            selectedState={selectedState}
            selectedProjectId={selectedProjectId}
            selectedStatus={selectedStatus}
            selectedUlpin={selectedParcel?.ulpin || null}
            onSelectParcel={(p) => setSelectedParcel(p)}
            onSelectProject={(prjId) => setSelectedProjectId(prjId || "All")}
            onSelectState={(st) => setSelectedState(st)}
            compact={false}
            showControls={true}
            showLegend={true}
            className="flex-1"
          />
        </div>
      </div>

      {/* Parcel Detail Drawer */}
      <ParcelDrawer
        parcel={selectedParcel}
        project={selectedProject}
        onClose={() => setSelectedParcel(null)}
      />
    </div>
  );
}
