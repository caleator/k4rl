# PLAN.md — K4RL Platform
> Update this file as each task is completed. Mark done items with ✅.
> Never start a new phase before the previous one is approved.

---

## Phase 0 — Foundation ✅

- ✅ vision.md created and approved
- ✅ CLAUDE.md created
- ✅ Theme installed
- ✅ Next.js + ShadCN + Tailwind + PNPM project scaffolded
- ✅ Navigation structure defined and documented

---

## Phase 1 — Brand Portal

### Shell
- [ ] Top bar (logo + page title + bell)
- [ ] Left sidebar with all nav items
- [ ] Sidebar collapse (icon-only, 200ms ease-out)
- [ ] Sidebar footer (user avatar + name + brand name + selector)
- [ ] Responsive down to 375px

### Dashboard
- [ ] Summary metric cards (products, DPPs generated, QR codes issued)
- [ ] Recent products list
- [ ] Recent activity feed
- [ ] Empty state

### Products
- [ ] Products list (table, sortable, filterable)
- [ ] Product detail page
- [ ] Create product flow (name, SKU, country, factory, image, collection)
- [ ] Material selection from controlled vocabulary
- [ ] Percentage validation (must total 100%)
- [ ] Unknown material request flow
- [ ] QR batch generation per product
- [ ] Product states (draft, active, production)
- [ ] Empty state

### DPPs
- [ ] DPPs list (table, sortable, filterable)
- [ ] DPP detail page (immutable, timestamp, public URL)
- [ ] Generate DPP flow (one-click from approved product)
- [ ] Eco-score toggle (make public / keep private)
- [ ] Empty state

### Factories
- [ ] Factories list
- [ ] Add factory (name, country, type)
- [ ] Send certificate upload link flow
- [ ] Send label download link flow
- [ ] View uploaded certificates
- [ ] Empty state

### Resellers
- [ ] Resellers list
- [ ] Invite reseller flow
- [ ] Pending access requests
- [ ] Empty state

### Billing
- [ ] Current plan display (Starter / Growth / Enterprise)
- [ ] Plan upgrade / downgrade flow
- [ ] Payment method management
- [ ] Invoice history (downloadable)
- [ ] Subscription status (active, past due, cancelled, trialling)
- [ ] Overage display

### Settings
- [ ] Brand profile (name, logo, details)
- [ ] Team management (invite, roles: Admin / Editor)
- [ ] Notification preferences
- [ ] API keys / integrations section

---

## Phase 2 — Admin Portal

### Shell
- [ ] Top bar + left sidebar (same pattern as Brand Portal)
- [ ] Sidebar footer (K4RL admin user)
- [ ] Responsive down to 375px

### Dashboard
- [ ] Platform-level metrics (total brands, DPPs, QR codes)
- [ ] Recent activity feed
- [ ] Empty state

### Material Library
- [ ] Materials list (table, sortable, filterable)
- [ ] Add / edit material
- [ ] Approve / reject material requests from brands
- [ ] Controlled vocabulary management
- [ ] Environmental data per material (CO₂, water, etc.)
- [ ] Empty state

### Brands
- [ ] All brands list (table)
- [ ] Brand detail page
- [ ] Account status management
- [ ] Empty state

### Analytics
- [ ] Platform-level analytics dashboard
- [ ] DPPs generated over time
- [ ] QR codes issued over time
- [ ] Active brands over time

---

## Phase 3 — Consumer Web App

- [ ] Shell (minimal top bar, mobile-first)
- [ ] Public product info page (pre-claim, no login)
- [ ] "Activate your product" entry point
- [ ] Email entry step
- [ ] Claim code entry step
- [ ] Ownership confirmed screen
- [ ] Transfer initiation flow (release / re-lock)
- [ ] Incoming transfer request (approve / reject)
- [ ] Fraud flag flow
- [ ] Claim grace period countdown display
- [ ] Empty / error states

---

## Phase 4 — Public DPP Page

- [ ] Shell (no nav, K4RL logo only)
- [ ] Material composition display
- [ ] Country of manufacture display
- [ ] Environmental data display
- [ ] Eco-score display (if brand opted in)
- [ ] "Activate your product" CTA (shown only if item unlocked + unclaimed)
- [ ] Brand customisation (predefined templates)

---

## Phase 5 — Factory Link Pages

- [ ] Shell (no nav, single-action)
- [ ] Certificate upload page
- [ ] Label download page (QR + claim code, print-ready)

---

## Shared Components

- [ ] DataTable (sortable, filterable, empty state)
- [ ] StatusDot (colored dot + label)
- [ ] EmptyState (icon + message + CTA)
- [ ] EcoScoreBadge
- [ ] LoadingSkeleton
- [ ] Toast system (success, error, in-progress)
- [ ] ConfirmDialog
- [ ] PageHeader (title + breadcrumb + actions)
- [ ] IdentifierDisplay (QR code, claim code, SKU — monospace + accent border)

---

## Notes
- Shared components should be built the first time they're needed and reused from there
- Each phase requires visual approval before moving to the next
- vision.md is the source of truth — update it if product decisions change
