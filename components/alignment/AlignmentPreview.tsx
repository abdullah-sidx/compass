"use client";

import React, { useState } from "react";
import {
  GitFork,
  Sliders,
  CheckCircle2,
  Compass,
  Layers,
  MapPin,
  TrendingDown,
  Info,
} from "lucide-react";
import ParcelMapWrapper from "@/components/map/ParcelMapWrapper";
import { getParcels, getProjects } from "@/lib/data";

export default function AlignmentPreview() {
  const [corridorWidth, setCorridorWidth] = useState(60);
  const parcels = getParcels();
  const projects = getProjects();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Corridor Alignment Checker & Impact Analyzer
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <GitFork className="w-3 h-3 text-blue-600" />
              Arriving in Chunk 4
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Spatial buffer intersection, displacement minimisation, and comparative multi-route analysis
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            turf.js spatial intersection preview
          </span>
        </div>
      </div>

      {/* Corridor Width & Option Summary Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Alignment Option A */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-blue-200 p-5 shadow-sm bg-blue-50/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-600 text-white">
                Option A (Northern Spur)
              </span>
              <span className="text-[10px] font-mono text-slate-400">Baseline Alignment</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Affected Area:</span>
                <span className="font-bold text-slate-900">42.5 ha</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Parcels Intersected:</span>
                <span className="font-bold text-slate-900">22 parcels</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Families Displaced:</span>
                <span className="font-bold text-slate-900">63 families</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Est. Compensation:</span>
                <span className="font-bold text-slate-900">₹38.4 Cr</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Dispute Risk:</span>
                <span className="font-semibold text-rose-600">High (5 disputed parcels)</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Weighted Score: 68.4 / 100
          </div>
        </div>

        {/* Alignment Option B */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-emerald-300 p-5 shadow-sm bg-emerald-50/15 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
              <CheckCircle2 className="w-3 h-3" />
              Recommended
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-700 text-white">
                Option B (Ridge Bypass)
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Affected Area:</span>
                <span className="font-bold text-slate-900">34.8 ha (-18%)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Parcels Intersected:</span>
                <span className="font-bold text-slate-900">16 parcels</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Families Displaced:</span>
                <span className="font-bold text-emerald-700">38 families (-40%)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Est. Compensation:</span>
                <span className="font-bold text-emerald-700">₹29.2 Cr (-₹9.2 Cr)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Dispute Risk:</span>
                <span className="font-semibold text-emerald-700">Low (1 disputed parcel)</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-emerald-700 font-semibold">
            Weighted Score: 41.2 / 100 (Optimal Route)
          </div>
        </div>

        {/* Width Controls & Assumptions */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sliders className="w-4 h-4 text-slate-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase">
                Corridor Parameters
              </h3>
            </div>

            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-600 font-medium">Corridor Width:</span>
                <span className="font-bold text-slate-900 font-mono">{corridorWidth} meters</span>
              </div>
              <input
                type="range"
                min={20}
                max={200}
                step={5}
                value={corridorWidth}
                onChange={(e) => setCorridorWidth(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>20m (Narrow)</span>
                <span>Default: 60m</span>
                <span>200m (Broad RoW)</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800">Weights Configuration:</div>
              <div>• Displaced Families: <strong>40%</strong></div>
              <div>• Compensation Cost: <strong>40%</strong></div>
              <div>• Dispute Risk: <strong>20%</strong></div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Interactive centerline drawing arriving in Chunk 4.
          </div>
        </div>
      </div>

      {/* Map Preview Container */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden h-[460px] relative">
        <ParcelMapWrapper
          parcels={parcels}
          projects={projects}
          selectedState="All"
          selectedProjectId="All"
          selectedStatus="All"
          selectedUlpin={null}
          compact={false}
          showControls={true}
          showLegend={true}
          className="h-full"
        />
      </div>
    </div>
  );
}
