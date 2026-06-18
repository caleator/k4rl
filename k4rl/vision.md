# VISION.MD — K4RL Platform
> Read this before every non-trivial change.
> This is the binding contract for working in this project.
> If something you're about to do conflicts with anything here — stop and ask. Don't quietly improvise.
> The goal is one coherent product, not seven flavors of almost right.

---

## North Star

K4RL exists to make EU Digital Product Passport compliance effortless for fashion brands. A brand logs in, builds a product, and generates a fully compliant DPP in under 6 minutes — without knowing anything about regulation. Every physical item gets a unique QR + claim code pair. Consumers scan, claim, and transfer ownership through a self-serve flow that requires zero store involvement. The product is serious infrastructure dressed in calm, premium UI: it should feel like the tool a compliance-forward fashion house would trust.

---

## Who We're Building For

| User | Portal | Core Job |
|---|---|---|
| K4RL internal team | Admin Portal | Library governance, brand oversight, analytics |
| Fashion brand teams | Brand Portal | Create products, generate DPPs, manage factories + billing |
| End consumers | Consumer Web App | Scan QR, claim ownership, transfer items |
| Anyone with a QR | Public DPP Page | View product info, verify authenticity — no login |
| Factories | Link-only flow | Upload certificates, download labels — no account |

---

## Tech Stack

- **Framework:** Next.js (latest stable)
- **UI Components:** ShadCN/UI
- **Styling:** Tailwind CSS
- **Package Manager:** PNPM
- **Theme:** Use the installed theme. Do not override or extend it unless explicitly asked.
- **Data:** Dummy/mock data throughout — no real backend in Phase 1 UI build
- **Auth (mock):** Simulate role switching between `k4rl-admin`, `brand-admin`, `brand-editor`

---

## Portal Architecture

```
/app
  /admin            → K4RL Admin Portal (internal team)
  /brand            → Brand Portal (fashion brands)
  /consumer         → Consumer Web App (end customers)
  /public/[id]      → Public DPP Page (no auth, anyone with QR)
  /factory/[token]  → Factory link pages (no auth, link-only)
```

---

## Product States — Always Handle All of Them

Items:
```
locked → unlocked → claimed → [transfer-requested] → [re-locked]
```

DPPs:
```
draft → generated (immutable)
```

Subscriptions:
```
trialling → active → past-due → cancelled
```

---

## ALWAYS

- Use ShadCN components as the base — extend, don't rebuild from scratch
- Sidebar collapses to icon-only with a smooth ease-out animation (200ms). Main content expands to fill full width with the same timing
- Sticky table headers on all data tables — columns visible on scroll
- All data tables: sortable columns, clearable filters, empty states with a specific call to action
- Identifiers (QR codes, claim codes, SKUs, batch IDs) always render in monospace font
- Light mode is the default. System mode also supported
- Toasts for all async actions: success, error, in-progress
- Breadcrumbs on all pages 3+ levels deep
- Responsive down to 375px
- Icons from Lucide React only
- Status indicators: colored dot + label (never color alone)
- Loading skeletons on all data-fetching surfaces
- Visible focus rings on all interactive elements

---

## NEVER

- Never introduce a color outside the installed theme tokens
- Never use emojis in the UI or in code (unless explicitly asked in a prompt)
- Never hardcode px values outside the Tailwind spacing scale
- Never use placeholder copy like "Lorem ipsum" — write realistic dummy content relevant to fashion/DPP context
- Never use a tooltip as the only way to surface critical information
- Never break the sidebar collapse animation
- Never show raw errors to the user — always translate to actionable copy
- Never use `!important`
- Never build a new component if a ShadCN component exists for the job

---

## Copy Voice

- **Tone:** Direct, calm, professional. No marketing language inside the product UI.
- **Case:** Sentence case everywhere. Title Case only for proper product names.
- **Errors:** Specific about what went wrong. Never vague. Always say what to do next.
- **Empty states:** An invitation to act — not a dead end.
- **Buttons:** Active verbs: "Generate DPP", "Send to factory", "Approve transfer", "Release ownership"

---

## Phase 1 Scope

In scope:
1. Admin Portal — material library, brand management, platform analytics
2. Brand Portal — product creation, DPP generation, QR/claim code batches, factory management, reseller management, subscription & billing
3. Consumer Web App — claim flow, ownership transfer, fraud flagging
4. Public DPP Page — no login, EU-compliant product info
5. Factory Link Flow — certificate upload + label download, no account

Out of scope — do not build, do not reference in UI:
- Factory portal with login
- Reseller/store portal
- Store unlock interface
- ERP integration
- Marketplace integrations (Vinted, StockX, Depop)
- RFID
- Native mobile app
- Full white-label public page
- Brand tier system / micro-fee distribution
- 3D model generation / wardrobe features

---

## Product Logic

- **QR code production status:** QR codes can exist in a `production` state — generated and associated with a product, but not yet released to market. This is distinct from `locked` (released but unclaimed) and from cancelled. A QR in production does not start a claim window and is not visible on the public DPP page.

- **DPP immutability:** A DPP cannot be edited after generation. If a brand needs to correct information, a new DPP version is generated. The previous version remains permanently visible in the product timeline. Nothing is overwritten or deleted — the full version history is always accessible.

- **Controlled material vocabulary:** Brands select materials from a predefined, admin-managed library only. Free-text material entry is not permitted at any point. The system normalises all known variants and aliases (e.g. `CTTN`, `eco-tex cotton`, `organic ctn`) to a single canonical term (e.g. `Cotton (organic)`). Normalisation is handled server-side before any data is stored or displayed.

- **Fixed environmental data:** Each material in the library has fixed, predefined LCA values (CO₂, water usage, energy, chemistry score, circularity score). These values are set and maintained exclusively at the admin level. Brands cannot view, edit, or influence the underlying data — they only see the resulting eco-score and grade for their product.

---

## Navigation

### General

- All 5 portals are entirely separate apps with different URLs and different shells. They share no common chrome, navigation, or layout between them.

### Brand Portal + Admin Portal

**Top bar (header)**
- Left: K4RL logo
- Centre: current page title
- Right: notifications bell only — no other controls

**Left sidebar**
- Collapsible to icon-only at 56px width
- Collapse/expand animation: 200ms ease-out
- When collapsed, nav items show icon only with tooltip on hover
- Main content area expands to fill the full remaining width when sidebar is collapsed

**Brand Portal sidebar items (in order)**
```
Dashboard
Products
DPPs
— (separator)
Factories
Resellers
— (separator)
Billing
Settings
```
- Team management lives inside Settings — not a standalone nav item
- QR batches are accessible from within a product or DPP — not a top-level nav item

**Admin Portal sidebar items:** TBD — define when building that portal

**Sidebar footer (fixed bottom)**
- User avatar (circle, initials fallback)
- User name (primary, 13px medium)
- Brand name (secondary, 11px muted) — omitted in Admin Portal
- Selector / chevron icon on the right
- Clicking opens account / logout menu

### Consumer Web App

- Mobile-optimised web app (browser, not native)
- Minimal top bar: K4RL logo + back button where relevant
- No sidebar
- Full-width content, large thumb-friendly CTAs

### Public DPP Page

- No navigation
- Standalone page — K4RL logo only

### Factory Link Pages

- No navigation
- Single-action page: certificate upload or label download only

---

## Pushback Protocol

If a prompt asks you to introduce something outside the theme, build something out of scope, skip empty/loading states, or use a library not in the stack — **flag it before building**. A two-line clarification costs less than a broken component.
