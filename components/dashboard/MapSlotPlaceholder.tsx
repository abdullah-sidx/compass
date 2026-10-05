"use client";

import React from "react";
import { Map, Layers, Compass, Globe, Navigation, Eye } from "lucide-react";
import type { StatsResponse } from "@/lib/types";
import { formatArea } from "@/lib/formatters";

interface MapSlotPlaceholderProps {
  stats: StatsResponse;
  selectedState: string;
}

export default function MapSlotPlaceholder({
  stats,
  selectedState,
}: MapSlotPlaceholderProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col h-full min-h-[560px] overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Land Acquisition Map
            </h2>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Chunk 2 Slot
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            GIS spatial boundary visualization & corridor status
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span>
            {selectedState !== "All" ? selectedState : "National Corridors"}
          </span>
        </div>
      </div>

      {/* Reserved Map Viewport */}
      <div className="relative flex-1 bg-gradient-to-b from-slate-50 to-slate-100/60 p-6 flex flex-col justify-between overflow-hidden">
        {/* Subtle Topographical GIS Grid Background Pattern */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#1e40af 1px, transparent 1px), radial-gradient(#1e40af 1px, #f8fafc 1px)`,
            backgroundSize: "24px 24px",
            backgroundPosition: "0 0, 12px 12px",
          }}
        />

        {/* Top Floating Control Badges */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-xs rounded-md shadow-2xs border border-slate-200/80 text-[10px] font-mono text-slate-600">
            <Globe className="w-3 h-3 text-blue-600" />
            <span>CRS: EPSG:4326 (WGS 84)</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-xs rounded-md shadow-2xs border border-slate-200/80 text-[10px] font-mono text-slate-600">
            <Navigation className="w-3 h-3 text-emerald-600" />
            <span>Target: {selectedState !== "All" ? selectedState : "All India"}</span>
          </div>
        </div>

        {/* Center Informational Card */}
        <div className="relative z-10 max-w-sm mx-auto my-auto text-center p-6 bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-sm ring-4 ring-blue-50">
            <Map className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Interactive GIS Parcel Map
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            MapLibre GL JS vector layer with ULPIN parcel polygons, project corridor alignment buffers, and status heatmaps arriving in Chunk 2.
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-around text-xs">
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Parcels</p>
              <p className="font-bold text-slate-800 text-sm">{stats.parcelsCount}</p>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Area</p>
              <p className="font-bold text-slate-800 text-sm">{formatArea(stats.totalAreaNotifiedHa)}</p>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Projects</p>
              <p className="font-bold text-slate-800 text-sm">{stats.totalProjects}</p>
            </div>
          </div>
        </div>

        {/* Bottom Legend Preview matching AGENTS.md colors */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-slate-200/60 bg-white/80 backdrop-blur-xs px-3 py-2 rounded-lg text-[10px] text-slate-600">
          <span className="font-semibold text-slate-400 uppercase tracking-wider text-[9px]">
            GIS Legend:
          </span>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Notified</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Under assessment</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Comp paid</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            <span>Possession</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            <span>Delayed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
