# Handoff — K4RL

**Date:** 2026-06-17  
**Session scope:** Phase 1 UI build — Brand Portal  
**For:** Next Claude Code session starting cold

---

## What this project is

K4RL is a SaaS platform for EU Digital Product Passport (DPP) compliance for fashion brands. A brand creates a product, defines its material composition, and generates a DPP. Every physical item gets a unique QR + claim code pair. Consumers scan and claim ownership through a self-serve flow.

**Phase 1 is a UI build with no real backend.** All data is mock. Auth is simulated via a role switcher.

Before doing anything else, read:
1. `CLAUDE.md` — session rules, component conventions, constraints
2. `vision.md` — the binding product contract (stack, architecture, product logic, out-of-scope list)
3. `docs/DECISIONS.md` — why the product works the way it does (20 architecture decisions)

---

## How to run it

```bash
cd /Users/calliope/Desktop/K4RL/k4rl
pnpm run dev
```

pnpm binary is at `/Users/calliope/Library/pnpm/bin/pnpm` if not in PATH.  
Dev server runs on `http://localhost:3000`.  
Default landing route is `/brand/dashboard` (stub) — navigate to `/brand/products` for the active work.

If the server fails to start with a routes-manifest error:
```bash
rm -rf .next && pnpm run dev
```

If port 3000 is occupied:
```bash
kill $(lsof -ti :3000)
```

---

## Portal architecture

Five separate apps. Only the Brand Portal has real pages so far.

| Route prefix | Portal | Status |
|---|---|---|
| `/brand` | Brand Portal | **Active — partially built** |
| `/admin` | Admin Portal | Stub only (`/admin/dashboard` → "Coming soon") |
| `/consumer` | Consumer Web App | Stub only (`/consumer/wardrobe` → "Coming soon") |
| `/public/[id]` | Public DPP Page | Not created |
| `/factory/[token]` | Factory link flow | Not created |

---

## What is built

### Brand Portal shell
- `src/app/brand/layout.tsx` → wraps all brand pages in `<PortalLayout>`
- `src/components/layout/portal-layout.tsx` → sidebar + topbar + content area shell
- `src/components/layout/app-sidebar.tsx` → collapsible sidebar (ShadCN Sidebar, `collapsible="icon"`)
- `src/components/layout/top-bar.tsx` → K4RL logo left, page title centre, notification bell right
- `src/components/layout/breadcrumbs.tsx` → auto-generates from pathname
- `src/components/layout/page-header.tsx` → page-level heading row
- `src/components/layout/sidebar-user-footer.tsx` → avatar + name + brand name + account menu
- `src/components/layout/subscription-banner.tsx` → billing alert banner
- `src/components/layout/role-switcher.tsx` → dev tool for switching between `k4rl-admin`, `brand-admin`, `brand-editor`

### Mock auth
- `src/context/auth.tsx` → `AuthProvider`, `useAuth()`, `can(permission)` checker
- Three roles: `k4rl-admin`, `brand-admin`, `brand-editor`
- Default active role: `brand-admin` (Atelier Noir)
- Always use `can()` to gate UI — never check `user.role` directly

### Products — list page (`/brand/products`) — COMPLETE
- `src/app/brand/products/page.tsx`
- Table: 40×40px thumbnail, name + weight/country, SKU (monospace), category, DPP status dot, eco-score badge, created date
- Sortable columns: name, SKU, eco-score, created date (active sort column highlighted)
- **4 filters in a contained filter panel:** text search, DPP status, category (derived from brand's own products), eco-grade (A/B/C/D/E/Unscored)
- Active filter chips below the selects — each chip independently dismissible, grade chips are colour-coded
- Count shows "3 products · 2 shown" when filters are active
- Empty state: two variants (no products yet vs no filter matches), each with correct CTA
- Rows clickable → navigate to product detail

### Products — creation wizard (`/brand/products/new`) — COMPLETE
- `src/app/brand/products/new/page.tsx` — 4-step stepper, completed steps navigable backwards
- Steps 2 and 4 get full-bleed treatment: `max-w-5xl`, `overflow-hidden p-0` (no card padding)

**Step 1 — Basic info** (`src/components/brand/product-steps/step-basic-info.tsx`)
- Fields: name, SKU (scan button → SkuScanDialog), category (select), weight (grams), country of manufacture (select)
- SKU input forces uppercase
- Thumbnail uploader at bottom (single image, optional)
- Client-side validation gates progression

**Step 2 — Materials** (`src/components/brand/product-steps/step-materials.tsx`)
- Split layout: `grid lg:grid-cols-[1fr_260px]` — composition left (dominant), gallery right (narrow, 260px)
- **Left panel (DnaPanel):**
  - Product DNA header (name, category badge, country, weight)
  - Calculator: composition ring (SVG) + readable status text `role="status" aria-live="polite"` ("72% · 28% remaining" / "100% · Complete" / "105% · 5% over limit")
  - Edit section: fieldset+legend per material ("Material 1", "Material 2"…), combobox + stepper + trash, all with aria-labels
  - "Add material" button + "Submit a request" link
  - Validation error + Back/Continue buttons
- **Right panel (GalleryPanel):** 260px-tall main image → thumbnail strip → add tile
- Composition must total exactly 100% to advance
- Material selection via `Popover` + `Command` combobox — never a plain `<select>`
- No visual rows in this step — visual breakdown lives on the Review step and product detail page

**Step 3 — Eco-score** (`src/components/brand/product-steps/step-eco-score.tsx`)
- Read-only calculated view: score (0–100), grade (A–E), 5 subscores with bars, 3 blended impact figures
- No inputs — go back to step 2 to change composition

**Step 4 — Review** (`src/components/brand/product-steps/step-review.tsx`)
- Split layout mirroring the product detail page: `grid lg:grid-cols-[400px_1fr]`
- **Left panel:** "Product DNA · Preview" header → product identity (name, SKU mono, category badge, country, weight) → COMPOSITION section (ring + visual rows with icon badge + proportion bar + category label) → ECO-SCORE section (grade badge + "Make eco-score public" toggle) → Back/Create product buttons pinned to bottom
- **Right panel:** read-only image preview (main image + thumbnail strip for navigation, no add/remove)
- Looks like the actual product page — not a table

### Products — detail page (`/brand/products/[id]`) — COMPLETE
- `src/app/brand/products/[id]/page.tsx`
- Uses `-m-6` negative margin to break out of parent `p-6` and go edge-to-edge
- Split layout: `grid lg:grid-cols-[400px_1fr]`
- **Left panel:** back link + DPP status dot → Product DNA (name, SKU mono, category badge, country, weight) → COMPOSITION (ring + visual rows) → ECO-SCORE (grade badge + visibility) → DETAILS (created date, DPP generated date only — weight/country already in identity header) → QR BATCHES
- **Right panel:** GalleryPanel (main image + thumbnail strip + add tile)
- "Generate DPP" button gated behind `can("generate:dpp")` — currently links to `/brand/dpps?product=[id]` (stub)
- "Generate batch" button in QR batches section links to `/brand/batches/new?product=[id]` (not built)

### Factory standalone pages — COMPLETE
- `src/app/factory/[token]/certificate/page.tsx` — certificate upload page
- `src/app/factory/[token]/labels/page.tsx` — label download page
- Accessed via secure tokenised links sent by email — no login required
- Both pages show email context in the header: brand name, factory name, and reason for the link
- No sidebar, no navigation — fully standalone outside the main app shell

### Supporting dialogs
- `src/components/brand/sku-scan-dialog.tsx` — two tabs: live camera barcode scan (`@zxing/browser`) + label photo OCR simulation
- `src/components/brand/material-request-dialog.tsx` — submit request for missing material (name, category, notes)

### Shared primitives
- `src/components/shared/status-dot.tsx` — `<StatusDot status="…">`. 18 status values. Always dot + label, never color alone.
- `src/components/shared/mono-id.tsx` — `<MonoId value="…">`. All identifiers: SKUs, QR codes, claim codes, batch IDs.
- `src/components/shared/eco-score-badge.tsx` — `<EcoScoreBadge score={n} grade="A">`.
- `src/components/shared/empty-state.tsx` — `<EmptyState icon title description action>`. Required on every list surface.
- `src/components/shared/image-uploader.tsx` — drag-and-drop multi-image, maxCount cap, "Thumbnail" badge on index 0.

### Data / mock
- `src/lib/mock/products.ts` — `PRODUCTS` (4 items, 2 brands), `BATCHES` (3), `QR_ITEMS` (4 for prod-001)
- `src/lib/mock/materials.ts` — `MATERIALS` (15 approved), `PENDING_MATERIAL_REQUESTS` (2)
- `src/lib/mock/brands.ts`, `factories.ts`, `ownership.ts`
- `src/lib/types/product.ts` — `CompositionEntry`, `NewProductDraft`
- `src/lib/eco-score.ts` — `calculateEcoScore()`. Weights: CO₂ 35%, water 25%, energy 15%, chemistry 15%, circularity 10%. Grades: A ≥ 85, B ≥ 70, C ≥ 55, D ≥ 40, E < 40.

---

## Key decisions made

- **The unit of generation and cancellation is the QR & claim code pair** — each pair contains one unique QR code and one unique claim code, inseparable. They are always generated together and cancelled together. The QR code is printed visibly on the label; the claim code is printed hidden on the same label.
- **Factory pages are standalone** — no navigation, no sidebar, not part of the main app. They are accessed via a tokenised URL and render outside the brand portal shell entirely.
- **Email context is visible on the page** — the factory sees the brand name, factory name, and reason for the link so they know who sent it and why, without needing an account.
- **Certificates are not mandatory for DPP generation** — a product can have its DPP generated without any certificates attached. Certificates strengthen the DPP (supporting claims, traceability) but do not block the generation flow.
- **Materials in the admin library have no status** — they are created by the admin and approved by definition. The Status column does not exist on the materials table.
- **Brand-requested materials carry provenance data** — the requesting brand name and request date are stored in a `provenance` field on the Material object. This data is visible only in the expanded row detail, not as a badge or tag on the collapsed row.
- **The Source filter in the material library expands inline** — it is a single filter select. When "From brand request" is selected, a brand select appears inline next to it. It does not spawn a separate dropdown.
- **Approving a brand material request requires all fields before the button activates** — the admin must complete CO₂, water, energy, chemistry, and circularity before "Approve and add to library" becomes enabled. On approval, the material moves from the Requests tab to the Materials tab carrying provenance data. Rejected requests remain in the Requests tab with their status and rejection reason.

---

## What is NOT built (pending)

### Consumer flow
Public DPP page (`/public/[id]`), item claim, ownership transfer, fraud flag.

### Admin flow
Vocabulary management (material library), brand onboarding requests.

### Brand Portal — pages not yet created

| Page | Route | Notes |
|---|---|---|
| Dashboard | `/brand/dashboard` | Currently "Coming soon" stub |
| DPPs list | `/brand/dpps` | Currently "Coming soon" stub |
| DPP detail | `/brand/dpps/[id]` | Not created |
| Factories | `/brand/factories` | Not created |
| Factory detail | `/brand/factories/[id]` | Not created |
| Resellers | `/brand/resellers` | Not created |
| Billing | `/brand/billing` | Not created |
| Settings | `/brand/settings` | Currently "Coming soon" stub |

### Other portals — not started
- Admin Portal (only `/admin/dashboard` stub exists)
- Consumer Web App (only `/consumer/wardrobe` stub exists)
- Public DPP Page (`/public/[id]`)
- Factory link flow (`/factory/[token]`)

---

## Known issues

### CATEGORY_CONFIG labels out of sync
`step-materials.tsx` uses full labels (`"Natural fiber"`, `"Recycled synthetic"`, `"Semi-synthetic"`, `"Vegan leather"`).  
`[id]/page.tsx` still uses abbreviated labels (`"Natural"`, `"Recycled"`, `"Semi-synth"`, `"Vegan"`).  
**Fix:** Update `[id]/page.tsx` CATEGORY_CONFIG to use full labels, or extract both to a shared file at `src/lib/category-config.ts`.

### ecoScorePublic not written back to draft
The toggle in step 4 (Review) updates local state only — the value is not propagated back to the parent `NewProductDraft`. Needs to be reconciled when persistence is added.

### Product creation doesn't persist
`handleSubmit` in `new/page.tsx` just navigates to `/brand/products`. Draft is not saved anywhere. The POST call goes here when the backend is wired.

### Image URLs are blob objects
Uploaded images during creation are `URL.createObjectURL()` — browser-session-local, don't survive reload. Mock products use `picsum.photos`. Swap to real upload call when storage is added.

---

## Architecture patterns — must follow

| Pattern | Rule |
|---|---|
| Material selection | Always `Popover` + `Command` combobox. Never `<select>`. |
| Split layout | `grid grid-cols-1 lg:grid-cols-[…] min-h-[600px]`. Left panel: `flex flex-col border-r bg-card`. Scrollable area: `flex-1 overflow-y-auto`. |
| Full-bleed in wizard | Parent page sets `overflow-hidden p-0`; component handles its own padding. Detail page uses `-m-6`. |
| Permissions | `const { can } = useAuth()` → `can("generate:dpp")`. Never `user.role === "…"`. |
| Status | Always `<StatusDot status="…" />`. Never color without label. |
| Identifiers | Always `<MonoId value="…" />` for SKUs, QR codes, claim codes, batch IDs. |
| Empty states | `<EmptyState>` on every list. Two variants: nothing exists (create CTA) vs nothing matches filters (clear CTA). |
| Eco-score | Always `<EcoScoreBadge score={n} grade="A|B|C|D|E" />`. Never a plain number. |
| Icons | Lucide React only. |
| Comments | No comments except for non-obvious WHY. No docstrings. |

---

## File map

```
k4rl/
├── CLAUDE.md                          ← session rules + conventions (read first)
├── vision.md                          ← binding product contract (read first)
├── docs/
│   ├── DECISIONS.md                   ← 20 architecture decisions
│   └── HANDOFF.md                     ← this file
├── src/
│   ├── app/
│   │   ├── brand/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx     ← STUB
│   │   │   ├── dpps/page.tsx          ← STUB
│   │   │   ├── settings/page.tsx      ← STUB
│   │   │   └── products/
│   │   │       ├── page.tsx           ← COMPLETE (list + 4 filters)
│   │   │       ├── new/page.tsx       ← COMPLETE (4-step wizard)
│   │   │       └── [id]/page.tsx      ← COMPLETE (split layout detail)
│   │   ├── admin/dashboard/page.tsx   ← STUB
│   │   └── consumer/wardrobe/page.tsx ← STUB
│   ├── components/
│   │   ├── ui/                        ← ShadCN — do not modify
│   │   ├── layout/                    ← shell, sidebar, topbar, breadcrumbs
│   │   ├── shared/                    ← StatusDot, MonoId, EcoScoreBadge, EmptyState, ImageUploader
│   │   └── brand/
│   │       ├── sku-scan-dialog.tsx
│   │       ├── material-request-dialog.tsx
│   │       ├── product-gallery.tsx
│   │       └── product-steps/
│   │           ├── step-basic-info.tsx
│   │           ├── step-materials.tsx  ← most complex component
│   │           ├── step-eco-score.tsx
│   │           └── step-review.tsx     ← split layout, mirrors product detail
│   ├── context/auth.tsx               ← mock auth + permissions matrix
│   ├── lib/
│   │   ├── eco-score.ts
│   │   ├── utils.ts
│   │   ├── types/product.ts
│   │   └── mock/
│   │       ├── products.ts            ← 4 products, 3 batches, 4 QR items
│   │       ├── materials.ts           ← 15 materials + 2 pending requests
│   │       ├── brands.ts
│   │       ├── factories.ts
│   │       └── ownership.ts
│   └── hooks/use-mobile.ts
└── .claude/launch.json                ← preview server config
```

---

## Changes made this session (2026-06-17)

### step-materials.tsx
- Visual composition rows removed from the Materials step — they now live only on the Review step and product detail page. Step 2 is now just the calculator (ring + status text) + edit controls.
- Empty-state placeholder ("Use the editor below…") removed.
- Category labels updated to full names: `"Natural fiber"`, `"Recycled synthetic"`, `"Semi-synthetic"`, `"Vegan leather"`.
- Material name truncation removed — names wrap.

### step-review.tsx (full rewrite)
- Completely redesigned from a data table to a split layout mirroring the product detail page.
- Left panel: product identity → composition visual rows (icon badge, proportion bar, category label) → eco-score → public toggle → nav buttons.
- Right panel: read-only image preview with thumbnail strip.
- Uses real ShadCN `<Switch>` (replaced the hand-rolled `SwitchFallback`).

### new/page.tsx
- `isWideStep` extended from `step === 2` to `step === 2 || step === 4` so the Review step also gets full-bleed treatment.

### products/page.tsx (filter overhaul)
- Filter bar redesigned: contained panel with "Filters" label, 4 controls in a responsive grid.
- Added: category filter (derived from brand's products), eco-grade filter (A/B/C/D/E/Unscored).
- Active filter chips appear below selects — each independently dismissible, grade chips colour-coded.
- Count in header updates to show "N products · M shown" when filters are active.
- Active sort column now highlighted in the table header.
- Extracted `SortButton` and `FilterChip` as sub-components within the file.

### products/[id]/page.tsx
- **Label Preview card removed** — was redundant with the visual composition rows above it.
- **Details section cleaned up** — weight and country removed (already shown in identity header). Only created date and DPP generated date remain.

### Docs
- `CLAUDE.md` — created comprehensive version covering all conventions, patterns, and constraints.
- `docs/DECISIONS.md` — created with 20 architecture decision records.
- `docs/HANDOFF.md` — this file, updated at end of session.
