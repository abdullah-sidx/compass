import React from "react";
import { getProjects, getAllStates } from "@/lib/data";
import ProjectsTable from "@/components/projects/ProjectsTable";
import { FolderKanban, Info } from "lucide-react";

export default function ProjectsPage() {
  const projects = getProjects();
  const statesList = getAllStates();

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Projects Portfolio & Delay-Risk Tower
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Statutory stage tracking, AI delay forecasting, and policy what-if simulation
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            {projects.length} National Projects
          </span>
        </div>
      </div>

      {/* Honest Prototype Banner */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-amber-900">
        <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs">
          <span className="font-bold">Prototype model trained on synthetic data: </span>
          <span>
            Delay predictions and risk levels are computed via an interpretable standardized linear regression model (held-out R² = 0.976, n = 3,000 synthetic projects). Not for official statutory determination.
          </span>
        </div>
      </div>

      {/* Main Table */}
      <ProjectsTable initialProjects={projects} statesList={statesList} />
    </div>
  );
}
