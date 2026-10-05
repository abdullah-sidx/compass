"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Layers,
  MapPin,
  Search,
  Sliders,
  Sparkles,
} from "lucide-react";
import type { Project, RiskLevel } from "@/lib/types";

interface ProjectsTableProps {
  initialProjects: Project[];
  statesList: string[];
}

type SortField =
  | "name"
  | "state"
  | "sector"
  | "stage"
  | "riskScore"
  | "estDelayMonths"
  | "openObjections";

type SortDirection = "asc" | "desc";

export default function ProjectsTable({
  initialProjects,
  statesList,
}: ProjectsTableProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedRisk, setSelectedRisk] = useState<string>("All");
  const [selectedState, setSelectedState] = useState<string>("All");
  const [selectedSector, setSelectedSector] = useState<string>("All");
  const [sortField, setSortField] = useState<SortField>("riskScore");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Filter projects
  const filteredProjects = useMemo(() => {
    return initialProjects.filter((p) => {
      // Risk level filter
      if (selectedRisk !== "All" && p.riskLevel !== selectedRisk) {
        return false;
      }
      // State filter
      if (selectedState !== "All" && p.state.toLowerCase() !== selectedState.toLowerCase()) {
        return false;
      }
      // Sector filter
      if (selectedSector !== "All" && p.sector.toLowerCase() !== selectedSector.toLowerCase()) {
        return false;
      }
      // Search filter
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(query) ||
          p.id.toLowerCase().includes(query) ||
          p.agency.toLowerCase().includes(query) ||
          p.state.toLowerCase().includes(query) ||
          p.keyIssue.toLowerCase().includes(query);
        if (!matches) return false;
      }
      return true;
    });
  }, [initialProjects, selectedRisk, selectedState, selectedSector, searchTerm]);

  // Sort projects
  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      let comparison = 0;
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "state") {
        comparison = a.state.localeCompare(b.state);
      } else if (sortField === "sector") {
        comparison = a.sector.localeCompare(b.sector);
      } else if (sortField === "stage") {
        comparison = a.stage.localeCompare(b.stage);
      } else if (sortField === "riskScore") {
        comparison = a.riskScore - b.riskScore;
      } else if (sortField === "estDelayMonths") {
        comparison = a.estDelayMonths - b.estDelayMonths;
      } else if (sortField === "openObjections") {
        comparison = a.openObjections - b.openObjections;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredProjects, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc"); // Default to desc for risk metrics
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
    );
  };

  // Counts for tabs
  const highCount = initialProjects.filter((p) => p.riskLevel === "High").length;
  const medCount = initialProjects.filter((p) => p.riskLevel === "Medium").length;
  const lowCount = initialProjects.filter((p) => p.riskLevel === "Low").length;

  return (
    <div className="space-y-6">
      {/* KPI Summary Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Projects
          </span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {initialProjects.length}
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">
            Across {statesList.length} States
          </span>
        </div>

        <div className="bg-white rounded-xl border border-rose-200/80 p-4 shadow-sm bg-rose-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
              High Risk
            </span>
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-rose-700 mt-1">
            {highCount}
          </div>
          <span className="text-xs text-rose-600/80 mt-0.5 block">
            Delay &gt; 6.8 months
          </span>
        </div>

        <div className="bg-white rounded-xl border border-amber-200/80 p-4 shadow-sm bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
              Medium Risk
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">
            {medCount}
          </div>
          <span className="text-xs text-amber-600/80 mt-0.5 block">
            Delay 3.2 - 6.8 months
          </span>
        </div>

        <div className="bg-white rounded-xl border border-emerald-200/80 p-4 shadow-sm bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
              Low Risk
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">
            {lowCount}
          </div>
          <span className="text-xs text-emerald-600/80 mt-0.5 block">
            On schedule / &lt; 3.2 mo
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Risk Level Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedRisk("All")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedRisk === "All"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            All ({initialProjects.length})
          </button>

          <button
            onClick={() => setSelectedRisk("High")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
              selectedRisk === "High"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                selectedRisk === "High" ? "bg-white" : "bg-rose-600"
              }`}
            />
            <span>High Risk ({highCount})</span>
          </button>

          <button
            onClick={() => setSelectedRisk("Medium")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
              selectedRisk === "Medium"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                selectedRisk === "Medium" ? "bg-white" : "bg-amber-600"
              }`}
            />
            <span>Medium ({medCount})</span>
          </button>

          <button
            onClick={() => setSelectedRisk("Low")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
              selectedRisk === "Low"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                selectedRisk === "Low" ? "bg-white" : "bg-emerald-600"
              }`}
            />
            <span>Low ({lowCount})</span>
          </button>
        </div>

        {/* Search & State Filter Dropdown */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search box */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* State filter */}
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="All">All States ({statesList.length})</option>
            {statesList.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Sortable Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th
                  onClick={() => handleSort("name")}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Project Name & Agency</span>
                    {getSortIcon("name")}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("state")}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>State</span>
                    {getSortIcon("state")}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("stage")}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Stage</span>
                    {getSortIcon("stage")}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("riskScore")}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Risk Level & Score</span>
                    {getSortIcon("riskScore")}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("estDelayMonths")}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Delay Est.</span>
                    {getSortIcon("estDelayMonths")}
                  </div>
                </th>

                <th className="py-3 px-4">
                  <span>Primary Risk Driver</span>
                </th>

                <th className="py-3 px-4 text-right">
                  <span>Simulation</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {sortedProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">No projects match the current filters.</p>
                    <button
                      onClick={() => {
                        setSelectedRisk("All");
                        setSelectedState("All");
                        setSearchTerm("");
                      }}
                      className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Clear all filters
                    </button>
                  </td>
                </tr>
              ) : (
                sortedProjects.map((project) => {
                  const isHigh = project.riskLevel === "High";
                  const isMedium = project.riskLevel === "Medium";

                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Name & Agency */}
                      <td className="py-3.5 px-4 min-w-[240px]">
                        <Link
                          href={`/projects/${project.id}`}
                          className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors block line-clamp-1"
                        >
                          {project.name}
                        </Link>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                          <span className="font-mono text-slate-400">{project.id}</span>
                          <span>·</span>
                          <span className="capitalize">{project.sector}</span>
                          <span>·</span>
                          <span className="text-slate-600 font-medium">{project.agency}</span>
                        </div>
                      </td>

                      {/* State */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-800 block">
                          {project.state}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {project.agency}
                        </span>
                      </td>

                      {/* Stage */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {project.stage}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {project.stageDelayDays}d slippage
                        </span>
                      </td>

                      {/* Risk Level & Score */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isHigh
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : isMedium
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isHigh
                                  ? "bg-rose-600"
                                  : isMedium
                                  ? "bg-amber-600"
                                  : "bg-emerald-600"
                              }`}
                            />
                            <span>{project.riskLevel}</span>
                            <span className="font-mono">({project.riskScore})</span>
                          </div>
                        </div>
                        {/* Mini score bar */}
                        <div className="w-20 bg-slate-100 h-1 rounded-full overflow-hidden mt-1.5">
                          <div
                            className={`h-full rounded-full ${
                              isHigh
                                ? "bg-rose-500"
                                : isMedium
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${project.riskScore}%` }}
                          />
                        </div>
                      </td>

                      {/* Est Delay */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                        <div className="flex items-center gap-1 font-bold">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span
                            className={
                              project.estDelayMonths > 6.8
                                ? "text-rose-600"
                                : project.estDelayMonths > 3.2
                                ? "text-amber-600"
                                : "text-emerald-600"
                            }
                          >
                            +{project.estDelayMonths.toFixed(1)} mo
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-sans block">
                          predicted delay
                        </span>
                      </td>

                      {/* Primary Risk Driver */}
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <p className="text-[11px] text-slate-700 font-medium line-clamp-1">
                          {project.keyIssue}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                          <span>{project.openObjections} obj.</span>
                          <span>·</span>
                          <span>{project.compensationPaidPct}% paid</span>
                          {project.forestClearancePending && (
                            <>
                              <span>·</span>
                              <span className="text-rose-600 font-semibold">Forest Req.</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          href={`/projects/${project.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors shadow-2xs"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Simulate</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{sortedProjects.length}</strong> of {initialProjects.length} projects
          </span>
          <span className="text-[11px] text-slate-400">
            Prototype linear regression model (held-out R² = 0.976)
          </span>
        </div>
      </div>
    </div>
  );
}
