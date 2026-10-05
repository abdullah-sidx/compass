import React from "react";
import { GitFork } from "lucide-react";

export default function AlignmentPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Alignment Checker
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Corridor planning, parcel impact assessment, and route comparison
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Chunk 0 Placeholder · Alignment Checker arriving in Chunk 4
        </div>
      </div>

      <div className="card-white p-8 text-center flex flex-col items-center justify-center min-h-[360px]">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
          <GitFork className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">
          Corridor Alignment Checker
        </h3>
        <p className="text-sm text-slate-500 max-w-md mt-1 mb-4">
          Interactive corridor drawing, turf.js spatial buffer intersection, affected families and cost estimation will be built in Chunk 4.
        </p>
        <span className="text-xs font-medium px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
          Ready for Chunk 4
        </span>
      </div>
    </div>
  );
}
