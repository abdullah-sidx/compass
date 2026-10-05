"use client";

import React, { useState, useMemo } from "react";
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Building2,
  Download,
  Filter,
} from "lucide-react";
import type { Payment } from "@/lib/types";
import { formatCurrencyCr } from "@/lib/formatters";

interface PaymentsDashboardProps {
  initialPayments: Payment[];
  totalCompDueCr: number;
  totalCompPaidCr: number;
}

export default function PaymentsDashboard({
  initialPayments,
  totalCompDueCr,
  totalCompPaidCr,
}: PaymentsDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const filteredPayments = useMemo(() => {
    return initialPayments.filter((pmt) => {
      if (selectedStatus !== "All" && pmt.status !== selectedStatus) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          pmt.referenceNo.toLowerCase().includes(q) ||
          pmt.parcelUlpin.toLowerCase().includes(q) ||
          pmt.projectId.toLowerCase().includes(q) ||
          pmt.beneficiaryMasked.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [initialPayments, selectedStatus, searchTerm]);

  const disbursedPct =
    totalCompDueCr > 0
      ? Math.round((totalCompPaidCr / totalCompDueCr) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Compensation Disbursement & PFMS Awards Tower
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Mock Adapter · PFMS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Direct benefit transfer records, Aadhaar-linked bank accounts, and statutory compensation awards
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            {initialPayments.length} PFMS Batches Recorded
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Compensation Award
          </span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {formatCurrencyCr(totalCompDueCr)}
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">
            Across 303 notified parcels
          </span>
        </div>

        <div className="bg-white rounded-xl border border-emerald-200/80 p-4 shadow-sm bg-emerald-50/20">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
            Total Disbursed (PFMS)
          </span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">
            {formatCurrencyCr(totalCompPaidCr)}
          </div>
          <span className="text-xs text-emerald-600/80 mt-0.5 block">
            {disbursedPct}% overall payout rate
          </span>
        </div>

        <div className="bg-white rounded-xl border border-amber-200/80 p-4 shadow-sm bg-amber-50/20">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
            Escrow / In Process
          </span>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">
            {formatCurrencyCr(Math.max(0, totalCompDueCr - totalCompPaidCr))}
          </div>
          <span className="text-xs text-amber-600/80 mt-0.5 block">
            Pending e-KYC or court escrow
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            PFMS Batch Status
          </span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            100%
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">
            Zero failed gateway transactions
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status filter tabs */}
        <div className="flex items-center gap-2">
          {["All", "Completed", "Processing"].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedStatus === st
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {st} {st === "All" ? `(${initialPayments.length})` : ""}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ULPIN, PFMS Ref, Beneficiary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Payment Ref / Txn ID</th>
                <th className="py-3 px-4">Parcel ULPIN</th>
                <th className="py-3 px-4">Project ID</th>
                <th className="py-3 px-4">Beneficiary</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No payment records match your filters.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((pmt) => (
                  <tr key={pmt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <div>{pmt.referenceNo}</div>
                      <span className="text-[10px] text-slate-400 font-sans">{pmt.id}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-blue-700 font-medium">
                      {pmt.parcelUlpin}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {pmt.projectId}
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium font-mono">
                      {pmt.beneficiaryMasked}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                      {formatCurrencyCr(pmt.amountCr)}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {pmt.date}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{pmt.status}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredPayments.length} of {initialPayments.length} disbursements</span>
          <span className="text-[11px] text-slate-400">Integrated PFMS mock disbursement gateway</span>
        </div>
      </div>
    </div>
  );
}
