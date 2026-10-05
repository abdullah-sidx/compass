import { getParcels, getProjects, getAllStates } from "../lib/data";
import {
  STATUS_COLORS,
  buildParcelsGeoJson,
  buildProjectClustersGeoJson,
  buildProjectCorridorsGeoJson,
  getBoundsForParcels,
  INDIA_BOUNDS,
} from "../lib/geo";

function verifyChunk2() {
  console.log("=== VERIFYING CHUNK 2: GIS MAP & PARCELS EXPLORER ===");

  // 1. Data sanity
  const parcels = getParcels();
  const projects = getProjects();
  const states = getAllStates();

  console.log(`\n1. Testing Parcel and Project counts...`);
  console.log(` - Total Parcels: ${parcels.length}`);
  console.log(` - Total Projects: ${projects.length}`);
  console.log(` - Total States: ${states.length}`);

  if (parcels.length !== 303) throw new Error(`Expected 303 parcels, got ${parcels.length}`);
  if (projects.length !== 15) throw new Error(`Expected 15 projects, got ${projects.length}`);

  // 2. ULPIN format
  console.log(`\n2. Testing 14-character ULPIN compliance...`);
  const ulpinRegex = /^[A-Z0-9]{14}$/;
  for (const p of parcels) {
    if (!ulpinRegex.test(p.ulpin)) {
      throw new Error(`Invalid ULPIN format: "${p.ulpin}" on parcel in ${p.state}`);
    }
  }
  console.log(` - Verified all 303 parcels conform to 14-char alphanumeric ULPIN specification.`);

  // 3. Status colors check against AGENTS.md
  console.log(`\n3. Verifying status colors against AGENTS.md requirements...`);
  const requiredColors = {
    Notified: "#2563eb",            // blue
    UnderAssessment: "#f59e0b",     // amber
    CompensationPaid: "#10b981",    // green
    PossessionCompleted: "#8b5cf6", // purple
    Delayed: "#ef4444",             // red
  };

  for (const [status, hex] of Object.entries(requiredColors)) {
    if (STATUS_COLORS[status as keyof typeof requiredColors] !== hex) {
      throw new Error(`Color mismatch for ${status}: expected ${hex}, got ${STATUS_COLORS[status as keyof typeof requiredColors]}`);
    }
    console.log(` - ${status}: ${hex} OK`);
  }

  // 4. GeoJSON parcel polygons
  console.log(`\n4. Testing buildParcelsGeoJson()...`);
  const parcelsGeoJson = buildParcelsGeoJson(parcels);
  if (parcelsGeoJson.type !== "FeatureCollection") throw new Error("Expected FeatureCollection");
  if (parcelsGeoJson.features.length !== 303) {
    throw new Error(`Expected 303 polygon features, got ${parcelsGeoJson.features.length}`);
  }

  const sampleFeature = parcelsGeoJson.features[0];
  if (sampleFeature.geometry.type !== "Polygon") throw new Error("Expected Polygon geometry");
  if (!sampleFeature.properties || !sampleFeature.properties.ulpin || !sampleFeature.properties.color) {
    throw new Error("Missing required properties on GeoJSON parcel feature");
  }
  console.log(` - GeoJSON Polygon FeatureCollection valid: sample ULPIN ${sampleFeature.properties.ulpin} in ${sampleFeature.properties.district}`);

  // 5. Project clusters at low zoom
  console.log(`\n5. Testing buildProjectClustersGeoJson()...`);
  const clustersGeoJson = buildProjectClustersGeoJson(projects, parcels);
  if (clustersGeoJson.features.length !== 15) {
    throw new Error(`Expected 15 project clusters, got ${clustersGeoJson.features.length}`);
  }

  for (const feat of clustersGeoJson.features) {
    if (feat.geometry.type !== "Point") throw new Error("Cluster feature must be Point");
    const p = feat.properties;
    if (p.parcelsCount <= 0) throw new Error(`Cluster ${p.name} has 0 parcels`);
    if (!p.worstStatus || !p.worstStatusColor) throw new Error(`Cluster ${p.name} missing worstStatus`);
    if (!p.bounds || p.bounds.length !== 4) throw new Error(`Cluster ${p.name} missing bounds`);
  }
  console.log(` - Generated 15 valid cluster centroids with worst status severity, radius, and bounds.`);

  // 6. Project corridors
  console.log(`\n6. Testing buildProjectCorridorsGeoJson()...`);
  const corridorsGeoJson = buildProjectCorridorsGeoJson(projects, parcels);
  if (corridorsGeoJson.features.length !== 15) {
    throw new Error(`Expected 15 corridor LineStrings, got ${corridorsGeoJson.features.length}`);
  }
  for (const c of corridorsGeoJson.features) {
    if (c.geometry.type !== "LineString") throw new Error("Corridor must be LineString");
    if (c.geometry.coordinates.length < 2) throw new Error("Corridor must have >= 2 coordinates");
  }
  console.log(` - Generated 15 valid project corridor alignment LineStrings.`);

  // 7. State filter reactivity
  console.log(`\n7. Testing State filtering on GeoJSON...`);
  const mhParcelsGeoJson = buildParcelsGeoJson(parcels, { state: "Maharashtra" });
  const mhClustersGeoJson = buildProjectClustersGeoJson(projects, parcels, "Maharashtra");
  console.log(` - Maharashtra parcels: ${mhParcelsGeoJson.features.length}, clusters: ${mhClustersGeoJson.features.length}`);
  if (mhParcelsGeoJson.features.length !== 45) {
    throw new Error(`Expected 45 parcels in Maharashtra (PRJ-001: 22 + PRJ-013: 23), got ${mhParcelsGeoJson.features.length}`);
  }
  if (mhClustersGeoJson.features.length !== 2) {
    throw new Error(`Expected 2 project clusters in Maharashtra, got ${mhClustersGeoJson.features.length}`);
  }

  // 8. Bounding box computation
  console.log(`\n8. Testing Bounding Box calculation...`);
  const mhParcels = parcels.filter(p => p.state === "Maharashtra");
  const bounds = getBoundsForParcels(mhParcels);
  if (!bounds) throw new Error("getBoundsForParcels returned null");
  console.log(` - Maharashtra Bounds: SW [${bounds[0][0].toFixed(2)}, ${bounds[0][1].toFixed(2)}], NE [${bounds[1][0].toFixed(2)}, ${bounds[1][1].toFixed(2)}]`);
  if (bounds[0][0] >= bounds[1][0] || bounds[0][1] >= bounds[1][1]) {
    throw new Error("Invalid bounding box geometry");
  }

  console.log(`\n>>> ALL CHUNK 2 ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY! <<<`);
}

verifyChunk2();
