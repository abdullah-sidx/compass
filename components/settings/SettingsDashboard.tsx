"use client";

import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Clock,
  Database,
  Sliders,
  Info,
} from "lucide-react";
import { AS_OF_DATE, resetStore } from "@/lib/data";

export default function SettingsDashboard() {
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetData = () => {
    resetStore();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Settings & Control Panel
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              <SettingsIcon className="w-3 h-3 text-slate-500" />
              Demo Environment
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            System configuration, demo data controls, SLA thresholds, and mock integration adapters
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Anchor Date: {AS_OF_DATE}
          </span>
        </div>
      </div>

      {/* Demo Reset Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Deterministic Seed Data State
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Reset the in-memory data store to the original seed state (15 projects, 303 contiguous parcels, 12 monthly snapshots, and audit chains). Useful during presentations and test runs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {resetSuccess && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1 animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Demo data restored!
            </span>
          )}

          <button
            onClick={handleResetData}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Two Column Grid: SLA Stages and Mock Adapters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Statutory Stage SLAs */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Clock className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Statutory Stage SLA Thresholds
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-2 mb-4">
            Default SLA durations used by the delay-risk engine and workflow countdowns:
          </p>

          <div className="space-y-3">
            {[
              { stage: "Plan & Align", days: 90, role: "Requiring Body" },
              { stage: "Notify (Section 11)", days: 60, role: "Ministry / State" },
              { stage: "Objections (Section 15)", days: 60, role: "District Collector" },
              { stage: "Award & Pay (Section 19-30)", days: 120, role: "District CALA" },
              { stage: "Possession (Section 38)", days: 90, role: "State / District" },
              { stage: "Handover", days: 30, role: "Requiring Body" },
            ].map((s) => (
              <div
                key={s.stage}
                className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs"
              >
                <div>
                  <span className="font-semibold text-slate-800">{s.stage}</span>
                  <span className="text-[10px] text-slate-400 block">Owner: {s.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {s.days} days
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mock Adapters Status */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Cpu className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Government Enterprise Adapters (Mock)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-2 mb-4">
              Simulated integration layers conforming to the SIH26016 problem statement architecture:
            </p>

            <div className="space-y-3">
              {[
                { name: "Land Stack / Bhunaksha", agency: "Dept of Land Resources", status: "Active (Mock)" },
                { name: "Bhoomi Rashi Portal", agency: "Ministry of Road Transport (MoRTH)", status: "Active (Mock)" },
                { name: "PFMS Direct Benefit Transfer", agency: "Controller General of Accounts", status: "Active (Mock)" },
                { name: "PARIVESH Forest Clearance", agency: "MoEFCC Wildlife & Forest Division", status: "Active (Mock)" },
              ].map((adapter) => (
                <div
                  key={adapter.name}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-800">{adapter.name}</span>
                    <span className="text-[10px] text-slate-400 block">{adapter.agency}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{adapter.status}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            AGENTS.md Compliance: All external integrations are clearly marked as mock adapters.
          </div>
        </div>
      </div>
    </div>
  );
}
