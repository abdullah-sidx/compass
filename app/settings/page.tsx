import React from "react";
import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Settings & Configurations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            System parameters, demo data reset, and adapter configs
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Chunk 0 Placeholder
        </div>
      </div>

      <div className="card-white p-8 text-center flex flex-col items-center justify-center min-h-[360px]">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">
          System Settings & Demo Controls
        </h3>
        <p className="text-sm text-slate-500 max-w-md mt-1 mb-4">
          Demo state reset options, SLA configuration parameters, and mock adapter controls.
        </p>
        <span className="text-xs font-medium px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
          Ready for Chunk 5 & 8
        </span>
      </div>
    </div>
  );
}
