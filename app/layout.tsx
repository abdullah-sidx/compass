import type { Metadata, Viewport } from "next";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { MobileMenuProvider } from "@/app/mobile-menu-provider";

export const metadata: Metadata = {
  title: "Compass - National Land Acquisition Control Tower",
  description: "Navigate land acquisition, on time. Real-Time National Land Acquisition & Management System (SIH 2026 Prototype).",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-50 text-slate-900 flex flex-col antialiased md:overflow-hidden">
        <MobileMenuProvider>
          <Header />
          <div className="flex flex-1 overflow-hidden min-h-0 relative">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6 lg:p-8 min-h-0 webkit-scroll-touch">
              <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto">
                {children}
              </div>
            </main>
          </div>
        </MobileMenuProvider>
      </body>
    </html>
  );
}
