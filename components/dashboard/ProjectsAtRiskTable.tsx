"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, AlertTriangle, Clock, ShieldAlert, CheckCircle } from "lucide-react";
import type { Project } from "@/lib/types";

interface ProjectsAtRiskTableProps {
  projects: Project[];
  selectedState: string;
}

export default function ProjectsAtRiskTable({
  projects,
  selectedState,
}: ProjectsAtRiskTableProps) {
  // Sort projects by risk score descending (High first, then Medium, then Low)
  const sortedProjects = [...projects].sort((a, b) => {
    const riskOrder: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
    const diff = (riskOrder[b.riskLevel] || 0) - (riskOrder[a.riskLevel] || 0);
    if (diff !== 0) return diff;
    return b.riskScore - a.riskScore;
  });

  const highRiskCount = projects.filter((p) => p.riskLevel === "High").length;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col h-full min-h-[560px] overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Projects at Risk
            </h2>
            {highRiskCount > 0 && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                {highRiskCount} High Risk
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked by AI delay prediction & statutory SLA breaches
          </p>
        </div>

        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors group"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Projects List/Table Container */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[560px]">
        {sortedProjects.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center h-full">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <CheckCircle className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-800">No Projects Found</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
              No projects recorded for state {selectedState}.
            </p>
          </div>
        ) : (
          sortedProjects.map((project) => {
            const isHigh = project.riskLevel === "High";
            const isMedium = project.riskLevel === "Medium";

            return (
              <div
                key={project.id}
                className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col justify-between gap-2.5"
              >
                {/* Project Title & State */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href="/projects"
                      className="font-semibold text-xs text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                    >
                      {project.name}
                    </Link>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                      <span className="font-medium text-slate-700">{project.state}</span>
                      <span>·</span>
                      <span className="capitalize">{project.sector}</span>
                      <span>·</span>
                      <span className="text-slate-400">{project.agency}</span>
                    </div>
                  </div>

                  {/* Risk Chip */}
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${
                      isHigh
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : isMedium
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isHigh ? "bg-rose-600" : isMedium ? "bg-amber-600" : "bg-emerald-600"
                      }`}
                    />
                    <span>{project.riskLevel}</span>
                    <span className="text-slate-400 font-normal">({project.riskScore})</span>
                  </div>
                </div>

                {/* Key Issue with Parcel Count */}
                <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-start gap-1.5">
                  <AlertTriangle
                    className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                      isHigh ? "text-rose-500" : isMedium ? "text-amber-500" : "text-slate-400"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] leading-tight text-slate-700">
                      {project.keyIssue}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 ml-1">
                      ({project.parcelsCount} parcels)
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Stage & Estimated Delay */}
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-400 font-medium">
                    Stage: <span className="text-slate-700 font-semibold">{project.stage}</span>
                  </span>

                  <div className="flex items-center gap-1 font-semibold">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className={project.estDelayMonths > 6 ? "text-rose-600" : "text-amber-600"}>
                      +{project.estDelayMonths.toFixed(1)} mo est. delay
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-500">
        <span>Showing {sortedProjects.length} projects</span>
        <Link
          href="/projects"
          className="font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
        >
          <span>All 15 Projects</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
