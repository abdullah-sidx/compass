import React from "react";
import { CreditCard } from "lucide-react";

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Payments & Disbursement
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Direct benefit transfer, compensation awards, and mock PFMS integration
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Chunk 0 Placeholder
        </div>
      </div>

      <div className="card-white p-8 text-center flex flex-col items-center justify-center min-h-[360px]">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
          <CreditCard className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">
          Compensation Disbursement Tracking
        </h3>
        <p className="text-sm text-slate-500 max-w-md mt-1 mb-4">
          Direct benefit transfer records, PFMS mock adapter transactions, and award escrow accounts.
        </p>
        <span className="text-xs font-medium px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
          Mock Adapter · PFMS
        </span>
      </div>
    </div>
  );
}
