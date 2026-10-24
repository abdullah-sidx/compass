"use client";

import React, { useState } from "react";
import { Compass as CompassIcon, Shield, ChevronDown, Bell, Menu, X } from "lucide-react";
import type { Role } from "@/lib/types";
import { useMobileMenu } from "@/app/mobile-menu-provider";

const roles: Role[] = [
  "Ministry",
  "State",
  "District",
  "RequiringBody",
  "FieldOfficer",
];

export default function Header() {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();
  const [selectedRole, setSelectedRole] = useState<Role>("Ministry");
  const [isOpen, setIsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleNotificationsKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setNotificationsOpen(!notificationsOpen);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Mobile hamburger menu */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
          className="p-2 md:hidden text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center z-20 relative"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

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

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification indicator */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            onKeyDown={handleNotificationsKeyDown}
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            aria-haspopup="menu"
            className="p-2 md:p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors relative min-h-[44px] min-w-[44px] flex items-center justify-center z-20 relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
              <div className="px-3 py-2 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Notifications
                  </span>
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(false)}
                    aria-label="Close notifications"
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Bell className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs text-slate-500 font-medium">No notifications</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    All caught up on project updates.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher Placeholder */}
        <div className="relative hidden sm:block">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition min-h-[44px]"
          >
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">Role: </span>
            <span className="font-semibold text-slate-900">{selectedRole}</span>
            <span className="text-[10px] text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded bg-white">Mock</span>
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
                  } min-h-[44px]`}
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
