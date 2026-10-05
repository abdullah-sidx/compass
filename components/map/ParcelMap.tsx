"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import maplibregl from "maplibre-gl";
import {
  Layers,
  Maximize2,
  RotateCcw,
  Eye,
  EyeOff,
  Filter,
  Navigation,
  Globe,
  WifiOff,
  ChevronDown,
} from "lucide-react";
import type { Parcel, Project, ParcelStatus } from "@/lib/types";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  INDIA_CENTER,
  INDIA_BOUNDS,
  CARTO_STYLE_URL,
  FALLBACK_LIGHT_STYLE,
  buildParcelsGeoJson,
  buildProjectClustersGeoJson,
  buildProjectCorridorsGeoJson,
  getBoundsForParcels,
  type ProjectClusterProperties,
} from "@/lib/geo";

export interface ParcelMapProps {
  parcels: Parcel[];
  projects: Project[];
  selectedState?: string;
  selectedProjectId?: string;
  selectedStatus?: string;
  selectedUlpin?: string | null;
  onSelectParcel?: (parcel: Parcel | null) => void;
  onSelectProject?: (projectId: string | null) => void;
  onSelectState?: (state: string) => void;
  compact?: boolean;
  showControls?: boolean;
  showLegend?: boolean;
  className?: string;
}

export default function ParcelMap({
  parcels,
  projects,
  selectedState = "All",
  selectedProjectId = "All",
  selectedStatus = "All",
  selectedUlpin = null,
  onSelectParcel,
  onSelectProject,
  onSelectState,
  compact = false,
  showControls = true,
  showLegend = true,
  className = "",
}: ParcelMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isOfflineBasemap, setIsOfflineBasemap] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(4.2);
  const [showCorridors, setShowCorridors] = useState(true);
  const [showParcels, setShowParcels] = useState(true);
  const [hoveredUlpin, setHoveredUlpin] = useState<string | null>(null);

  // States list from projects
  const stateOptions = useMemo(() => {
    return Array.from(new Set(projects.map((p) => p.state))).sort();
  }, [projects]);

  // Projects list filtered by state
  const projectOptions = useMemo(() => {
    if (!selectedState || selectedState.toLowerCase() === "all") {
      return projects;
    }
    return projects.filter(
      (p) => p.state.toLowerCase() === selectedState.toLowerCase()
    );
  }, [projects, selectedState]);

  // GeoJSON data structures
  const parcelsGeoJson = useMemo(() => {
    return buildParcelsGeoJson(parcels, {
      state: selectedState,
      projectId: selectedProjectId,
      status: selectedStatus,
    });
  }, [parcels, selectedState, selectedProjectId, selectedStatus]);

  const clustersGeoJson = useMemo(() => {
    return buildProjectClustersGeoJson(projects, parcels, selectedState);
  }, [projects, parcels, selectedState]);

  const corridorsGeoJson = useMemo(() => {
    return buildProjectCorridorsGeoJson(projects, parcels, selectedState);
  }, [projects, parcels, selectedState]);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    let fallbackTriggered = false;

    // Create Map with error catching for basemap offline fallback
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: CARTO_STYLE_URL,
      center: INDIA_CENTER,
      zoom: compact ? 3.8 : 4.3,
      minZoom: 3,
      maxZoom: 18,
      attributionControl: {
        compact: true,
        customAttribution: "© CARTO · © OpenStreetMap contributors · Compass Prototype",
      },
    });

    mapRef.current = map;

    // Fallback if CARTO style fails to load (offline or CORS error)
    map.on("error", (e: any) => {
      const msg = e.error?.message || "";
      if (
        !fallbackTriggered &&
        (msg.includes("Failed to fetch") ||
          msg.includes("NetworkError") ||
          msg.includes("404") ||
          e.status === 404)
      ) {
        fallbackTriggered = true;
        setIsOfflineBasemap(true);
        console.warn("[MapLibre] Online basemap unavailable; switching to offline fallback light style.");
        try {
          map.setStyle(FALLBACK_LIGHT_STYLE as unknown as maplibregl.StyleSpecification);
        } catch (err) {
          console.error("Failed to set fallback style", err);
        }
      }
    });

    map.on("load", () => {
      setMapLoaded(true);
    });

    map.on("zoom", () => {
      setCurrentZoom(Number(map.getZoom().toFixed(1)));
    });

    // Add navigation controls in full mode
    if (!compact) {
      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [compact]);

  // Add / update GeoJSON sources and layers when map is loaded
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // 1. PROJECT CORRIDORS SOURCE & LAYER
    if (map.getSource("corridors-source")) {
      (map.getSource("corridors-source") as maplibregl.GeoJSONSource).setData(corridorsGeoJson);
    } else {
      map.addSource("corridors-source", {
        type: "geojson",
        data: corridorsGeoJson,
      });

      // Corridor center line
      map.addLayer({
        id: "corridors-casing",
        type: "line",
        source: "corridors-source",
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#ffffff",
          "line-width": 5,
          "line-opacity": 0.8,
        },
      });

      map.addLayer({
        id: "corridors-line",
        type: "line",
        source: "corridors-source",
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#0284c7",
          "line-width": 3,
          "line-dasharray": [3, 2],
          "line-opacity": 0.9,
        },
      });
    }

    // 2. PARCELS POLYGONS SOURCE & LAYERS
    if (map.getSource("parcels-source")) {
      (map.getSource("parcels-source") as maplibregl.GeoJSONSource).setData(parcelsGeoJson);
    } else {
      map.addSource("parcels-source", {
        type: "geojson",
        data: parcelsGeoJson,
      });

      // Semi-transparent fill coloured by status
      map.addLayer({
        id: "parcels-fill",
        type: "fill",
        source: "parcels-source",
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": 0.65,
        },
      });

      // Crisp parcel boundary outline
      map.addLayer({
        id: "parcels-outline",
        type: "line",
        source: "parcels-source",
        paint: {
          "line-color": ["get", "color"],
          "line-width": 1.5,
          "line-opacity": 0.95,
        },
      });

      // Selected / Hover outline highlight
      map.addLayer({
        id: "parcels-highlight",
        type: "line",
        source: "parcels-source",
        paint: {
          "line-color": "#0f172a",
          "line-width": [
            "case",
            ["==", ["get", "ulpin"], selectedUlpin || ""],
            3.5,
            ["==", ["get", "ulpin"], hoveredUlpin || ""],
            2.5,
            0,
          ],
          "line-opacity": 1,
        },
      });
    }

    // 3. PROJECT CLUSTERS (LOW ZOOM) SOURCE & LAYERS
    if (map.getSource("clusters-source")) {
      (map.getSource("clusters-source") as maplibregl.GeoJSONSource).setData(clustersGeoJson);
    } else {
      map.addSource("clusters-source", {
        type: "geojson",
        data: clustersGeoJson,
      });

      // Outer glow circle
      map.addLayer({
        id: "clusters-glow",
        type: "circle",
        source: "clusters-source",
        maxzoom: 8.5,
        paint: {
          "circle-radius": ["+", ["get", "radius"], 5],
          "circle-color": ["get", "worstStatusColor"],
          "circle-opacity": 0.25,
        },
      });

      // Core cluster circle
      map.addLayer({
        id: "clusters-circle",
        type: "circle",
        source: "clusters-source",
        maxzoom: 8.5,
        paint: {
          "circle-radius": ["get", "radius"],
          "circle-color": ["get", "worstStatusColor"],
          "circle-stroke-width": 2.5,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 0.95,
        },
      });

      // Parcel count label inside cluster circle
      map.addLayer({
        id: "clusters-label",
        type: "symbol",
        source: "clusters-source",
        maxzoom: 8.5,
        layout: {
          "text-field": ["to-string", ["get", "parcelsCount"]],
          "text-size": 11,
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-allow-overlap": true,
          "text-ignore-placement": true,
        },
        paint: {
          "text-color": "#ffffff",
        },
      });
    }

    // Update highlight filter dynamically
    if (map.getLayer("parcels-highlight")) {
      map.setPaintProperty("parcels-highlight", "line-width", [
        "case",
        ["==", ["get", "ulpin"], selectedUlpin || ""],
        3.5,
        ["==", ["get", "ulpin"], hoveredUlpin || ""],
        2.5,
        0,
      ]);
    }

    // Layer visibility toggles
    if (map.getLayer("parcels-fill")) {
      map.setLayoutProperty("parcels-fill", "visibility", showParcels ? "visible" : "none");
      map.setLayoutProperty("parcels-outline", "visibility", showParcels ? "visible" : "none");
    }
    if (map.getLayer("corridors-line")) {
      map.setLayoutProperty("corridors-line", "visibility", showCorridors ? "visible" : "none");
      map.setLayoutProperty("corridors-casing", "visibility", showCorridors ? "visible" : "none");
    }
  }, [
    mapLoaded,
    parcelsGeoJson,
    clustersGeoJson,
    corridorsGeoJson,
    selectedUlpin,
    hoveredUlpin,
    showParcels,
    showCorridors,
  ]);

  // Click & hover event handlers for parcels & clusters
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Parcel click handler
    const onParcelClick = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const ulpin = feature.properties?.ulpin;
        if (ulpin) {
          const found = parcels.find((p) => p.ulpin === ulpin);
          if (found && onSelectParcel) {
            onSelectParcel(found);
          }
        }
      }
    };

    // Cluster click handler -> zoom into project extent
    const onClusterClick = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const boundsStr = feature.properties?.bounds;
        const prjId = feature.properties?.projectId;

        if (prjId && onSelectProject) {
          onSelectProject(prjId);
        }

        if (boundsStr) {
          try {
            const bounds = typeof boundsStr === "string" ? JSON.parse(boundsStr) : boundsStr;
            map.fitBounds(
              [
                [bounds[0], bounds[1]],
                [bounds[2], bounds[3]],
              ],
              {
                padding: compact ? 30 : 60,
                maxZoom: 14,
                duration: 1200,
              }
            );
          } catch (err) {
            console.error("Error parsing cluster bounds", err);
          }
        }
      }
    };

    // Cursor pointer on hover
    const onMouseEnterParcel = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
      map.getCanvas().style.cursor = "pointer";
      if (e.features && e.features.length > 0) {
        setHoveredUlpin(e.features[0].properties?.ulpin || null);
      }
    };

    const onMouseLeaveParcel = () => {
      map.getCanvas().style.cursor = "";
      setHoveredUlpin(null);
    };

    const onMouseEnterCluster = () => {
      map.getCanvas().style.cursor = "pointer";
    };

    const onMouseLeaveCluster = () => {
      map.getCanvas().style.cursor = "";
    };

    map.on("click", "parcels-fill", onParcelClick);
    map.on("mouseenter", "parcels-fill", onMouseEnterParcel);
    map.on("mouseleave", "parcels-fill", onMouseLeaveParcel);

    map.on("click", "clusters-circle", onClusterClick);
    map.on("mouseenter", "clusters-circle", onMouseEnterCluster);
    map.on("mouseleave", "clusters-circle", onMouseLeaveCluster);

    return () => {
      map.off("click", "parcels-fill", onParcelClick);
      map.off("mouseenter", "parcels-fill", onMouseEnterParcel);
      map.off("mouseleave", "parcels-fill", onMouseLeaveParcel);

      map.off("click", "clusters-circle", onClusterClick);
      map.off("mouseenter", "clusters-circle", onMouseEnterCluster);
      map.off("mouseleave", "clusters-circle", onMouseLeaveCluster);
    };
  }, [mapLoaded, parcels, onSelectParcel, onSelectProject, compact]);

  // Camera framing when selectedState or selectedProjectId changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (selectedProjectId && selectedProjectId !== "All") {
      const prjParcels = parcels.filter((p) => p.projectId === selectedProjectId);
      const bounds = getBoundsForParcels(prjParcels);
      if (bounds) {
        map.fitBounds(bounds, {
          padding: compact ? 30 : 60,
          maxZoom: 14.5,
          duration: 1000,
        });
      }
    } else if (selectedState && selectedState !== "All") {
      const stateParcels = parcels.filter((p) => p.state.toLowerCase() === selectedState.toLowerCase());
      const bounds = getBoundsForParcels(stateParcels);
      if (bounds) {
        map.fitBounds(bounds, {
          padding: compact ? 30 : 60,
          maxZoom: 9.5,
          duration: 1000,
        });
      }
    } else {
      // All states -> reset to national bounds
      map.fitBounds(INDIA_BOUNDS, {
        padding: compact ? 15 : 40,
        maxZoom: 5,
        duration: 800,
      });
    }
  }, [selectedState, selectedProjectId, parcels, mapLoaded, compact]);

  // Zoom to selected parcel if explicitly chosen
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !selectedUlpin) return;

    const targetParcel = parcels.find((p) => p.ulpin === selectedUlpin);
    if (targetParcel) {
      const bounds = getBoundsForParcels([targetParcel]);
      if (bounds) {
        map.fitBounds(bounds, {
          padding: compact ? 40 : 80,
          maxZoom: 15,
          duration: 1000,
        });
      }
    }
  }, [selectedUlpin, parcels, mapLoaded, compact]);

  const handleResetView = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    if (onSelectProject) onSelectProject("All");
    if (onSelectState) onSelectState("All");
    map.fitBounds(INDIA_BOUNDS, {
      padding: compact ? 15 : 40,
      maxZoom: 5,
      duration: 1000,
    });
  }, [compact, onSelectProject, onSelectState]);

  return (
    <div className={`relative flex flex-col w-full h-full overflow-hidden bg-slate-100 ${className}`}>
      {/* Top Filter Bar in Full Mode */}
      {showControls && !compact && (
        <div className="z-10 bg-white/95 backdrop-blur-xs border-b border-slate-200 p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* State filter dropdown */}
            <div className="relative inline-flex items-center">
              <span className="text-[11px] font-semibold text-slate-400 mr-1.5 uppercase">State:</span>
              <select
                value={selectedState}
                onChange={(e) => onSelectState && onSelectState(e.target.value)}
                className="pl-2.5 pr-7 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 rounded-lg shadow-2xs focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="All">All States ({stateOptions.length})</option>
                {stateOptions.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
            </div>

            {/* Project filter dropdown */}
            <div className="relative inline-flex items-center">
              <span className="text-[11px] font-semibold text-slate-400 mr-1.5 uppercase">Project:</span>
              <select
                value={selectedProjectId}
                onChange={(e) => onSelectProject && onSelectProject(e.target.value)}
                className="pl-2.5 pr-7 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 rounded-lg shadow-2xs focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none cursor-pointer max-w-[220px] truncate"
              >
                <option value="All">All Corridors ({projectOptions.length})</option>
                {projectOptions.map((prj) => (
                  <option key={prj.id} value={prj.id}>
                    {prj.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
            </div>

            {/* Layer Toggles */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/80">
              <button
                onClick={() => setShowParcels(!showParcels)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  showParcels
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Toggle Parcels Layer"
              >
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Parcels</span>
              </button>

              <button
                onClick={() => setShowCorridors(!showCorridors)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  showCorridors
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Toggle Corridors Alignment Layer"
              >
                <Navigation className="w-3.5 h-3.5 text-sky-600" />
                <span>Corridors</span>
              </button>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetView}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 shadow-2xs transition-colors"
              title="Fit map to all India corridors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset to India</span>
            </button>
          </div>
        </div>
      )}

      {/* Map Viewport Container */}
      <div className="relative flex-1 w-full h-full min-h-[300px]">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

        {/* Offline Fallback Banner if Basemap Unreachable */}
        {isOfflineBasemap && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-3 py-1.5 bg-amber-50/95 backdrop-blur-xs text-amber-900 border border-amber-300 rounded-lg shadow-sm text-xs">
            <WifiOff className="w-3.5 h-3.5 text-amber-700" />
            <span className="font-medium">Offline Canvas Mode: Vector basemap unavailable, rendering spatial geometries.</span>
          </div>
        )}

        {/* Floating Zoom Level & Layer Info Badge */}
        <div className="absolute bottom-6 left-3 z-10 hidden sm:flex items-center gap-2 px-2.5 py-1 bg-white/90 backdrop-blur-xs rounded-lg shadow-2xs border border-slate-200/80 text-[11px] font-mono text-slate-600">
          <span>Zoom: {currentZoom}</span>
          <span className="text-slate-300">|</span>
          <span>{currentZoom >= 8.5 ? "Parcels Mode (Polygons)" : "Cluster Mode (Summary)"}</span>
        </div>

        {/* Compact Mode Overlay Controls */}
        {compact && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/95 backdrop-blur-xs rounded-lg shadow-2xs border border-slate-200 text-xs font-semibold text-slate-800">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>{selectedState !== "All" ? selectedState : "National Corridors"}</span>
            </div>
            <button
              onClick={handleResetView}
              className="p-1.5 bg-white/95 backdrop-blur-xs hover:bg-slate-50 text-slate-600 rounded-lg border border-slate-200 shadow-2xs transition-colors"
              title="Reset view to all India"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Status Color Legend */}
        {showLegend && (
          <div
            className={`absolute z-10 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-xl shadow-md p-3 ${
              compact
                ? "bottom-3 right-3 max-w-[280px]"
                : "bottom-7 right-3 max-w-[340px]"
            }`}
          >
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Status Legend
              </span>
              <span className="text-[10px] text-slate-400">
                {currentZoom < 8.5 ? "Worst status by project" : "Parcel polygon status"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0" />
                <span className="text-[11px] text-slate-700">Notified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
                <span className="text-[11px] text-slate-700">Under assessment</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 flex-shrink-0" />
                <span className="text-[11px] text-slate-700">Comp paid</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 flex-shrink-0" />
                <span className="text-[11px] text-slate-700">Possession</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 flex-shrink-0" />
                <span className="text-[11px] text-slate-700">Delayed / at risk</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
