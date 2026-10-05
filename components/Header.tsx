"use client";

import React, { useState } from "react";
import { Compass as CompassIcon, Shield, ChevronDown, Bell } from "lucide-react";
import type { Role } from "@/lib/types";

const roles: Role[] = [
  "Ministry",
  "State",
  "District",
  "RequiringBody",
  "FieldOfficer",
];

export default function Header() {
  const [selectedRole, setSelectedRole] = useState<Role>("Ministry");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <CompassIcon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">Compass</span>
              <span className="text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                Sample data / Prototype
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal">
              National Land Acquisition Control Tower · Navigate land acquisition, on time.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification indicator */}
        <button
          type="button"
          aria-label="Notifications"
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors relative"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Role Switcher Placeholder */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition"
          >
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Role: <span className="font-semibold text-slate-900">{selectedRole}</span></span>
            <span className="text-[10px] text-slate-400 border border-slate-200 px-1 rounded bg-white">Mock</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 text-xs">
              <div className="px-3 py-1.5 font-semibold text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-100">
                Switch Demo Role (Used in Chunk 5)
              </div>
              {roles.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    selectedRole === role ? "font-semibold text-blue-600 bg-blue-50/50" : "text-slate-700"
                  }`}
                >
                  <span>{role}</span>
                  {selectedRole === role && <span className="text-blue-600 text-xs">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
