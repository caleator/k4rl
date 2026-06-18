# K4RL — Build Roadmap

> Master build plan. Follows vision.md.
> Status: 🔲 not started · 🔄 in progress · ✅ done

---

## Phase 0 — Foundation ✅

| # | Task | Status |
|---|---|---|
| 0.1 | Project setup (Next.js, Tailwind, ShadCN, tweakcn theme, DM Sans / IBM Plex Mono) | ✅ |
| 0.2 | Folder structure — all 5 portals | ✅ |
| 0.3 | Mock data layer (materials, products, brands, ownership, factories) | ✅ |
| 0.4 | Eco-score engine (blend logic, modifiers, normalization, grading A–E) | ✅ |
| 0.5 | Auth context + role switcher (k4rl-admin, brand-admin, brand-editor) | ✅ |
| 0.6 | Shared portal layout (collapsible sidebar, in-window page header, subscription banner) | ✅ |
| 0.7 | vision.md + CLAUDE.md + plans/ | ✅ |

---

## Phase 1 — Brand Portal

### 1A — Shell & Navigation ✅

| # | Task | Status |
|---|---|---|
| 1A.1 | Sidebar — collapsible icon-only at 56px, 200ms ease-out | ✅ |
| 1A.2 | Page header — in-window, page title auto-resolved from pathname, notifications bell | ✅ |
| 1A.3 | Sidebar footer — avatar, name, brand, role switcher, account menu | ✅ |
| 1A.4 | Subscription status banner (trialling / past-due / cancelled) | ✅ |

### 1B — Dashboard
| # | Task | Status |
|---|---|---|
| 1B.1 | DPP quota usage card (used / limit, progress bar) | 🔲 |
| 1B.2 | Recent products list | 🔲 |
| 1B.3 | Pending factory actions card | 🔲 |
| 1B.4 | Quick action buttons (New product, Generate DPP) | 🔲 |

### 1C — Products ✅

| # | Task | Status |
|---|---|---|
| 1C.1 | Products table — thumbnail, sortable columns, search + status filter, empty state | ✅ |
| 1C.2 | Product creation Step 1 — Basic info (name, SKU + barcode scan, category, weight, country, thumbnail upload) | ✅ |
| 1C.3 | Product creation Step 2 — Material composition (product identity hero, garment-label summary, searchable combobox, stepper, validation) | ✅ |
| 1C.4 | Product creation Step 3 — Eco-score preview (live calculation, subscore breakdown, blended impacts) | ✅ |
| 1C.5 | Product creation Step 4 — Review & submit | ✅ |
| 1C.6 | Product detail page (thumbnail header, gallery, details grid, eco-score, composition, QR batches) | ✅ |
| 1C.7 | Unknown material request dialog | ✅ |

### 1D — DPPs
| # | Task | Status |
|---|---|---|
| 1D.1 | DPPs table (status: draft / generated, sortable) | 🔲 |
| 1D.2 | One-click DPP generation flow | 🔲 |
| 1D.3 | Generated DPP view (immutable, timestamped, public URL) | 🔲 |
| 1D.4 | DPP version history in product timeline | 🔲 |
| 1D.5 | QR batch generation (quantity input → N unique QR+claim pairs) | 🔲 |
| 1D.6 | Batch detail — QR+claim code table (monospace), download labels | 🔲 |
| 1D.7 | QR item states — production / locked / unlocked / claimed | 🔲 |

### 1E — Factories
| # | Task | Status |
|---|---|---|
| 1E.1 | Factories list (name, country, type, certificate status) | 🔲 |
| 1E.2 | Add factory form | 🔲 |
| 1E.3 | Factory detail — sent links history, uploaded certificates | 🔲 |
| 1E.4 | Generate certificate upload link → copy / email | 🔲 |
| 1E.5 | Generate label download link → copy / email | 🔲 |

### 1F — Resellers
| # | Task | Status |
|---|---|---|
| 1F.1 | Resellers list (authorised stores) | 🔲 |
| 1F.2 | Invite reseller by email | 🔲 |
| 1F.3 | Pending requests — approve / reject | 🔲 |

### 1G — Billing
| # | Task | Status |
|---|---|---|
| 1G.1 | Current plan card (Starter / Growth / Enterprise) | 🔲 |
| 1G.2 | Usage this month (DPPs used / limit) | 🔲 |
| 1G.3 | Plan upgrade / downgrade flow | 🔲 |
| 1G.4 | Payment method (card on file) | 🔲 |
| 1G.5 | Invoice history (downloadable) | 🔲 |

### 1H — Settings
| # | Task | Status |
|---|---|---|
| 1H.1 | Brand profile (name, country, email) | 🔲 |
| 1H.2 | Team management (members, roles, invite, remove) | 🔲 |
| 1H.3 | Notification preferences | 🔲 |

### 1B — Dashboard (last — needs real data to populate)
> Build after 1D so quota, DPP count, and factory actions have real content.

---

## Phase 2 — Admin Portal

### 2A — Shell & Navigation
| # | Task | Status |
|---|---|---|
| 2A.1 | Admin sidebar (items per vision.md) | 🔲 |

### 2B — Dashboard
| # | Task | Status |
|---|---|---|
| 2B.1 | Platform stats (brands, DPPs, subscriptions, disputes) | 🔲 |
| 2B.2 | Recent activity feed | 🔲 |
| 2B.3 | Alerts (pending material requests, fraud flags, failed payments) | 🔲 |

### 2C — Material Library
| # | Task | Status |
|---|---|---|
| 2C.1 | Materials table (sortable, filterable by category) | 🔲 |
| 2C.2 | Add material form (LCA values, scores) | 🔲 |
| 2C.3 | Edit material form | 🔲 |
| 2C.4 | Pending requests table (brand submissions) | 🔲 |
| 2C.5 | Review request — approve / reject flow | 🔲 |

### 2D — Brands
| # | Task | Status |
|---|---|---|
| 2D.1 | Brands table (plan, usage, status) | 🔲 |
| 2D.2 | Brand detail (members, DPPs, subscription history) | 🔲 |

### 2E — Analytics
| # | Task | Status |
|---|---|---|
| 2E.1 | DPP volume over time chart | 🔲 |
| 2E.2 | Material usage breakdown | 🔲 |
| 2E.3 | Eco-score distribution | 🔲 |
| 2E.4 | Subscription tier breakdown | 🔲 |

---

## Phase 3 — Consumer Web App

| # | Task | Status |
|---|---|---|
| 3.1 | Public product scan page — locked / unlocked / claimed states | 🔲 |
| 3.2 | Claim flow (email + claim code entry) | 🔲 |
| 3.3 | Register / login | 🔲 |
| 3.4 | Wardrobe — owned items list | 🔲 |
| 3.5 | Item detail — ownership timeline | 🔲 |
| 3.6 | Release ownership (re-lock) flow | 🔲 |
| 3.7 | Transfer flow (request → approve / reject) | 🔲 |
| 3.8 | Fraud flag button | 🔲 |
| 3.9 | Claim grace period — 48h countdown, email reminder states | 🔲 |

---

## Phase 4 — Public DPP Page

| # | Task | Status |
|---|---|---|
| 4.1 | Public DPP page — no login, EU-compliant fields | 🔲 |
| 4.2 | Material composition display | 🔲 |
| 4.3 | Eco-score display (conditional on brand setting) | 🔲 |
| 4.4 | Claim ownership prompt (only if unlocked + unclaimed) | 🔲 |
| 4.5 | Brand template selector (predefined templates only) | 🔲 |

---

## Phase 5 — Factory Link Pages

| # | Task | Status |
|---|---|---|
| 5.1 | Certificate upload page (token-gated, no login) | 🔲 |
| 5.2 | Label download page (token-gated, no login) | 🔲 |
| 5.3 | Expired token state | 🔲 |
