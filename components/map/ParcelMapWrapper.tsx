"use client";

import dynamic from "next/dynamic";
import React from "react";
import type { ParcelMapProps } from "./ParcelMap";
import { Loader2 } from "lucide-react";

const ParcelMapClient = dynamic(() => import("./ParcelMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[360px] bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
      <p className="text-xs font-medium text-slate-600">Initializing GIS Map Engine...</p>
      <span className="text-[11px] text-slate-400 mt-0.5">MapLibre GL · CARTO Positron Vector Basemap</span>
    </div>
  ),
});

export default function ParcelMapWrapper(props: ParcelMapProps) {
  return <ParcelMapClient {...props} />;
}
