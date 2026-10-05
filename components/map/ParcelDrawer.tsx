"use client";

import React, { useState } from "react";
import {
  X,
  Copy,
  Check,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Users,
  Layers,
  ArrowRight,
  ShieldAlert,
  Building2,
  Banknote,
} from "lucide-react";
import type { Parcel, Project, ParcelStatus } from "@/lib/types";
import { formatArea, formatCurrencyCr } from "@/lib/formatters";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/geo";

interface ParcelDrawerProps {
  parcel: Parcel | null;
  project?: Project | null;
  onClose: () => void;
}

const STAGES_FLOW: { status: ParcelStatus; label: string; desc: string }[] = [
  { status: "Notified", label: "Notified", desc: "Preliminary notice issued" },
  { status: "UnderAssessment", label: "Under assessment", desc: "Joint verification & valuation" },
  { status: "CompensationPaid", label: "Compensation paid", desc: "Direct award transferred" },
  { status: "PossessionCompleted", label: "Possession completed", desc: "Demarcation & handover" },
];

export default function ParcelDrawer({ parcel, project, onClose }: ParcelDrawerProps) {
  const [copied, setCopied] = useState(false);

  if (!parcel) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(parcel.ulpin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusColor = STATUS_COLORS[parcel.status] || "#64748b";
  const statusLabel = STATUS_LABELS[parcel.status] || parcel.status;

  const compPct =
    parcel.compensationDue > 0
      ? Math.min(100, Math.round((parcel.compensationPaid / parcel.compensationDue) * 100))
      : 0;

  // Determine active step index in standard progression
  const currentStepIndex = STAGES_FLOW.findIndex((s) => s.status === parcel.status);
  const isDelayed = parcel.status === "Delayed";

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out">
      {/* Drawer Header */}
      <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/70">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-xs"
              style={{ backgroundColor: statusColor }}
            />
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${statusColor}15`,
                color: statusColor,
                border: `1px solid ${statusColor}30`,
              }}
            >
              {statusLabel}
            </span>
            {parcel.hasDispute && (
              <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                Disputed
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-mono font-bold text-slate-900 tracking-tight">
              {parcel.ulpin}
            </h2>
            <button
              onClick={handleCopy}
              title="Copy ULPIN to clipboard"
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Unique Land Parcel Identification Number (ULPIN)
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          aria-label="Close drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Project & Location Summary */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Project & Agency
              </p>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {project ? project.name : parcel.projectId}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {project ? `${project.agency} · ${project.sector.toUpperCase()}` : "Infrastructure Corridor"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 text-xs text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <span className="font-medium text-slate-800">{parcel.district}</span>
            <span className="text-slate-300">•</span>
            <span>{parcel.state}</span>
          </div>
        </div>

        {/* Dispute Warning if applicable */}
        {parcel.hasDispute && (
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold text-amber-900 block">Active Objection / Title Dispute</span>
              <p className="text-amber-800 mt-0.5 leading-relaxed">
                Objection filed under Section 15 / title inquiry pending. Requires SLAO resolution before possession handover.
              </p>
            </div>
          </div>
        )}

        {/* Parcel Attributes Grid */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            Parcel Specifications
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-medium">Area</span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {formatArea(parcel.areaHa)}
              </div>
              <span className="text-[10px] text-slate-400">Notified footprint</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-medium">Families Affected</span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {parcel.familiesAffected} {parcel.familiesAffected === 1 ? "family" : "families"}
              </div>
              <span className="text-[10px] text-slate-400">R&R registry</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-medium">Masked Landowner</span>
              <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono">
                {parcel.ownerMasked}
              </div>
              <span className="text-[10px] text-slate-400">Privacy protected</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-medium">Guidance Value</span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                ₹{(parcel.landValuePerHa / 100000).toFixed(1)} L / ha
              </div>
              <span className="text-[10px] text-slate-400">Circle rate benchmark</span>
            </div>
          </div>
        </div>

        {/* Compensation Disbursement Card */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Banknote className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">Compensation Progress</span>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {compPct}% Paid
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mt-3 mb-3">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${compPct}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 text-[11px]">Total Award Due:</span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">
                {formatCurrencyCr(parcel.compensationDue / 10000000)}
              </p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">Disbursed (PFMS):</span>
              <p className="font-bold text-emerald-700 text-sm mt-0.5">
                {formatCurrencyCr(parcel.compensationPaid / 10000000)}
              </p>
            </div>
          </div>
        </div>

        {/* Status Lifecycle Timeline */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            Acquisition Lifecycle
          </h4>

          {isDelayed && (
            <div className="mb-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>Project timeline is currently flagging an acquisition delay for this parcel.</span>
            </div>
          )}

          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {STAGES_FLOW.map((st, idx) => {
              const isPast = currentStepIndex > idx || parcel.status === "PossessionCompleted";
              const isCurrent = currentStepIndex === idx && !isDelayed;

              return (
                <div key={st.status} className="relative flex items-start gap-3">
                  <div
                    className={`absolute -left-6 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${
                      isPast
                        ? "bg-emerald-600 ring-2 ring-emerald-100"
                        : isCurrent
                        ? "bg-blue-600 ring-4 ring-blue-100 animate-pulse"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {isPast ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                  </div>
                  <div>
                    <p
                      className={`text-xs font-semibold ${
                        isCurrent ? "text-blue-700" : isPast ? "text-slate-800" : "text-slate-400"
                      }`}
                    >
                      {st.label}
                    </p>
                    <p className="text-[11px] text-slate-500">{st.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
        <span className="text-[11px] text-slate-400 font-mono">
          CRS: EPSG:4326 · WGS84
        </span>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
