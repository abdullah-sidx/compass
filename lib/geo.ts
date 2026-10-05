import type { FeatureCollection, Feature, Polygon, Point, LineString, Position } from "geojson";
import type { Parcel, Project, ParcelStatus } from "./types";

export const STATUS_COLORS: Record<ParcelStatus, string> = {
  Notified: "#2563eb",            // Blue
  UnderAssessment: "#f59e0b",     // Amber
  CompensationPaid: "#10b981",    // Green
  PossessionCompleted: "#8b5cf6", // Purple
  Delayed: "#ef4444",             // Red
};

export const STATUS_LABELS: Record<ParcelStatus, string> = {
  Notified: "Notified",
  UnderAssessment: "Under assessment",
  CompensationPaid: "Compensation paid",
  PossessionCompleted: "Possession completed",
  Delayed: "Delayed / At risk",
};

// Priority order for calculating "worst status" in a cluster
const STATUS_PRIORITY: Record<ParcelStatus, number> = {
  Delayed: 5,
  UnderAssessment: 4,
  Notified: 3,
  CompensationPaid: 2,
  PossessionCompleted: 1,
};

export const INDIA_CENTER: [number, number] = [78.9629, 20.5937];
export const INDIA_BOUNDS: [[number, number], [number, number]] = [
  [68.1, 6.7],   // Southwest
  [97.4, 35.7],  // Northeast
];

export const CARTO_STYLE_URL = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

// Fallback style for offline or if CARTO basemap fails to load
export const FALLBACK_LIGHT_STYLE = {
  version: 8,
  name: "Compass Fallback Light",
  sources: {},
  layers: [
    {
      id: "background",
      type: "background",
      paint: {
        "background-color": "#f8fafc",
      },
    },
  ],
};

/**
 * Builds GeoJSON FeatureCollection for parcels
 */
export function buildParcelsGeoJson(
  parcels: Parcel[],
  filters?: { state?: string; projectId?: string; status?: string }
): FeatureCollection<Polygon> {
  let filtered = parcels;
  if (filters?.state && filters.state.toLowerCase() !== "all") {
    filtered = filtered.filter(
      (p) => p.state.toLowerCase() === filters.state!.toLowerCase()
    );
  }
  if (filters?.projectId && filters.projectId.toLowerCase() !== "all") {
    filtered = filtered.filter(
      (p) => p.projectId.toLowerCase() === filters.projectId!.toLowerCase()
    );
  }
  if (filters?.status && filters.status.toLowerCase() !== "all") {
    filtered = filtered.filter(
      (p) => p.status.toLowerCase() === filters.status!.toLowerCase()
    );
  }

  const features: Feature<Polygon>[] = filtered.map((p) => ({
    type: "Feature",
    id: p.ulpin,
    properties: {
      ulpin: p.ulpin,
      projectId: p.projectId,
      state: p.state,
      district: p.district,
      areaHa: p.areaHa,
      status: p.status,
      color: STATUS_COLORS[p.status] || "#64748b",
      ownerMasked: p.ownerMasked,
      familiesAffected: p.familiesAffected,
      landValuePerHa: p.landValuePerHa,
      compensationDue: p.compensationDue,
      compensationPaid: p.compensationPaid,
      hasDispute: p.hasDispute ? 1 : 0,
    },
    geometry: p.geometry,
  }));

  return {
    type: "FeatureCollection",
    features,
  };
}

export interface ProjectClusterProperties {
  projectId: string;
  name: string;
  agency: string;
  sector: string;
  state: string;
  parcelsCount: number;
  totalAreaHa: number;
  worstStatus: ParcelStatus;
  worstStatusColor: string;
  radius: number;
  bounds: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
}

/**
 * Builds GeoJSON FeatureCollection for project clusters at low zoom
 */
export function buildProjectClustersGeoJson(
  projects: Project[],
  parcels: Parcel[],
  stateFilter?: string
): FeatureCollection<Point, ProjectClusterProperties> {
  const filteredProjects =
    stateFilter && stateFilter.toLowerCase() !== "all"
      ? projects.filter((p) => p.state.toLowerCase() === stateFilter.toLowerCase())
      : projects;

  const features: Feature<Point, ProjectClusterProperties>[] = [];

  for (const prj of filteredProjects) {
    const prjParcels = parcels.filter((p) => p.projectId === prj.id);
    if (prjParcels.length === 0) continue;

    // Calculate centroid and bounding box
    let minLng = Infinity;
    let minLat = Infinity;
    let maxLng = -Infinity;
    let maxLat = -Infinity;
    let sumLng = 0;
    let sumLat = 0;
    let count = 0;

    for (const p of prjParcels) {
      for (const ring of p.geometry.coordinates) {
        for (const coord of ring) {
          const lng = coord[0];
          const lat = coord[1];
          sumLng += lng;
          sumLat += lat;
          count++;
          if (lng < minLng) minLng = lng;
          if (lat < minLat) minLat = lat;
          if (lng > maxLng) maxLng = lng;
          if (lat > maxLat) maxLat = lat;
        }
      }
    }

    const centerLng = sumLng / count;
    const centerLat = sumLat / count;

    // Determine worst status among project's parcels
    let worstStatus: ParcelStatus = "PossessionCompleted";
    let maxPriority = 0;

    for (const p of prjParcels) {
      const priority = STATUS_PRIORITY[p.status] || 0;
      if (priority > maxPriority) {
        maxPriority = priority;
        worstStatus = p.status;
      }
    }

    const totalAreaHa = Number(
      prjParcels.reduce((sum, p) => sum + p.areaHa, 0).toFixed(1)
    );

    // Dynamic circle radius based on parcel count (14px - 24px)
    const radius = Math.min(26, Math.max(14, Math.round(12 + prjParcels.length * 0.5)));

    features.push({
      type: "Feature",
      id: prj.id,
      properties: {
        projectId: prj.id,
        name: prj.name,
        agency: prj.agency,
        sector: prj.sector,
        state: prj.state,
        parcelsCount: prjParcels.length,
        totalAreaHa,
        worstStatus,
        worstStatusColor: STATUS_COLORS[worstStatus] || "#64748b",
        radius,
        bounds: [minLng, minLat, maxLng, maxLat],
      },
      geometry: {
        type: "Point",
        coordinates: [Number(centerLng.toFixed(6)), Number(centerLat.toFixed(6))],
      },
    });
  }

  return {
    type: "FeatureCollection",
    features,
  };
}

/**
 * Builds GeoJSON FeatureCollection of project corridor lines
 */
export function buildProjectCorridorsGeoJson(
  projects: Project[],
  parcels: Parcel[],
  stateFilter?: string
): FeatureCollection<LineString> {
  const filteredProjects =
    stateFilter && stateFilter.toLowerCase() !== "all"
      ? projects.filter((p) => p.state.toLowerCase() === stateFilter.toLowerCase())
      : projects;

  const features: Feature<LineString>[] = [];

  for (const prj of filteredProjects) {
    const prjParcels = parcels.filter((p) => p.projectId === prj.id);
    if (prjParcels.length < 2) continue;

    // Build center line by computing centroid of each parcel in order
    const lineCoordinates: Position[] = [];

    for (const p of prjParcels) {
      let pSumLng = 0;
      let pSumLat = 0;
      const coords = p.geometry.coordinates[0];
      for (let i = 0; i < coords.length - 1; i++) {
        pSumLng += coords[i][0];
        pSumLat += coords[i][1];
      }
      const ptCount = coords.length - 1;
      lineCoordinates.push([
        Number((pSumLng / ptCount).toFixed(6)),
        Number((pSumLat / ptCount).toFixed(6)),
      ]);
    }

    features.push({
      type: "Feature",
      id: `corridor-${prj.id}`,
      properties: {
        projectId: prj.id,
        name: prj.name,
        agency: prj.agency,
        state: prj.state,
        sector: prj.sector,
      },
      geometry: {
        type: "LineString",
        coordinates: lineCoordinates,
      },
    });
  }

  return {
    type: "FeatureCollection",
    features,
  };
}

/**
 * Computes bounding box from coordinates or GeoJSON
 */
export function getBoundsForParcels(
  parcels: Parcel[]
): [[number, number], [number, number]] | null {
  if (!parcels || parcels.length === 0) return null;

  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const p of parcels) {
    for (const ring of p.geometry.coordinates) {
      for (const coord of ring) {
        if (coord[0] < minLng) minLng = coord[0];
        if (coord[1] < minLat) minLat = coord[1];
        if (coord[0] > maxLng) maxLng = coord[0];
        if (coord[1] > maxLat) maxLat = coord[1];
      }
    }
  }

  if (minLng === Infinity) return null;

  // Add small buffer so the fitBounds doesn't clip parcel edges
  const lngPad = Math.max(0.005, (maxLng - minLng) * 0.1);
  const latPad = Math.max(0.005, (maxLat - minLat) * 0.1);

  return [
    [minLng - lngPad, minLat - latPad],
    [maxLng + lngPad, maxLat + latPad],
  ];
}
