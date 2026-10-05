import type { Metadata } from "next";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Compass - National Land Acquisition Control Tower",
  description: "Navigate land acquisition, on time. Real-Time National Land Acquisition & Management System (SIH 2026 Prototype).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-50 text-slate-900 flex flex-col antialiased overflow-hidden">
        <Header />
        <div className="flex flex-1 overflow-hidden min-h-0">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8 min-h-0">
            <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
