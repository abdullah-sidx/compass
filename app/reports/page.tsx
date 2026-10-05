import React from "react";
import { getStats, getProjects } from "@/lib/data";
import ReportsDashboard from "@/components/reports/ReportsDashboard";

export default function ReportsPage() {
  const stats = getStats();
  const projects = getProjects();

  return <ReportsDashboard stats={stats} projects={projects} />;
}
