# Compass: prompts for each chunk

How to use: open a NEW agent session for each chunk. Paste the chunk prompt.
Every prompt starts with the same line, so the agent loads the project brief.
Put the dashboard mockup at docs/reference/dashboard.png before chunk 1.

---

## Chunk 0: scaffold, types, seed data

```
Read AGENTS.md and PROGRESS.md first. Then do Chunk 0.

Build the foundation for "Compass", a land acquisition control tower prototype.
Use Next.js (App Router), TypeScript, Tailwind CSS, MapLibre GL JS, turf.js,
Recharts. All data is synthetic.

1. Scaffold the app with a left sidebar (Overview, Land Parcels, Projects,
   Alignment Checker, Payments, Reports, Settings) and an empty page for each.
   Header shows "Compass" and a role switcher placeholder (used later).
2. Create /lib/types.ts with the shared types:
   - Project: id, name, sector, state, agency, stage, riskScore, riskLevel,
     estDelayMonths, keyIssue, startDate, features used later by the risk model
     (landAreaHa, parcelsCount, familiesAffected, openObjections, disputes,
     stageDelayDays, compensationPaidPct, forestClearancePending).
   - Parcel: ulpin (14-char alphanumeric), projectId, state, district, areaHa,
     status, ownerMasked, familiesAffected, landValuePerHa, compensationDue,
     compensationPaid, hasDispute, geometry (GeoJSON Polygon).
   - Stage: name, ownerRole, startDate, dueDate, completedDate, status.
   - Payment, AuditEvent (id, projectId, actor, role, action, timestamp, prevHash,
     hash), Grievance (id, ulpin, category, message, status, createdAt),
     MonthlySnapshot (month, areaNotifiedHa, compensationPaidCr, possessionPct,
     projectsAtRisk).
   Parcel status is one of: Notified, UnderAssessment, CompensationPaid,
   PossessionCompleted, Delayed. Roles: Ministry, State, District, RequiringBody,
   FieldOfficer.
3. Write a seed script (fixed random seed) that generates 15 projects across at
   least 8 Indian states and sectors (highway, rail, metro, solar, port,
   industrial, urban) and about 300 parcels as small polygons placed along each
   project's corridor. Parcels must be real-looking small rectangles (roughly
   0.5 to 5 ha), contiguous along the corridor. Add realistic key issues (farmer
   protest, title disputes, forest clearance pending, incomplete compensation).
   Add 12 monthly snapshots, six stages per project, audit events and a few
   payments.
4. Expose helpers in /lib/data.ts and API routes: /api/projects,
   /api/parcels?state=&project=&status=, /api/stats?state=.
5. Theme: light, white cards, subtle borders, blue/green accents, legend colours
   as in AGENTS.md.

Acceptance: `npm run dev` works; /api/stats totals match the parcel and project
data; every page loads without errors; no page content yet beyond placeholders.
Update PROGRESS.md and commit.
```

---

## Chunk 1: overview dashboard

```
Read AGENTS.md and PROGRESS.md first. Then do Chunk 1.

Build the Overview page of Compass using the seeded data and shared types. The image
docs/reference/dashboard.png is a VISUAL REFERENCE ONLY: match layout and style,
but every number must be computed from the data, never copied from the image.

Layout (desktop, 1280px and wider):
1. Header: title "Land Acquisition Control Tower", subtitle "Monitor · Track ·
   Accelerate", a "Last updated" timestamp, and an "All States" dropdown that
   filters every widget on the page.
2. Four KPI cards: Total area notified (ha), Compensation paid (INR crore),
   Possession achieved (%), Projects at risk (count). Each shows its change versus
   last month, computed from the monthly snapshots.
3. Left column: donut "Land Acquisition Progress" (Possession achieved, In progress,
   Not started, Delayed, with percentages); "Parcels by status" list with counts;
   "Top 5 states by notified area" bar list.
4. Centre: a card titled "Land Acquisition Map" that is a reserved empty slot (Chunk 2
   fills it). Keep its size and position.
5. Right column: "Projects at risk" table (project, state, risk-level chip High /
   Medium / Low, key issue with parcel count, estimated delay), sorted by risk,
   with a "View all" link to /projects.

Rules: Recharts for the donut, Tailwind for styling, no hardcoded figures, data
only through /lib/data.ts or the API routes. Selecting a state updates every widget.

Acceptance: numbers match /api/stats for the same filter; changing the state filter
updates all widgets; no console errors; layout is close to the reference.
Update PROGRESS.md and commit.
```

---

## Chunk 2: GIS map

```
Read AGENTS.md and PROGRESS.md first. Then do Chunk 2.

Build the GIS map for Compass with MapLibre GL JS.

1. A reusable <ParcelMap /> component. Basemap: the free CARTO Positron style
   (https://basemaps.cartocdn.com/gl/positron-gl-style/style.json), keep the
   attribution visible. Initial view: India.
2. Render all seeded parcels as polygons coloured by status (legend colours in
   AGENTS.md). At low zoom show clustered circles per project (size by parcel
   count, colour by worst status); switch to polygons when zoomed in.
3. Controls: filters for state, project, status; a legend; a layer toggle
   (parcels, project corridors). Selecting a project zooms to its extent.
4. Click a parcel: open a right-side drawer with ULPIN, project, district, area,
   families affected, status, compensation due/paid, dispute flag, and a status
   timeline.
5. Create the /parcels page using the full-height map plus a searchable parcel list
   that stays in sync with the map selection.
6. Put a compact version of <ParcelMap /> into the reserved "Land Acquisition Map"
   slot on the Overview page. It must respect the page's state filter.

Acceptance: filters work on both pages; clicking a parcel opens the drawer with
correct data; zoom switches from clusters to polygons; no console errors.
Update PROGRESS.md and commit.
```

---

## Chunk 3: AI delay-risk and what-if

```
Read AGENTS.md and PROGRESS.md first. Then do Chunk 3.

Add delay-risk prediction to Compass.

1. Create /ml/train.py (Python, scikit-learn). Generate a synthetic dataset of
   about 3000 projects using the Project risk features from /lib/types.ts, with
   plausible relationships (more open objections, disputes, stage delay days and
   pending forest clearance increase delay; higher compensation-paid percent reduces
   it) plus noise. Target: delay in months. Train a standardized linear regression.
   Export /public/model/risk-model.json with feature names, means, standard
   deviations, coefficients, intercept, and thresholds for Low / Medium / High.
   Print the held-out R^2 and a short feature-importance table.
2. Create /lib/risk.ts with predict(features, overrides?) returning
   { score (0-100), level, estDelayMonths, topFactors: [{name, impact, direction}] }
   where impact is the exact per-feature contribution from the linear model.
   No server calls; it must run in the browser.
3. Replace the seeded riskScore / riskLevel / estDelayMonths with values computed by
   predict() so the Overview table and the model always agree.
4. Build /projects (table, sortable, filter by risk level) and /projects/[id]:
   - Risk gauge and level chip
   - "Why at risk" bars for the top 5 factors (red increases risk, green reduces)
   - What-if panel with sliders for 3 to 4 controllable inputs (for example open
     objections, stage delay days, compensation paid %, forest clearance pending).
     Moving a slider recomputes the score instantly and shows the change
     ("+2.1 months" or "-3.4 months")
   - "Recommended actions": 3 rule-based suggestions mapped to the top factors

Acceptance: moving a slider changes the score and the delay estimate; the Overview
risk table matches the project pages; the model JSON loads without a server call;
no console errors. Update PROGRESS.md (include R^2) and commit.
```

---

## Chunk 4: alignment checker

```
Read AGENTS.md and PROGRESS.md first. Then do Chunk 4.

Build the plan-time alignment checker at /alignment.

1. Full-width map using <ParcelMap /> (parcels visible, dimmed).
2. Drawing: click to add vertices, double-click to finish, to draw a corridor
   centreline. Support two alignments, Option A (blue) and Option B (orange), each
   with a "Clear" button. Add a "Load demo corridors" button that creates two
   ready-made alignments crossing seeded parcels so the demo works instantly.
3. Corridor width slider (20 to 200 m, default 60 m). Build the corridor with
   turf.buffer around the centreline.
4. For each option compute, using turf intersect and area:
   - affected parcels (count and list), affected area (ha)
   - families displaced (parcel familiesAffected scaled by overlap ratio)
   - estimated compensation (INR crore) from landValuePerHa x overlap area x
     multiplier, with the multiplier and solatium factor editable in an
     "Assumptions" panel
   - dispute risk: number of overlapping parcels with a dispute or Delayed status
5. Results panel with side-by-side cards, plus a "Recommended" badge on the option
   with the lower weighted score (families 40%, cost 40%, disputes 20%). Show the
   weights and allow changing them.
6. Highlight affected parcels in each option's colour; clicking a row in the
   results table zooms to that parcel.
7. "Copy summary" button producing a short text comparison.

Acceptance: demo corridors load in one click; metrics change when the width slider
changes; recommendation updates when weights change; no console errors.
Update PROGRESS.md and commit.
```

---

## Chunk 5: workflow and audit trail

```
Read AGENTS.md and PROGRESS.md first. Then do Chunk 5.

Add the workflow engine and audit trail to Compass.

1. Role switcher in the header (Ministry, State, District, RequiringBody,
   FieldOfficer). It is a demo login only; show the active role everywhere it
   matters.
2. Stage state machine per project: Plan & Align, Notify, Objections, Award & Pay,
   Possession, Handover. Each stage has an owner role, a due date (generic SLA in
   days) and a status (Pending, In review, Approved, Returned, Overdue). Only the
   owner role can Approve or Return; other roles see a disabled button with a
   tooltip.
3. Deadline engine: show a countdown per stage (days left / overdue) with colours.
   Create a notifications panel (bell icon) listing stages overdue or due within 7
   days, sorted by urgency. Label these as "SLA alerts", not legal deadlines.
4. Project detail page tab "Workflow": horizontal stepper, current stage card with
   Approve / Return with comment, and the stage history.
5. Audit trail at /audit and as a project tab: every action creates an event with
   hash = SHA-256(prevHash + JSON of event). Provide a "Verify chain" button that
   recomputes all hashes and reports OK or the first broken index. Add a developer
   toggle "Tamper with entry" to demo a failed verification.
6. Persist state in memory plus localStorage, with a "Reset demo data" button.

Acceptance: only the owner role can approve; approving advances the stage and adds
an audit event; verify shows OK, and shows a failure after tampering; reload keeps
state; no console errors. Update PROGRESS.md and commit.
```

---

## Chunk 6: landowner portal

```
Read AGENTS.md and PROGRESS.md first. Then do Chunk 6.

Build the public landowner portal at /portal (own layout, no admin sidebar).

1. Landing: a search box for a ULPIN with 3 clickable sample ULPINs underneath.
   Validate the ULPIN format and show friendly errors.
2. Result page: parcel summary (district, area, project name, masked owner name),
   a status stepper (Notified, Under assessment, Compensation paid, Possession
   completed), compensation due / paid / expected date, and a mock documents list
   (notice, valuation report, award) with placeholder download buttons.
3. Grievance form: category, message, optional masked mobile number. On submit
   create a Grievance with a reference number (e.g. GRV-2026-0001), show a
   confirmation, and let the user look it up later by reference number.
4. Officer view /grievances (admin layout): table of grievances with status
   (Open, In progress, Resolved) the officer can change.
5. Language toggle English / Hindi / Kannada using a simple dictionary file
   (/lib/i18n.ts). Translate all portal UI strings, including the stepper labels
   and form fields. Keep the dictionary easy to extend.
6. A visible "Sample data / prototype" banner.

Acceptance: sample ULPINs return the right parcel; invalid ULPIN shows an error;
grievance created in the portal appears in /grievances; language toggle changes
every portal string; no console errors. Update PROGRESS.md and commit.
```

---

## Chunk 7: offline field app (stretch)

```
Read AGENTS.md and PROGRESS.md first. Then do Chunk 7 only if Chunks 0-6 pass.

Build a mobile-first field page at /field for the FieldOfficer role.

1. Mobile layout (360 to 430 px wide): list of assigned parcels with status chips.
2. Parcel update screen: change status (Notified, UnderAssessment,
   CompensationPaid, PossessionCompleted), add a note, optional photo placeholder.
3. Offline support: web app manifest and a minimal service worker that caches the
   app shell and parcel data. Queue updates in IndexedDB while offline; show an
   "Offline: N updates pending" banner; sync automatically when back online and
   write audit events as in Chunk 5.
4. Show a clear online / offline indicator.

Acceptance: with network disabled in dev tools, the page still loads, updates are
queued, and they sync after reconnecting; no console errors.
Update PROGRESS.md and commit.
```

---

## Chunk 8: polish, demo script, deploy

```
Read AGENTS.md and PROGRESS.md first. Then do Chunk 8.

1. Polish: loading, empty and error states on every page; consistent spacing and
   typography; check layout at 1280, 1440 and 1920 px; keyboard focus styles.
2. Add a "Reset demo data" button in Settings that restores the seeded state.
3. Add a /demo page: a short guided checklist of the 90-second demo path with links
   (Overview -> Map -> Project risk + what-if -> Alignment checker -> Workflow +
   audit -> Landowner portal).
4. Write README.md: what Compass is, how to run it, the stack, data disclaimer
   (all synthetic), and the 90-second demo script.
5. Make sure `npm run build` passes with no type errors, then prepare for Vercel
   deployment (no environment variables required). Give the exact deploy steps.
6. List 6 screenshots to capture for the presentation, with the exact page and
   state for each.

Acceptance: build passes; reset works; /demo links all work; README is accurate.
Update PROGRESS.md and commit.
```

---

## Helper prompts

End-of-chunk check (paste after any chunk):

```
Review your own work against the acceptance line for this chunk and the Definition
of done in AGENTS.md. Run the build, list anything that does not pass, fix it, then
update PROGRESS.md with a short hand-over note.
```

Bug-fix template:

```
Read AGENTS.md and PROGRESS.md first. Bug: [what you did] -> [what happened] ->
[what you expected]. Error text or console output: [paste]. Find the root cause,
fix only what is needed, and tell me which files you changed.
```

Visual fix template:

```
Read AGENTS.md first. The [page] does not match docs/reference/dashboard.png in
[describe: spacing / colours / card sizes]. Match the reference more closely
without changing any data logic.
```
