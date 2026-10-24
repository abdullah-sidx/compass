"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import {
  LayoutDashboard,
  Layers,
  FolderKanban,
  GitFork,
  CreditCard,
  FileSpreadsheet,
  Settings,
} from "lucide-react";
import { useMobileMenu } from "@/app/mobile-menu-provider";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Land Parcels", href: "/parcels", icon: Layers },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Alignment Checker", href: "/alignment", icon: GitFork },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Reports", href: "/reports", icon: FileSpreadsheet },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  // Close mobile menu when the route changes. The previous pathname is tracked
  // with a ref so this effect only re-runs on navigation — NOT when
  // isMobileMenuOpen changes, which would close the drawer the instant it opens.
  useEffect(() => {
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;
    setIsMobileMenuOpen(false);
  }, [pathname, setIsMobileMenuOpen]);

  return (
    <aside
      aria-hidden={!isMobileMenuOpen}
      className={`bg-white flex flex-col flex-shrink-0 h-full overflow-y-auto transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen
          ? "fixed inset-y-0 left-0 z-50 w-64 shadow-xl transform translate-x-0"
          : "fixed inset-y-0 left-0 z-50 w-64 transform -translate-x-full pointer-events-none sm:static sm:flex sm:w-64 sm:border-r sm:border-slate-200 sm:transform-none sm:pointer-events-auto"
      }`}
    >
      {isMobileMenuOpen && (
        <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-slate-50">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Navigation
          </div>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close navigation menu"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="p-4 space-y-1 flex-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Main Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-50 text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              } min-h-[44px]`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? "text-blue-600" : "text-slate-400"
                }`}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Official Status Legend (AGENTS.md mandatory requirement) */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
          Status Legend
        </div>
        <div className="space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>Notified</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Under assessment</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>Compensation paid</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
            <span>Possession completed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span>Delayed / At risk</span>
          </div>
        </div>

        {/* Prototype notice */}
        <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-400 leading-snug">
          SIH26016 · SIH 2026 Prototype
          <br />
          Synthetic data only.
        </div>
      </div>
    </aside>
  );
}
