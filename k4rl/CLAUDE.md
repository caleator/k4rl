# CLAUDE.md — K4RL

## On every session start

1. Read `vision.md` — binding contract for stack, architecture, navigation, product logic, and design rules.
2. Read `CLAUDE.md` (this file) — session behaviour and codebase conventions.

If a prompt conflicts with `vision.md`, flag it before building. If something is unclear, ask before building. Never assume scope.

---

## Project purpose

K4RL is a SaaS platform that makes EU Digital Product Passport (DPP) compliance effortless for fashion brands. A brand creates a product, defines its material composition, and generates a fully compliant DPP. Every physical item gets a unique QR + claim code pair. Consumers scan, claim, and transfer ownership through a self-serve flow with no store involvement.

---

## Portals and routes

The platform is five entirely separate apps sharing no chrome or layout between them.

| Portal | Route prefix | Who uses it |
|---|---|---|
| Brand Portal | `/brand` | Fashion brand teams |
| Admin Portal | `/admin` | K4RL internal team |
| Consumer Web App | `/consumer` | End consumers |
| Public DPP Page | `/product/[qrCode]` | Anyone with a QR — no login |
| Factory link flow | `/factory/[token]` | Factories — no account |

**Consumer sub-routes:**
- `/product/[qrCode]` — Public DPP page. No login. Shows composition, eco-score, factory, certs, and item state CTA.
- `/consumer/claim/[qrCode]` — 3-step claim flow (email → claim code → success). No login required; claim code validated against `QrItem.claimCode`.
- `/consumer/auth/login` + `/consumer/auth/register` — Consumer auth pages, separate from brand auth.
- `/consumer/dashboard` — Owned items list. Requires consumer login.
- `/consumer/item/[itemId]` — Item detail + full ownership timeline. Requires consumer login.
- `/consumer/transfer/[itemId]` — Owner reviews and approves/rejects a pending transfer request.

---

## User roles and permissions

Roles are defined in `src/context/auth.tsx`. There is no real auth in Phase 1 — roles are switched via the `RoleSwitcher` component.

| Role | Key permissions |
|---|---|
| `k4rl-admin` | `manage:materials`, `manage:brands`, `view:analytics:platform` |
| `brand-admin` | All brand actions including `manage:billing`, `manage:team` |
| `brand-editor` | `create:product`, `generate:dpp`, `generate:batch`, `manage:factories` |

Use `can(permission)` from `useAuth()` to gate UI actions. Never hardcode role strings in components — always go through the permissions matrix.

---

## Core business rules

### Material vocabulary
Brands select materials exclusively from the admin-managed library in `src/lib/mock/materials.ts`. Free-text material entry is never permitted. The system normalises all known aliases to a single canonical term before storage.

### Composition
A product's composition must sum to exactly 100% before a DPP can be generated. Percentages are integers. Each material can appear only once per composition.

### EcoScore
Calculated from LCA values attached to each library material. Brands cannot see or influence the underlying data — they see only the resulting score (0–100) and grade (A–E). Calculation logic lives in `src/lib/eco-score.ts`.

**Score weights:** CO₂ 35%, water 25%, energy 15%, chemistry 15%, circularity 10%.  
**Grade thresholds:** A ≥ 85, B ≥ 70, C ≥ 55, D ≥ 40, E < 40.

**Modifiers applied before scoring:**
- `isRecycled`: CO₂ ×0.5, energy ×0.5, water ×0.1
- `isOrganic`: water ×0.4, chemistry ×0.6
- `hasPuCoating`: CO₂ ×1.4, chemistry −2
- `hasPvcCoating`: CO₂ ×1.6, energy +50 MJ
- `hasHazardousFinish`: chemistry floored near worst case
- `hasElastane`: circularity capped at 30, CO₂ ×1.05

### DPP immutability
A DPP cannot be edited after generation. A new version is generated for corrections. All previous versions remain permanently in the product timeline — nothing is deleted or overwritten.

### QR / item states
```
Items:  locked → unlocked → claimed → [transfer-requested] → [re-locked]
DPPs:   draft → generated (immutable)
Subscriptions: trialling → active → past-due → cancelled
QR batches: generating → ready → dispatched
```

`production` is a distinct QR state — generated and associated with a product but not released to market. A QR in `production` does not start a claim window and is invisible on the public DPP page.

---

## Material categories

Defined in `src/lib/mock/materials.ts` as `MaterialCategory`. Always use the full canonical label in the UI.

| Value | Full label |
|---|---|
| `"Natural fiber"` | Natural fiber |
| `"Recycled synthetic"` | Recycled synthetic |
| `"Synthetic"` | Synthetic |
| `"Semi-synthetic"` | Semi-synthetic |
| `"Vegan leather"` | Vegan leather |
| `"Trim"` | Trim |
| `"Coating"` | Coating |

---

## Design principles

- **Dark mode is the default.** System mode is also supported. Never hardcode light-mode-only styles.
- **Composition is the primary content** on the Materials step and product detail view — not the product image.
- **Images support content; they don't dominate it.** Product images are supplementary context, not hero elements.
- **Status indicators always use dot + label** — never color alone. Use `<StatusDot>` from `src/components/shared/status-dot.tsx`.
- **Identifiers** (SKUs, QR codes, claim codes, batch IDs) always render in monospace. Use `<MonoId>` from `src/components/shared/mono-id.tsx`.
- **Empty states are invitations to act** — never dead ends. Always include a specific call to action.
- **Copy voice:** direct, calm, professional. No marketing language inside the UI. Sentence case everywhere. Errors are specific about what went wrong and what to do next. Button labels are active verbs.

---

## Component conventions

### Before creating a new component
1. Check `src/components/ui/` — ShadCN/UI components are the base.
2. Check `src/components/shared/` — shared primitives for the whole app.
3. Check `src/components/brand/` and `src/components/layout/` — portal-specific components.

Never rebuild a ShadCN component from scratch. Extend it.

### Shared primitives
| Component | Purpose |
|---|---|
| `<StatusDot status="…">` | Colored dot + label for any status value |
| `<MonoId>` | Monospace rendering for IDs and codes |
| `<EcoScoreBadge>` | Grade badge (A–E) with consistent styling |
| `<EmptyState>` | Consistent empty state with icon, title, description, CTA |
| `<ImageUploader>` | Drag-and-drop multi-image upload with thumbnail labeling |

### Layout components
| Component | Purpose |
|---|---|
| `<PortalLayout>` | Root shell: sidebar + topbar + content area |
| `<AppSidebar>` | Collapsible left sidebar (56px icon-only when collapsed) |
| `<TopBar>` | Header: logo left, page title centre, notification bell right |
| `<Breadcrumbs>` | Required on all pages 3+ levels deep |
| `<PageHeader>` | Page-level heading row |
| `<SidebarUserFooter>` | Avatar + name + brand name + account menu |
| `<SubscriptionBanner>` | Contextual billing alert banner |

---

## Technical conventions

### Stack
- **Framework:** Next.js (App Router), Turbopack
- **UI:** ShadCN/UI + Radix primitives
- **Styling:** Tailwind CSS — no inline `px` values outside the spacing scale, no `!important`
- **Icons:** Lucide React only
- **Package manager:** PNPM
- **Data:** Mock/dummy data throughout — no real backend

### Default brand resolution
Brand portal pages filter by `user.brandId`. When the active role is `k4rl-admin` (no `brandId`), pages default to `"brand-001"` via `user.brandId ?? "brand-001"`. This keeps brand portal pages functional without requiring a role switch. Apply this pattern to every brand-scoped lookup: `const effectiveBrandId = user.brandId ?? "brand-001"`.

### Save as draft — wizard pattern
The product creation wizard (`/brand/products/new`) shows a "Save as draft" button from step 2 onwards. The button sits in the step indicator `<nav>` to the right of the step list. It calls `handleSaveAsDraft` which pushes the product with `dppStatus: "draft"` and navigates to the product detail page. Step 3 (`StepReviewDpp`) also receives `onSavedAsDraft` for its own in-step draft save path (used when pending materials block DPP generation).

### Mock product images
Product thumbnails and gallery images use Unsplash CDN URLs (`https://images.unsplash.com/photo-[id]?w=400&h=400&fit=crop&auto=format`). Use fashion/clothing-specific photo IDs — never abstract or placeholder images. Gallery images use `w=800&h=600`.

### File placement
```
src/
  app/[portal]/          → Pages (route segments)
  components/ui/         → ShadCN primitives (do not modify)
  components/shared/     → Cross-portal shared components
  components/layout/     → Shell and navigation components
  components/brand/      → Brand portal-specific components
  lib/mock/              → Mock data and types
    products.ts          → QrItem, Product, Batch — QR_ITEMS is a mutable module-level array
    brands.ts            → Brand data
    factories.ts         → Factory and FactoryLink data
    materials.ts         → Material library + MaterialCategory type
    consumers.ts         → ConsumerUser — seeded demo accounts
    ownership.ts         → OwnershipEvent — append-only ownership timeline
    disputes.ts          → FraudReport — consumer-submitted fraud reports, mutable array
  lib/types/             → Shared TypeScript interfaces
  lib/eco-score.ts       → EcoScore calculation engine
  context/auth.tsx       → Brand/admin mock auth + permissions
  context/consumer-auth.tsx → Consumer auth (separate from brand auth)
```

### Searchable material combobox
Materials are selected via a Radix `Popover` + `Command` pattern (see `MaterialCombobox` in `step-materials.tsx`). This pattern must be used anywhere brands select a material — never a plain `<select>`.

### Consumer auth pattern
Consumer auth is entirely separate from brand auth. `ConsumerAuthProvider` (in `src/context/consumer-auth.tsx`) wraps `src/app/consumer/layout.tsx` only. The `SESSION_USERS` array is a mutable module-level copy of `CONSUMER_USERS` that persists new registrations within the session. Use `useConsumerAuth()` to access `user`, `login`, `register`, `logout`.

Demo accounts (password: `demo1234`):
- `alex.petrou@gmail.com` — owns item-001, item-005, item-006; previously owned item-007 (fraud scenario)
- `maria.k@hotmail.com` — owns item-004 (has a pending transfer request from new.owner)
- `new.owner@gmail.com` — transfer requester for item-004; current owner of item-007

### Mobile-first consumer shell pattern
Consumer-facing pages (`/product/`, `/consumer/`) use a narrow, mobile-first layout: `max-w-lg`, `px-4`, large CTAs (`size="lg"`), no sidebar. Each route group defines its shell inline (a local `Shell` component inside the page file) rather than relying on a shared `PortalLayout`. The sticky header shows the K4RL logo centered; back navigation uses an `ArrowLeft` icon to the left. Do not use `PortalLayout`, `AppSidebar`, or `TopBar` in consumer pages.

### In-session mock mutation pattern
`QR_ITEMS` (in `src/lib/mock/products.ts`) and `OWNERSHIP_EVENTS` (in `src/lib/mock/ownership.ts`) are module-level mutable arrays. Consumer flows write mutations directly to these arrays (`item.state = "claimed"`, `OWNERSHIP_EVENTS.push(…)`). Mutations persist across client-side navigation within a session but reset on hard refresh. Pages that must reflect these mutations must be `"use client"` components — do not use server components for pages that read post-claim state.

### Multi-step flow pattern (StepDots)
Claim flow and similar linear flows use a `StepDots` component (defined locally in the page): a row of dots where the active step is a wider pill, completed steps are dimmed, future steps are muted. Defined inline — do not extract to shared components unless 3+ pages use it.

### Fraud reports and disputes pattern
Fraud reports live in `src/lib/mock/disputes.ts` as `FRAUD_REPORTS` (mutable array). The flow is one-way: consumer submits → brand sees it in `/brand/disputes`.

**Claim flow end states** (`/consumer/claim/[id]`):
- Successful claim + logged in: success screen (step 3) auto-navigates to `/consumer/dashboard` after 1800ms. The step 3 check must come before the item state guards in the render function, because the claim mutation sets `item.state = "claimed"` before `setStep(3)` — if the already-claimed guard runs first it would intercept the just-completed claim.
- Successful claim + not logged in: success screen shows "Create account" / "Sign in" / "View product passport" CTAs. No auto-navigate.
- Already claimed by someone else: shows an `AlreadyClaimedScreen` with a fraud flag form (email + description). Email is pre-filled if the user is logged in and the field is disabled. No account required to submit. Submits to `FRAUD_REPORTS`. Confirmation screen shows the reporter's email.

**Consumer side** (`/consumer/item/[id]`): The "Report an issue" button is shown only when `wasPreviousOwner` is true — i.e., the logged-in user has a `"claimed"` event in the ownership timeline for this item, but `item.ownerEmail` is no longer their email. The button is an inline collapsible: collapsed state is a dashed borderless row; expanded state is a card with destructive border. On submit, the report is pushed to `FRAUD_REPORTS` and a `"fraud-flagged"` event is pushed to `OWNERSHIP_EVENTS`.

**Dashboard**: Previously-owned items (user has a `"claimed"` event but is no longer owner) are surfaced alongside currently-owned items, with a "Transferred" badge. This is derived from `OWNERSHIP_EVENTS` at render time — not a field on `QrItem`.

**Brand side** (`/brand/disputes`): `"use client"` filterable table. `enrich(report)` resolves item + product from `QR_ITEMS` / `PRODUCTS` at render time and returns an `EnrichedReport` with `itemQrCode`, `productId`, `productName` added. Rows are rendered by a local `DisputeRow` component with its own `expanded: boolean` state — collapsed shows a summary row, expanded reveals a detail grid. The product filter dropdown is only shown when more than one product has disputes. Added to sidebar nav with `ShieldAlert` icon, between Resellers and Billing.

### Material request workflow (Workflow 6)

**Brand portal — material request flow:**
- `MaterialRequestDialog` (in `src/components/brand/material-request-dialog.tsx`) accepts an `onSubmitted?: (req: MaterialRequest) => void` callback. When the dialog submits, it pushes to `MATERIAL_REQUESTS` and calls the callback.
- `StepMaterials` wires the callback: on submission, a pending composition entry is added — `{ materialId: "", materialName: req.materialName, percentage: 0, pendingRequestId: req.id }`.
- Pending entries show a distinct amber "Pending admin approval" row in both the edit list and the visual preview. The combobox is NOT shown for pending entries.
- `handleNext` in StepMaterials allows proceeding even with pending entries (total must still = 100%). A notice explains DPP generation will be blocked.
- `StepReviewDpp` checks `hasPendingMaterials = draft.composition.some(c => c.pendingRequestId)`. If true: eco-score is suppressed, a warning banner replaces the generate button, and a "Save as draft" button calls `onSavedAsDraft`.
- `new/page.tsx` handles `onSavedAsDraft`: pushes product with `dppStatus: "draft"` (no eco-score, no DPP generated at timestamp).
- Brand material requests list: `/brand/materials` — filterable by status (pending/approved/rejected). Shows expandable rows with LCA values, approval/rejection details.

**Admin portal — material review flow:**
- `/admin/materials/requests` — listed in admin sidebar as "Material requests" (Inbox icon), between Material library and the separator.
- Default filter is "Pending". Shows all requests with expand-to-review pattern.
- Approve action: opens `ApproveDialog`. LCA values pre-filled from brand submission. ALL five values are required. On confirm: pushes to `MATERIALS`, updates request with `status: "approved"`, `approvedMaterialId`. Material immediately available to all brands.
- Reject action: opens `RejectDialog`. Rejection reason is required. On confirm: updates request with `status: "rejected"`, `rejectionReason`.
- Both dialogs use `MATERIAL_REQUESTS[idx] = { ...req, ...changes }` pattern (object replacement, not mutation, for re-render triggering). Page uses `forceUpdate` counter to force re-render after mutation.

### Admin portal pattern
The admin portal uses its own layout and sidebar components, entirely separate from the brand portal:
- `src/components/layout/admin-sidebar.tsx` — `AdminSidebar` with admin-specific nav (Dashboard, Material library, Brands, Analytics). No brand name in the sidebar footer — the k4rl-admin mock user has no `brandName`.
- `src/components/layout/admin-portal-layout.tsx` — `AdminPortalLayout` wraps `AdminSidebar` + `PageHeader`. No `SubscriptionBanner`.
- `src/app/admin/layout.tsx` — uses `AdminPortalLayout`.

Admin nav items (in order): Dashboard (`/admin/dashboard`), Material library (`/admin/materials`), separator, Brands (`/admin/brands`), Analytics (`/admin/analytics`).

Admin pages:
- **Dashboard** (`/admin/dashboard`): 4-metric KPI grid (brands, DPPs, QR codes, claimed), recent ownership event activity feed. All derived at render time from mock arrays.
- **Material library** (`/admin/materials`): Sortable by name / CO₂ / circularity, filterable by category and approval status, searchable. Expandable rows show full LCA data grid.
- **Brands** (`/admin/brands`): Filterable by subscription status and tier. Expandable rows show contact, DPP usage, QR item counts, team members list.
- **Analytics** (`/admin/analytics`): KPI grid, secondary metrics (team members, fraud reports), per-brand breakdown table with claim rate bar, subscription mix tiles.

Default mock user is `k4rl-admin` (Alexandros Daskalakis). Brand portal users switch to brand-admin/editor via the sidebar footer role switcher.

**`PageHeader` component**: Does not accept props — it reads from layout context. For new brand pages, use plain `<h1>` + `<p>` markup instead.

### Product detail stats section pattern
Brand product detail page (`/brand/products/[id]`) shows a two-tile stats grid before the QR batches section. Derive counts at render time:
```ts
const productItems = QR_ITEMS.filter(i => i.productId === product.id);
const totalClaimed = productItems.filter(i => i.claimedAt).length;
const totalFlagged = FRAUD_REPORTS.filter(r => productItems.some(i => i.id === r.itemId)).length;
```
The fraud flags tile uses `border-destructive/30 bg-destructive/5` and `text-destructive` on the count when `totalFlagged > 0`, otherwise matches the claimed tile style. The section is only rendered when `totalQr > 0`.

### Terminology: QR & claim code pairs
The unit of generation and cancellation is the **QR & claim code pair**. Never refer to a "QR code" alone when describing what the factory handles. Labels say "pairs", counts say "N pairs generated", cancellation says "Cancel pair". The QR code is printed visibly; the claim code is hidden inside the garment.

### Split layout pattern
The Materials step and product detail page use a two-column split layout: composition/content panel on the left (taking most of the space), narrow image panel on the right (~260px). Grid: `lg:grid-cols-[1fr_260px]`. The parent page wrapper switches to `max-w-5xl` and removes card padding (`overflow-hidden p-0`) for split-layout steps.

### Accessibility requirements
- Every interactive element has a visible focus ring
- Icon-only buttons must have `aria-label`
- Percentage inputs must have `aria-label` describing what they control
- Grouped form controls use `<fieldset>` + `<legend>`
- Live regions (`role="status" aria-live="polite"`) on any value that updates dynamically (e.g. composition total)
- Status and category information must never rely on color alone — always pair with a text label

---

## Hard constraints

- **Never build anything listed as out of scope in `vision.md`** — factory login portal, reseller portal, ERP integrations, marketplace integrations, RFID, native app, full white-label public page, 3D models, wardrobe features, brand tier system.
- **Never introduce colors outside the installed Tailwind theme tokens.**
- **Never use emojis** in the UI or in code unless explicitly requested.
- **Never use `Lorem ipsum`** — all dummy content must be realistic and fashion/DPP-relevant.
- **Never use a tooltip as the sole surface for critical information.**
- **Never show raw error objects or stack traces** to users — always translate to actionable copy.
- **All data tables** must have: sticky headers, sortable columns, clearable filters, and a non-empty empty state with a call to action.
- **Toasts** on every async action: success, error, and in-progress states.
- **Loading skeletons** on every surface that fetches or generates data.
- **Responsive** down to 375px viewport width.
