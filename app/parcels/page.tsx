import React from "react";
import { Layers } from "lucide-react";

export default function ParcelsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Land Parcels
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            GIS map, ULPIN search, and parcel lifecycle details
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Chunk 0 Placeholder · Full GIS Map arriving in Chunk 2
        </div>
      </div>

      <div className="card-white p-8 text-center flex flex-col items-center justify-center min-h-[360px]">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">
          Land Parcels Explorer
        </h3>
        <p className="text-sm text-slate-500 max-w-md mt-1 mb-4">
          Interactive MapLibre GIS map with ULPIN-keyed parcel details drawer, status filtering, and project corridors will be built in Chunk 2.
        </p>
        <span className="text-xs font-medium px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
          Ready for Chunk 2
        </span>
      </div>
    </div>
  );
}
