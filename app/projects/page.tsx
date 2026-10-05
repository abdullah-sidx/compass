import React from "react";
import { FolderKanban } from "lucide-react";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Projects
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Projects portfolio, AI delay-risk scores, and what-if simulation
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Chunk 0 Placeholder · Project Risk Engine arriving in Chunk 3
        </div>
      </div>

      <div className="card-white p-8 text-center flex flex-col items-center justify-center min-h-[360px]">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
          <FolderKanban className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">
          Projects Portfolio & Risk Engine
        </h3>
        <p className="text-sm text-slate-500 max-w-md mt-1 mb-4">
          Delay-risk prediction, feature impact breakdowns, and interactive what-if sliders will be built in Chunk 3.
        </p>
        <span className="text-xs font-medium px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
          Ready for Chunk 3
        </span>
      </div>
    </div>
  );
}
