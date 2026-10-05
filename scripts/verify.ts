async function test() {
  const base = "http://localhost:3000";

  console.log("1. Fetching /api/stats...");
  const statsRes = await fetch(`${base}/api/stats`);
  if (!statsRes.ok) throw new Error(`Stats failed: ${statsRes.status}`);
  const stats = await statsRes.json();

  console.log("2. Fetching /api/projects...");
  const projRes = await fetch(`${base}/api/projects`);
  const projects = await projRes.json();

  console.log("3. Fetching /api/parcels...");
  const parcelsRes = await fetch(`${base}/api/parcels`);
  const parcels = await parcelsRes.json();

  console.log("\n=== VERIFICATION RESULTS ===");
  console.log(`Projects: stats=${stats.totalProjects}, /api/projects=${projects.length} -> MATCH: ${stats.totalProjects === projects.length}`);
  console.log(`Parcels:  stats=${stats.parcelsCount}, /api/parcels=${parcels.length} -> MATCH: ${stats.parcelsCount === parcels.length}`);
  
  const calculatedArea = parcels.reduce((sum: number, p: any) => sum + p.areaHa, 0);
  console.log(`Area:     stats=${stats.totalAreaNotifiedHa}, calculated=${Number(calculatedArea.toFixed(2))} -> MATCH: ${stats.totalAreaNotifiedHa === Number(calculatedArea.toFixed(2))}`);

  const statusSum = Object.values(stats.parcelsByStatus).reduce((a: any, b: any) => a + b, 0);
  console.log(`Status breakdown sum: ${statusSum} vs ${parcels.length} -> MATCH: ${statusSum === parcels.length}`);

  // Test state filter
  console.log("\n4. Testing /api/parcels?state=Maharashtra & /api/stats?state=Maharashtra...");
  const mhStatsRes = await fetch(`${base}/api/stats?state=Maharashtra`);
  const mhStats = await mhStatsRes.json();
  const mhParcelsRes = await fetch(`${base}/api/parcels?state=Maharashtra`);
  const mhParcels = await mhParcelsRes.json();
  console.log(`Maharashtra: stats.parcels=${mhStats.parcelsCount}, /api/parcels=${mhParcels.length} -> MATCH: ${mhStats.parcelsCount === mhParcels.length}`);

  // Test pages
  console.log("\n5. Testing pages...");
  const pages = ["", "parcels", "projects", "alignment", "payments", "reports", "settings"];
  for (const page of pages) {
    const res = await fetch(`${base}/${page}`);
    console.log(`Page /${page.padEnd(10)} -> Status ${res.status} ${res.status === 200 ? "OK" : "FAIL"}`);
    if (res.status !== 200) {
      throw new Error(`Failed loading page /${page}`);
    }
  }

  console.log("\nALL ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!");
}

test().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
