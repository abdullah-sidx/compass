"use client";

import React from "react";
import type { RecommendedAction } from "@/lib/risk";
import { CheckCircle2, ChevronRight, Lightbulb, ShieldAlert, Sparkles } from "lucide-react";

interface RecommendedActionsProps {
  actions: RecommendedAction[];
  isSimulated?: boolean;
}

export default function RecommendedActions({
  actions,
  isSimulated = false,
}: RecommendedActionsProps) {
  const getBadgeStyle = (badge: RecommendedAction["badge"]) => {
    switch (badge) {
      case "Urgent":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Statutory":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Operational":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
              Recommended Interventions
            </h3>
            <p className="text-[11px] text-slate-500">
              Rule-based policy mitigations for top delay drivers
            </p>
          </div>
        </div>

        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          3 Priority Actions
        </span>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-2 flex-1">
        {actions.map((act, index) => (
          <div
            key={act.id}
            className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 transition-all flex flex-col justify-between gap-2"
          >
            <div>
              {/* Top Row: Priority Badge & Impact */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getBadgeStyle(
                    act.badge
                  )}`}
                >
                  {act.badge}
                </span>

                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {act.estimatedImpact}
                </span>
              </div>

              {/* Title */}
              <h4 className="text-xs font-bold text-slate-900 leading-snug">
                <span className="text-slate-400 font-mono text-[10px] mr-1">
                  #{index + 1}
                </span>
                {act.title}
              </h4>

              {/* Description */}
              <p className="text-[11px] text-slate-600 leading-relaxed mt-1.5">
                {act.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1 text-slate-400">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>Simulate impacts below</span>
        </span>
        <span className="text-slate-400 font-mono text-[10px]">
          SIH-26016 Decision Matrix
        </span>
      </div>
    </div>
  );
}
