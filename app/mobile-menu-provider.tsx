"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface MobileMenuContextType {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const MobileMenuContext = createContext<MobileMenuContextType | undefined>(undefined);

export function MobileMenuProvider({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Prevent body scroll when mobile menu is open; restore on close/unmount
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <MobileMenuContext.Provider value={{ isMobileMenuOpen, setIsMobileMenuOpen }}>
      {children}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </MobileMenuContext.Provider>
  );
}

export function useMobileMenu() {
  const ctx = useContext(MobileMenuContext);
  if (!ctx) {
    throw new Error("useMobileMenu must be used within MobileMenuProvider");
  }
  return ctx;
}
