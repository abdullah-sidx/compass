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
  - Header: Title "Land Acquisition Control Tower", subtitle "Monitor · Track · Accelerate", live dynamic "Last updated: Oct 2025" snapshot timestamp, and "All States" filter dropdown.
  - 4 KPI cards: Total area notified (ha), Compensation paid (INR Cr / Lakh), Possession achieved (%), Projects at risk (count), with month-over-month delta badges calculated from the 12 seeded monthly snapshots.
  - Left column:
    - Recharts "Land Acquisition Progress" donut chart with center % / label, custom tooltip, and progress legend.
    - "Parcels by status" breakdown list for all 5 official statuses (Notified, Under assessment, Compensation paid, Possession completed, Delayed) with counts, percentages, and progress meters.
    - "Top 5 states by notified area" bar list with interactive state filter click handlers.
  - Centre column:
    - Reserved "Land Acquisition Map" slot with high visual fidelity, GIS coordinate watermark, live state/parcel stats overlay, and full status color legend ready for Chunk 2's `<ParcelMap />`.
  - Right column:
    - "Projects at risk" table sorted by risk level & risk score (High first, then Medium, then Low), with project names, agency, sector, state, risk chips, key issues with parcel counts, stage, estimated delays, and "View all" link to `/projects`.
  - Global state filter reactivity: Selecting any state immediately re-computes every widget, KPI, chart, and table.
  - Formatted units: Hectares with 1-2 decimals, INR crore or lakh for under 1 Cr, no "0.00 Cr", and clean MoM sentiment arrows.
  - Automated verification: `scripts/verify.ts` and `scripts/verify-chunk1.ts` pass with 100% matched stats and 200 OK page statuses.
  - Production build (`npm run build`) passing with zero errors.

## In progress
(none - Chunk 1 complete)

## Next
Chunk 2: GIS map

## Decisions
- 2026-10-05: Added `lucide-react` for clean interface icons in sidebar, header, and route status placeholders.
- 2026-10-05: Added `tsx` to devDependencies for running the deterministic seed script (`npm run seed`) and automated acceptance checks.
- 2026-10-05: Used Mulberry32 PRNG with fixed seed 42 to guarantee deterministic parcel geometry generation and corridor placement across all runs.
- 2026-10-05: Stored generated seed data in `/data/seed.json` loaded into an in-memory store in `/lib/data.ts` to allow instant reads and client/server consistency without external database dependencies.
- 2026-10-05: Configured `outputFileTracingRoot` in `next.config.mjs` to keep build tracing clean and isolated to the project root.
- 2026-10-05: Implemented `lib/formatters.ts` for consistent unit formatting across the application (INR crore/lakh logic, hectare decimals, and sentiment-aware MoM delta calculations).
- 2026-10-05: Used proportional national monthly growth benchmarks for state-level MoM deltas to avoid division by zero while preserving accurate trends.
- 2026-10-05: Enabled interactive state selection directly from the "Top 5 States" list in addition to the header dropdown for enhanced usability.
- 2026-10-05: Adjusted layout container to `max-w-7xl 2xl:max-w-[1600px]` to maintain the 1280px baseline while allowing wide desktop monitors (1440px / 1920px) to present the full three-column control tower with comfortable spacing.

## Known issues
- Headless browser tool context failed with CDP port parse error on Windows (`failed to resolve CDP URLs: failed to parse CDP port`). Automated testing and server response verification was confirmed via Next.js SSR build and `scripts/verify-chunk1.ts`.

## Notes for the next session
- Chunk 1 is complete and verified.
- Next step is Chunk 2: Build the GIS map with MapLibre GL JS (CARTO Positron style basemap), `<ParcelMap />` component, parcel polygons coloured by status, low-zoom cluster circles, interactive selection drawer with ULPIN details, `/parcels` page, and embedding the compact map into the reserved Overview slot.
