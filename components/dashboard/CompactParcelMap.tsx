"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Map, Layers, ExternalLink, Globe, Navigation } from "lucide-react";
import type { StatsResponse, Parcel, Project } from "@/lib/types";
import { formatArea } from "@/lib/formatters";
import { getParcels, getProjects } from "@/lib/data";
import ParcelMapWrapper from "@/components/map/ParcelMapWrapper";
import ParcelDrawer from "@/components/map/ParcelDrawer";

interface CompactParcelMapProps {
  stats: StatsResponse;
  selectedState: string;
}

export default function CompactParcelMap({
  stats,
  selectedState,
}: CompactParcelMapProps) {
  const [allParcels] = useState<Parcel[]>(() => getParcels());
  const [allProjects] = useState<Project[]>(() => getProjects());
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);

  // Find project of selected parcel
  const selectedProject = useMemo(() => {
    if (!selectedParcel) return null;
    return allProjects.find((p) => p.id === selectedParcel.projectId) || null;
  }, [selectedParcel, allProjects]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col h-full min-h-[400px] md:min-h-[560px] overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-4 pb-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Land Acquisition Map
            </h2>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live GIS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Spatial corridor alignments & parcel boundary statuses
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {selectedState !== "All" ? selectedState : "National Corridors"}
            </span>
          </div>

          <Link
            href="/parcels"
            className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50/70 hover:bg-blue-100/70 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors"
            title="Open full-screen Land Parcels Explorer"
          >
            <span>Full Map</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Compact Map Viewport */}
      <div className="relative flex-1 w-full h-full min-h-[320px] md:min-h-[460px] overflow-hidden">
        <ParcelMapWrapper
          parcels={allParcels}
          projects={allProjects}
          selectedState={selectedState}
          selectedUlpin={selectedParcel?.ulpin || null}
          onSelectParcel={(p) => setSelectedParcel(p)}
          compact={true}
          showControls={false}
          showLegend={true}
          className="h-full"
        />

        {/* Floating Bottom Quick Stat Bar */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-3 px-3 py-1.5 bg-white/90 backdrop-blur-xs rounded-lg shadow-2xs border border-slate-200 text-xs text-slate-600">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-semibold mr-1">Parcels:</span>
            <span className="font-bold text-slate-900">{stats.parcelsCount}</span>
          </div>
          <div className="h-3 w-px bg-slate-200" />
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-semibold mr-1">Area:</span>
            <span className="font-bold text-slate-900">{formatArea(stats.totalAreaNotifiedHa)}</span>
          </div>
        </div>
      </div>

      {/* Parcel Drawer when a parcel is clicked on the overview map */}
      <ParcelDrawer
        parcel={selectedParcel}
        project={selectedProject}
        onClose={() => setSelectedParcel(null)}
      />
    </div>
  );
}
