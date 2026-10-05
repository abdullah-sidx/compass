"use client";

import React from "react";
import {
  FileSpreadsheet,
  Download,
  FileText,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Layers,
  Building2,
  ExternalLink,
} from "lucide-react";
import type { StatsResponse, Project } from "@/lib/types";
import { formatArea, formatCurrencyCr } from "@/lib/formatters";

interface ReportsDashboardProps {
  stats: StatsResponse;
  projects: Project[];
}

export default function ReportsDashboard({
  stats,
  projects,
}: ReportsDashboardProps) {
  const handleDownloadMock = (reportName: string) => {
    alert(`[Compass Prototype Demo] Generating "${reportName}" export.\n\nAll synthetic data deterministically anchored to 2026-10-05.`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Reports & Statutory Compliance Center
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <FileSpreadsheet className="w-3 h-3 text-blue-600" />
              Executive Digests
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Export statutory gazette schedules, MoM executive summaries, and PFMS reconciliation digests
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            As of 5 Oct 2026 · 10 States Tracked
          </span>
        </div>
      </div>

      {/* Featured Download Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Report 1 */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow transition-shadow flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              National Monthly Digest
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Comprehensive 15-project portfolio progress, compensation milestones, and possession stats.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono">PDF · Sep 2026</span>
            <button
              onClick={() => handleDownloadMock("National Monthly Digest (Sep 2026)")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Report 2 */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow transition-shadow flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Delay-Risk Escalation Memo
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              SLMC briefing on 5 high-risk corridors, top statutory objections, and Stage-I forest clearance delays.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono">PDF · AI Delay Model</span>
            <button
              onClick={() => handleDownloadMock("Delay-Risk Escalation Memo")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Report 3 */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow transition-shadow flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Cryptographic Audit Log
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              SHA-256 hash-chained immutable audit trail covering stage approvals and statutory determinations.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono">JSON / CSV</span>
            <button
              onClick={() => handleDownloadMock("Cryptographic Audit Log Certificate")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-800"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Report 4 */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow transition-shadow flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              PFMS Award Disbursement
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Direct benefit transfer payout schedule, masked beneficiary ledger, and bank account reconciliation.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono">XLSX · 29 Batches</span>
            <button
              onClick={() => handleDownloadMock("PFMS Disbursement Ledger")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* State Compliance Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              State-wise Land Acquisition Compliance Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative progress, compensation rate, and statutory SLA health across tracked states
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4">Tracked Area (ha)</th>
                <th className="py-3 px-4">Projects</th>
                <th className="py-3 px-4">Risk Health</th>
                <th className="py-3 px-4">SLA Compliance Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.topStatesByArea.map((st) => {
                const stProjects = projects.filter((p) => p.state === st.state);
                const highRisk = stProjects.filter((p) => p.riskLevel === "High").length;

                return (
                  <tr key={st.state} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {st.state}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {formatArea(st.areaHa)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {st.projectsCount} {st.projectsCount === 1 ? "project" : "projects"}
                    </td>
                    <td className="py-3 px-4">
                      {highRisk > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                          {highRisk} High Risk
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          On Schedule
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-600 font-medium">
                        {highRisk > 0 ? "SLMC Escalation Required" : "Statutory Stages Approved"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDownloadMock(`${st.state} State Land Compliance Summary`)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                      >
                        Download PDF
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
