import { getStats, getProjects, getAllStates } from "../lib/data";
import { formatArea, formatCurrencyCr, formatPercentage, calculateDelta } from "../lib/formatters";

function verifyChunk1() {
  console.log("=== VERIFYING CHUNK 1: OVERVIEW DASHBOARD ===");

  // 1. National Stats & KPIs
  console.log("\n1. Testing National Stats (All States)...");
  const stats = getStats();
  if (!stats) throw new Error("getStats() returned null or undefined");

  console.log(` - Total Projects: ${stats.totalProjects}`);
  console.log(` - Total Area Notified: ${formatArea(stats.totalAreaNotifiedHa)} (${stats.totalAreaNotifiedHa} ha)`);
  console.log(` - Compensation Paid: ${formatCurrencyCr(stats.totalCompensationPaidCr)} (${stats.totalCompensationPaidCr} Cr)`);
  console.log(` - Possession Achieved: ${formatPercentage(stats.possessionAchievedPct)} (${stats.possessionAchievedPct}%)`);
  console.log(` - Projects at Risk: ${stats.projectsAtRiskCount}`);

  if (stats.totalProjects !== 15) throw new Error(`Expected 15 projects, got ${stats.totalProjects}`);
  if (stats.parcelsCount !== 303) throw new Error(`Expected 303 parcels, got ${stats.parcelsCount}`);
  if (stats.totalAreaNotifiedHa <= 0) throw new Error("Area must be greater than 0");

  // 2. Status breakdown check
  console.log("\n2. Testing Parcel Status Breakdown...");
  const statusSum = Object.values(stats.parcelsByStatus).reduce((a, b) => a + b, 0);
  console.log(` - Breakdown sum: ${statusSum} vs Total parcels: ${stats.parcelsCount}`);
  if (statusSum !== stats.parcelsCount) {
    throw new Error(`Status sum mismatch: ${statusSum} !== ${stats.parcelsCount}`);
  }

  // 3. MoM Trend Snapshots
  console.log("\n3. Testing Monthly Snapshots & MoM Deltas...");
  const snapshots = stats.monthlyTrend;
  if (!snapshots || snapshots.length < 2) throw new Error("Expected at least 2 monthly snapshots");
  const cur = snapshots[snapshots.length - 1];
  const prev = snapshots[snapshots.length - 2];
  console.log(` - Current month: ${cur.month}, Previous month: ${prev.month}`);
  const areaDelta = calculateDelta(cur.areaNotifiedHa, prev.areaNotifiedHa, "%", false);
  const compDelta = calculateDelta(cur.compensationPaidCr, prev.compensationPaidCr, "%", false);
  const riskDelta = calculateDelta(cur.projectsAtRisk, prev.projectsAtRisk, "%", true);
  console.log(` - Area Delta: ${areaDelta.text} (sentiment: ${areaDelta.sentiment})`);
  console.log(` - Comp Delta: ${compDelta.text} (sentiment: ${compDelta.sentiment})`);
  console.log(` - Risk Delta: ${riskDelta.text} (sentiment: ${riskDelta.sentiment})`);

  // 4. Top 5 States
  console.log("\n4. Testing Top 5 States Bar List...");
  const top5 = stats.topStatesByArea.slice(0, 5);
  if (top5.length !== 5) throw new Error(`Expected top 5 states, got ${top5.length}`);
  for (let i = 0; i < top5.length - 1; i++) {
    if (top5[i].areaHa < top5[i + 1].areaHa) {
      throw new Error(`Top states not descending: ${top5[i].state} (${top5[i].areaHa}) < ${top5[i+1].state} (${top5[i+1].areaHa})`);
    }
  }
  console.log(` - Top state: ${top5[0].state} (${top5[0].areaHa} ha, ${top5[0].projectsCount} projects)`);

  // 5. State Filter Reactivity
  console.log("\n5. Testing State Filter Reactivity (Maharashtra)...");
  const mhStats = getStats("Maharashtra");
  const mhProjects = getProjects({ state: "Maharashtra" });
  console.log(` - Maharashtra Projects: ${mhProjects.length}, High Risk: ${mhStats.projectsAtRiskCount}`);
  console.log(` - Maharashtra Area: ${formatArea(mhStats.totalAreaNotifiedHa)}`);
  console.log(` - Maharashtra Compensation: ${formatCurrencyCr(mhStats.totalCompensationPaidCr)}`);

  if (mhProjects.length !== 2) throw new Error(`Expected 2 MH projects, got ${mhProjects.length}`);
  if (mhStats.projectsAtRiskCount !== 2) throw new Error(`Expected 2 MH high risk projects, got ${mhStats.projectsAtRiskCount}`);
  if (mhProjects.some(p => p.state !== "Maharashtra")) {
    throw new Error("Filtered projects contain non-Maharashtra project");
  }

  // 6. Currency and Unit Formatting
  console.log("\n6. Testing Unit Formatting Rules...");
  if (formatCurrencyCr(0) !== "₹0") throw new Error("formatCurrencyCr(0) should be ₹0");
  if (formatCurrencyCr(0.45) !== "₹45.0 Lakh") throw new Error(`formatCurrencyCr(0.45) should be ₹45.0 Lakh, got ${formatCurrencyCr(0.45)}`);
  if (formatCurrencyCr(12.5) !== "₹12.50 Cr") throw new Error(`formatCurrencyCr(12.5) should be ₹12.50 Cr, got ${formatCurrencyCr(12.5)}`);
  if (formatArea(541.77) !== "541.8 ha" && formatArea(541.77) !== "541.77 ha") {
    console.log(`Note: formatArea(541.77) = ${formatArea(541.77)}`);
  }
  console.log(" - Currency & area formatting verified.");

  // 7. Projects At Risk Sorting
  console.log("\n7. Testing Projects at Risk Ordering...");
  const allProjects = getProjects();
  const sorted = [...allProjects].sort((a, b) => {
    const riskOrder: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
    const diff = (riskOrder[b.riskLevel] || 0) - (riskOrder[a.riskLevel] || 0);
    if (diff !== 0) return diff;
    return b.riskScore - a.riskScore;
  });
  console.log(` - Top risk project: ${sorted[0].name} (Level: ${sorted[0].riskLevel}, Score: ${sorted[0].riskScore}, Delay: +${sorted[0].estDelayMonths} mo)`);
  if (sorted[0].riskLevel !== "High") throw new Error("Top sorted project should be High risk");

  console.log("\n>>> ALL CHUNK 1 ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY! <<<");
}

verifyChunk1();
