# Progress

## Done
- Chunk 0: scaffold, types, seed data
  - App shell scaffolded with sticky Header and left Sidebar with official status legend.
  - Placeholder pages created for all 7 primary routes: `/` (Overview), `/parcels`, `/projects`, `/alignment`, `/payments`, `/reports`, `/settings`.
  - Shared TypeScript interfaces in `/lib/types.ts` (`Project`, `Parcel`, `Stage`, `Payment`, `AuditEvent`, `Grievance`, `MonthlySnapshot`, `StatsResponse`, `Role`, `ParcelStatus`, `RiskLevel`, `ProjectSector`, `StageName`, `StageStatus`).
  - Deterministic seed generation in `/scripts/seed.ts` (Mulberry32 PRNG, fixed seed 42) producing 15 projects across 10 states and 7 sectors, 303 contiguous corridor parcels, 12 monthly snapshots, SHA-256 hash-chained audit events, and payments.
  - Data access helpers in `/lib/data.ts`.
  - Next.js API route handlers: `/api/projects`, `/api/parcels?state=&project=&status=`, `/api/stats?state=`.
  - Full acceptance verification (`scripts/verify.ts`) passing: stats match parcel/project totals, state filter works, and all routes return 200 OK.
  - Production build (`npm run build`) passing with zero errors.

- Chunk 1: overview dashboard
  - Built Overview Dashboard at `/` matching the visual layout and style of `docs/reference/dashboard.webp`.
  - Header: Title "Land Acquisition Control Tower", subtitle "Monitor · Track · Accelerate", dynamic "Last updated: 5 Oct 2026" timestamp, and "All States" filter dropdown.
  - 4 KPI cards: Total area notified (ha), Compensation paid (INR Cr / Lakh), Possession achieved (%), Projects at risk (count), with real MoM delta badges for nationwide aggregates and "n/a" for state-specific views.
  - Left column:
    - Recharts "Land Acquisition Progress" donut chart with center % / label, custom tooltip, and progress legend.
    - "Parcels by status" breakdown list for all 5 official statuses (Notified, Under assessment, Compensation paid, Possession completed, Delayed) with counts, percentages, and progress meters.
    - "Top 5 states by notified area" bar list with interactive state filter click handlers.
  - Centre column:
    - Embedded `<CompactParcelMap />` with live GIS coordinates, state/parcel stats overlay, and full status color legend.
  - Right column:
    - "Projects at risk" table sorted by risk level & risk score (High first, then Medium, then Low), with project names, agency, sector, state, risk chips, key issues with parcel counts, stage, estimated delays, and "View all" link to `/projects`.
  - Global state filter reactivity: Selecting any state immediately re-computes every widget, KPI, chart, and map view.
  - Formatted units: Hectares with 1-2 decimals, INR crore or lakh for under 1 Cr, no "0.00 Cr", and clean MoM sentiment arrows.
  - Automated verification: `scripts/verify.ts` and `scripts/verify-chunk1.ts` pass with 100% matched stats and 200 OK page statuses.
  - Production build (`npm run build`) passing with zero errors.

- Step 0: fixes to Chunk 1
  - Defined `AS_OF_DATE = "2026-10-05"` in `scripts/seed.ts` and `lib/data.ts`.
  - 12 monthly snapshots adjusted to end in September 2026 (relative to AS_OF_DATE).
  - All seed dates (stages, audit events, payments) synchronized consistently with AS_OF_DATE.
  - Overview "Last updated" chip updated to show "5 Oct 2026".
  - Removed benchmark trend rate logic: state-specific selections display "n/a" instead of invented deltas; delta chips show only for national aggregates.
  - Verified 0 occurrences of third-party template / NextAdmin references across the entire codebase.

- Chunk 2: GIS map
  - Reusable `<ParcelMap />` component built with MapLibre GL JS, loaded client-side only via `<ParcelMapWrapper />` (`next/dynamic` with `ssr: false`).
  - Basemap: CARTO Positron vector style (`https://basemaps.cartocdn.com/gl/positron-gl-style/style.json`) with attribution preserved.
  - Offline fallback: Built-in `FALLBACK_LIGHT_STYLE` (`#f8fafc` background) automatically handles network drops or offline demos so parcel polygons and clusters continue rendering smoothly.
  - Low zoom: Project cluster circles sized by parcel count (14px - 24px) with worst-status color coding (Delayed > UnderAssessment > Notified > CompensationPaid > PossessionCompleted) and parcel count number text. Clicking a cluster zooms into project bounds.
  - High zoom (zoom >= 8.5): Full parcel polygons rendered with fill (0.65 opacity), crisp border outline, hover effects, and thick selection outline matching the official AGENTS.md status palette (Notified = Blue `#2563eb`, Under assessment = Amber `#f59e0b`, Compensation paid = Green `#10b981`, Possession completed = Purple `#8b5cf6`, Delayed = Red `#ef4444`).
  - Project corridor alignment layer (LineString connecting parcel centroids) with toggle controls.
  - Interactive map controls: State filter, Project filter (zooms to project bounds), Status filter pills, layer toggles (Parcels, Corridors), and "Reset to India" button.
  - Right-side `<ParcelDrawer />` detailing ULPIN with copy button, masked landowner, guidance value, compensation progress bar, dispute banner, and 4-step acquisition lifecycle timeline.
  - Built `/parcels` Land Parcels GIS Explorer page with searchable parcel list, status tabs, and bi-directional map synchronization.
  - Replaced reserved map slot on Overview page with `<CompactParcelMap />`, maintaining exact layout framing, responsive state filter reactivity, and parcel drawer inspection.
  - Automated verification script `scripts/verify-chunk2.ts` passing 100% of checks.
  - Production build (`npm run build`) passing with zero errors.

## In progress
(none - Chunk 2 complete)

## Next
Chunk 3: AI delay-risk + what-if

## Decisions
- 2026-10-05: Added `lucide-react` for clean interface icons in sidebar, header, and route status placeholders.
- 2026-10-05: Added `tsx` to devDependencies for running the deterministic seed script (`npm run seed`) and automated acceptance checks.
- 2026-10-05: Used Mulberry32 PRNG with fixed seed 42 to guarantee deterministic parcel geometry generation and corridor placement across all runs.
- 2026-10-05: Stored generated seed data in `/data/seed.json` loaded into an in-memory store in `/lib/data.ts` to allow instant reads and client/server consistency without external database dependencies.
- 2026-10-05: Configured `outputFileTracingRoot` in `next.config.mjs` to keep build tracing clean and isolated to the project root.
- 2026-10-05: Implemented `lib/formatters.ts` for consistent unit formatting across the application (INR crore/lakh logic, hectare decimals, and sentiment-aware MoM delta calculations).
- 2026-10-05: Removed benchmark trend rate logic for state filters; state-level delta chips display "n/a" to adhere strictly to non-invented figures.
- 2026-10-05: Anchored all deterministic seed dates to `AS_OF_DATE = 2026-10-05` (snapshots Oct 2025 - Sep 2026).
- 2026-10-05: Loaded MapLibre CSS directly via `app/layout.tsx` to maintain clean Tailwind PostCSS build compatibility.
- 2026-10-05: Set dynamic zoom boundary between project cluster circles and parcel polygons at zoom 8.5, allowing seamless transition from national overview to parcel inspection.
- 2026-10-05: Added `FALLBACK_LIGHT_STYLE` with `#f8fafc` background ensuring spatial geometries render reliably in offline environments without external internet connectivity.
- 2026-10-05: Split `/parcels` layout into 5 cols list / 7 cols map (lg) and 4 cols list / 8 cols map (xl) for comfortable badge spacing on desktop screens (1280px+).

## Known issues
(none)

## Notes for the next session
- Step 0 and Chunk 2 are complete, verified, and committed.
- Next step is Chunk 3: AI delay-risk + what-if model training in Python (`/ml/train.py`), exporting `/public/model/risk-model.json`, browser-based inference in `/lib/risk.ts`, and interactive project risk pages with what-if sliders.
