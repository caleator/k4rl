# Architecture Decision Record — K4RL

Append-only. Newest entries at the bottom.  
Each record explains why the product works the way it does — not just what was built.

---

## ADR-001 · Five separate portal apps, not a single unified app

**Date:** 2026-05 (initial architecture)

**Context:**  
K4RL serves five distinct audiences: internal team, brand teams, consumers, anyone with a QR code (no login), and factory workers accessing a link. Each has radically different jobs, trust levels, and device contexts. Consumers are on mobile web. Factory workers follow a one-time link with no account. The public DPP page must be reachable by anyone who scans a QR — it cannot require a session.

**Alternatives considered:**
- Single app with role-based routing (`/app/[role]/...`)
- Shared layout shell with per-role content areas

**Final choice:** Five entirely separate apps under `/brand`, `/admin`, `/consumer`, `/public/[id]`, `/factory/[token]`. No shared chrome, navigation, or layout between them.

**Reasoning:**  
Shared chrome would force a layout compromise that serves none of them well. A consumer claiming ownership needs a full-width, thumb-friendly mobile flow — not a sidebar. The public DPP page must be stateless and embeddable without any auth logic bleeding in. Keeping the portals isolated makes each one independently optimizable and avoids accidental privilege leakage between sessions.

---

## ADR-002 · Controlled material vocabulary — no free-text entry

**Date:** 2026-05 (initial architecture)

**Context:**  
DPPs are legal documents under EU regulation. The accuracy and consistency of material declarations are compliance requirements. If brands can type anything, the system accumulates unverifiable claims and inconsistent naming (`CTTN`, `eco-tex cotton`, `organic ctn` all meaning the same thing) that break comparability across products and audits.

**Alternatives considered:**
- Free-text entry with server-side normalisation
- Free-text with admin approval before a DPP can be generated
- Strict dropdown from an admin-managed library

**Final choice:** Brands select materials exclusively from an admin-managed library. Free-text entry is not permitted anywhere in the UI. The library is maintained by the K4RL team and normalises all known variants to canonical terms before storage.

**Reasoning:**  
Normalisation after the fact still allows dirty data to enter the system. An approval gate adds operational overhead for every product. A controlled library means every composition entry is verifiable, comparable, and carries attached LCA data. The trade-off is that brands occasionally need a material that isn't in the library — handled separately via a request dialog (see ADR-010).

---

## ADR-003 · DPP immutability — new version on correction, no edits

**Date:** 2026-05 (initial architecture)

**Context:**  
A Digital Product Passport is a compliance document. EU regulation requires that the information presented to consumers and authorities is stable and auditable. A brand must not be able to silently change what a QR code points to after items have been sold.

**Alternatives considered:**
- Edit in place with change log
- Draft/published states with full replacement on publish
- Versioned immutable records

**Final choice:** Once generated, a DPP cannot be edited. Corrections require generating a new version. All previous versions remain permanently accessible in the product timeline. Nothing is deleted or overwritten.

**Reasoning:**  
An edit-in-place model — even with change logs — creates ambiguity about what a consumer saw when they scanned the code. Immutable versioning gives a clear, auditable history: this QR showed this DPP on this date. The previous version stays visible because removing it would be equivalent to destroying an audit trail. This is the model used in legal document management for the same reasons.

---

## ADR-004 · EcoScore is brand-opaque — brands see grade, not LCA inputs

**Date:** 2026-05 (initial architecture)

**Context:**  
Each material in the library carries LCA values (CO₂, water, energy, chemistry, circularity). These values are K4RL's proprietary data and determine the eco-score brands present on their DPPs. If brands can see the underlying numbers, they can reverse-engineer how to game the score without genuinely improving the product.

**Alternatives considered:**
- Full transparency — show brands all LCA data
- Partial transparency — show normalised subscores but not raw values
- Complete opacity — score and grade only

**Final choice:** Brands see the resulting score (0–100), grade (A–E), and five normalised subscores. They cannot see the raw LCA inputs (kg CO₂/kg, L/kg, MJ/kg) for individual materials or the weighting factors.

**Reasoning:**  
The score needs to be credible to consumers and regulators. If a brand can see that increasing recycled content shifts the CO₂ weight by a precise amount, they can make superficial changes to hit a grade boundary without meaningful environmental improvement. Showing normalised subscores gives brands enough signal to make genuine decisions without exposing the exact optimisation surface. The raw blended product-level impacts (total CO₂/kg, water/kg, energy/kg) are shown as aggregate outputs — they can't be used to reconstruct per-material inputs.

---

## ADR-005 · EcoScore calculated client-side from material composition

**Date:** 2026-05 (initial build)

**Context:**  
Phase 1 has no real backend. The eco-score must be computable entirely from the product's composition and the material library's fixed LCA values. 

**Alternatives considered:**
- Server-side API call to calculate score
- Pre-computed score stored on the product record
- Client-side calculation from the composition draft

**Final choice:** Client-side calculation in `src/lib/eco-score.ts` using the composition draft and the static material library. Score is recalculated live as the user moves through the creation wizard.

**Reasoning:**  
All inputs are already on the client (composition from the draft, LCA values from the material library). A server round-trip adds latency with no benefit in Phase 1. Pre-computed scores would go stale if material LCA values are updated. The calculation engine is documented, deterministic, and independently testable. When a real backend is introduced, the same logic can be ported and the client can switch to validating against the server result.

---

## ADR-006 · Product creation as a 4-step wizard

**Date:** 2026-05 (initial build)

**Context:**  
Creating a product involves heterogeneous concerns: identity fields (name, SKU, category, country), material composition, eco-score review, and a final confirmation. All fields in a single long form would be cognitively overwhelming and would bury the composition step — which is the most complex and most important part.

**Alternatives considered:**
- Single long-form page with sections
- Accordion-style expandable sections
- Multi-step wizard with a persistent stepper

**Final choice:** Four discrete steps — Basic info → Materials → Eco-score → Review — with a linear stepper that allows backward navigation to any completed step.

**Reasoning:**  
The eco-score is a computed output that depends on the composition being complete and summing to 100%. It cannot be meaningfully shown until step 2 is done. A wizard enforces this dependency naturally and gives each concern enough space to breathe. The step indicator keeps the user oriented within the process. Completed steps are navigable backwards so users aren't penalised for needing to correct earlier inputs.

---

## ADR-007 · Composition must total exactly 100% to advance

**Date:** 2026-05 (initial build)

**Context:**  
A DPP composition declaration is a legal statement about what a product is made of. A composition that sums to 96% is an incomplete or inaccurate declaration — it implies 4% of unknown material. The eco-score calculation also requires a complete composition to be mathematically valid.

**Alternatives considered:**
- Warn on < 100% but allow progression
- Allow any total up to 100% (the remainder is implicitly "other")
- Require exactly 100%

**Final choice:** Exactly 100% is required before the user can advance from the Materials step. A live status indicator shows the running total and remaining percentage.

**Reasoning:**  
"Approximately 100%" is not a compliance position. Allowing progression on incomplete compositions would produce DPPs with inaccurate data. The live counter ("72% · 28% remaining") gives the user continuous feedback so the requirement doesn't feel like an arbitrary gate — it's a visible target throughout the editing process.

---

## ADR-008 · Material selection via searchable combobox, not native select

**Date:** 2026-05 (initial build)

**Context:**  
The material library has 15+ entries and will grow. Categories span natural fibers, synthetics, recycled materials, semi-synthetics, coatings, and trims. A brand user selecting materials for a complex garment needs to be able to search by name or category, not scroll through a flat list.

**Alternatives considered:**
- Native `<select>` element
- Grouped `<select>` by category
- Radix `Popover` + `Command` with search

**Final choice:** `Popover` + `Command` (ShadCN's combobox pattern) with inline search, category icons, and used-material exclusion. The selected item displays the category icon for quick visual confirmation.

**Reasoning:**  
Native selects can't be styled to show category icons, can't search by substring, and can't visually indicate which materials are already in use. The combobox pattern gives all of these. It's also consistent with ShadCN's existing component library, which means no new dependencies and consistent keyboard behaviour.

---

## ADR-009 · SKU input supports camera barcode scan and label photo OCR

**Date:** 2026-05 (initial build)

**Context:**  
Brand teams entering products during a production run often have the physical garment in hand. The SKU is already printed on a barcode label or hang tag. Typing a 15-character alphanumeric SKU is slower and more error-prone than scanning it.

**Alternatives considered:**
- Manual text entry only
- Barcode scan only (camera)
- Two-tab dialog: live camera scan + label photo upload

**Final choice:** A dialog with two tabs: "Scan barcode" uses `@zxing/browser` with a live camera feed and continuous decode loop; "Upload label photo" accepts an image file and simulates OCR. The barcode tab handles permission and device-not-found errors gracefully and falls back to a message directing the user to the upload tab.

**Reasoning:**  
Some devices don't support getUserMedia (older desktops, certain browsers) — the two-tab design gives a fallback path without blocking the flow. Live scanning is faster in a physical environment; photo upload supports the case where the barcode is on a printed spec sheet rather than a physical garment. OCR is simulated in Phase 1 and is straightforward to wire to a real service later.

---

## ADR-010 · Material request dialog for missing materials

**Date:** 2026-05 (initial build)

**Context:**  
The material library is controlled vocabulary, but it will never be exhaustive at launch. A brand doing a collection with bamboo viscose cannot use the product creation flow if that material isn't yet in the library. Blocking them entirely creates friction and support load.

**Alternatives considered:**
- Block the user with a support email link
- Allow free-text entry for unrecognised materials (overrides ADR-002)
- In-flow request dialog that submits to the admin team

**Final choice:** A dialog (accessible from the Materials step's "Not in the list?" link) where the brand submits the material name, category, and notes. The request surfaces in the Admin Portal for review. The brand cannot advance using the unverified material — they must wait for admin approval.

**Reasoning:**  
This keeps ADR-002 intact — no unverified material ever enters a composition — while giving brands a self-serve path that doesn't require a support ticket. The request creates an admin-visible queue, which over time surfaces the highest-demand materials for prioritised addition.

---

## ADR-011 · Gallery images stored as object URLs in client state

**Date:** 2026-05 (initial build)

**Context:**  
Phase 1 has no file storage backend. Product images uploaded during creation need to be previewed immediately and carried through the wizard steps.

**Alternatives considered:**
- Base64 encode files and store in draft state
- Upload to a mock endpoint and return a fake URL
- `URL.createObjectURL()` for immediate preview URLs

**Final choice:** `URL.createObjectURL(file)` creates a browser-local blob URL on file selection. These URLs are stored in the draft's `thumbnail` and `gallery` arrays and displayed using standard `<img>` tags throughout the wizard and on the product detail page.

**Reasoning:**  
Base64 encoding inflates the state object by ~33% per image and makes it slow to read. Fake upload endpoints add complexity with no benefit in Phase 1. Object URLs are synchronous, zero-copy references to the in-memory file object. They are revoked when the page unloads. This approach correctly represents the UX shape of real image uploads without requiring backend infrastructure.

---

## ADR-012 · Product detail page and Materials step share a split layout

**Date:** 2026-05 (initial build)

**Context:**  
Both the Materials creation step and the product detail view need to present the same type of content: composition data (the defining information about the product) alongside product images (supporting context). The visual language should be consistent between "creating" and "viewing" a product.

**Alternatives considered:**
- Tabbed layout (composition tab | images tab)
- Full-width composition with images below
- Split layout: composition left, images right

**Final choice:** `grid lg:grid-cols-[1fr_260px]` — composition gets the dominant left column, images occupy a fixed-width right panel. The image panel is supplementary; it does not compete with the content.

**Reasoning:**  
Tabs hide context — you can't see the composition and an image at the same time. Full-width composition with images below buries the images. The split layout keeps both visible simultaneously, with the proportions making the hierarchy explicit: this is a data product, not a product catalogue. The 260px right column is deliberately narrow — enough to show and identify the garment, not enough to make it the visual focus. A product's identity is its composition, not its photograph.

---

## ADR-013 · EcoScore is read-only in the creation wizard — brands cannot adjust it

**Date:** 2026-05 (initial build)

**Context:**  
The eco-score is a computed output of the material composition and K4RL's LCA methodology. It is not a field the brand sets.

**Alternatives considered:**
- Allow brands to manually override the score (with explanation)
- Show score and allow material substitution suggestions within step 3
- Read-only display with a breakdown of subscores

**Final choice:** Step 3 shows the calculated score, grade, five subscores, and three blended impact figures (CO₂/kg, water/kg, energy/kg). No inputs. The only action is to go back to the Materials step to change composition, or continue to Review.

**Reasoning:**  
An override capability would undermine the score's credibility with consumers and regulators. In-step substitution suggestions would add scope and complexity with no clear benefit — the brand already knows their materials. The breakdown gives enough signal for the brand to understand why they received a particular grade and what would improve it. Going back to step 2 to change composition is the correct mechanism for improving the score.

---

## ADR-014 · QR batch access from within a product or DPP — not a top-level nav item

**Date:** 2026-05 (navigation design)

**Context:**  
QR batches are directly associated with a specific product and DPP. A batch without its product context is not actionable. Top-level navigation implies a resource that is meaningful on its own.

**Alternatives considered:**
- Standalone "Batches" nav item in the sidebar
- Accessible from both product detail and DPP detail pages
- Only accessible from DPP detail

**Final choice:** QR batches are accessible from within the product detail page and the DPP detail page. There is no top-level "Batches" nav item.

**Reasoning:**  
A brand navigating to their batches needs to know which product they belong to. A standalone batches list without that context produces questions the user has to resolve themselves. Entry from the product or DPP page preserves context naturally. This also keeps the sidebar uncluttered — adding every sub-resource as a nav item scales poorly.

---

## ADR-015 · Team management lives inside Settings — not a standalone nav item

**Date:** 2026-05 (navigation design)

**Context:**  
Team management (inviting users, assigning roles) is a configuration concern. It is used infrequently and is not a day-to-day operational task.

**Alternatives considered:**
- Top-level "Team" nav item
- Inside a "People" section alongside resellers
- Inside Settings

**Final choice:** Team management is a section within Settings.

**Reasoning:**  
Teams are account configuration, not an operational resource a brand navigates to regularly. Surfacing it as a top-level nav item would give it equal weight to Products and DPPs, which are the daily-use surfaces. Keeping it inside Settings reduces sidebar clutter and groups it with other infrequent account-level concerns.

---

## ADR-016 · Status indicators always use dot + label — never color alone

**Date:** 2026-05 (design system)

**Context:**  
Status values (draft, generated, claimed, locked, transfer-requested, etc.) appear throughout the product — in tables, detail pages, and batch views. Color is the fastest way to communicate status at a glance, but it fails for users with color vision deficiencies.

**Alternatives considered:**
- Color-coded text only
- Badge with background color
- Colored dot + text label

**Final choice:** A small filled circle (the dot) + a text label, as a single `<StatusDot>` component. Color of the dot encodes the status category for sighted users. The label communicates status to everyone.

**Reasoning:**  
Color-only encoding is an accessibility failure. Badges with background color tend to become visually noisy in dense tables. The dot + label pattern is compact enough for table cells, legible at small sizes, and meets WCAG 1.4.1 (use of color). All 18 status values in the system are registered in a single config map in `status-dot.tsx`, which makes the full status vocabulary inspectable in one place.

---

## ADR-017 · Identifiers always render in monospace

**Date:** 2026-05 (design system)

**Context:**  
SKUs, QR codes, claim codes, batch IDs, and similar identifiers contain sequences of characters that are visually ambiguous in proportional fonts (0 vs O, 1 vs l vs I). Users frequently need to read these out loud, copy them, or compare them against physical labels.

**Alternatives considered:**
- Proportional font with slightly wider letter-spacing
- Uppercase only
- Monospace font

**Final choice:** All identifiers render in monospace using `<MonoId>` from `src/components/shared/mono-id.tsx`.

**Reasoning:**  
Monospace eliminates character ambiguity, makes character counting natural, and visually distinguishes identifiers from surrounding prose. This signals to the user "this is a machine-readable string, not a label" — which is accurate and reduces transcription errors. Using a single shared component means the treatment is consistent and can be changed globally in one place.

---

## ADR-018 · Mock auth with role switcher — no real auth in Phase 1

**Date:** 2026-05 (initial build)

**Context:**  
Phase 1 is a UI build. There is no backend, no database, and no real user management. Designing around real auth would add scope and block UI work on permissions-sensitive surfaces.

**Alternatives considered:**
- Stub a simple JWT or cookie-based auth layer
- Hardcode a single role throughout
- Context-based mock with a role switcher

**Final choice:** `AuthContext` in `src/context/auth.tsx` provides a `useAuth()` hook with the current user, a `setRole()` function, and a `can(permission)` checker. A `RoleSwitcher` component in the layout allows switching between `k4rl-admin`, `brand-admin`, and `brand-editor` without reloading.

**Reasoning:**  
The three-role model is architecturally real — it reflects how the permissions system will work when a real backend is added. Building against the `can()` API means permission-gated UI is already wired correctly, and the only change needed when real auth is introduced is replacing the mock user source. Switching roles via a UI control is faster for development and review than modifying code or clearing cookies.

---

## ADR-019 · Factory flow is link-only with no account — not a factory portal

**Date:** 2026-05 (initial architecture)

**Context:**  
Factories need to upload compliance certificates and download cut-and-sew labels. They may work with dozens of brands and are not K4RL users — they are external service providers performing a specific, bounded task.

**Alternatives considered:**
- Full factory portal with login, dashboard, and history
- Link-only single-action pages (no account)

**Final choice:** Factories receive a time-limited link. The link leads to a page that does exactly one thing — either certificate upload or label download. No account creation, no login, no dashboard.

**Reasoning:**  
A factory portal with login creates an account management burden (onboarding, password reset, access revocation) for a class of users who have no ongoing relationship with the K4RL platform. A unique link is lower friction, easier to revoke, and scoped to exactly what the factory needs to do. The limitation is that factories cannot self-serve historical records — but that is a brand's responsibility, not a factory's.

---

## ADR-020 · ShadCN/UI as the component base — extend, never rebuild

**Date:** 2026-05 (initial build)

**Context:**  
The project needs a consistent, accessible component library that supports Tailwind CSS, dark mode, and Radix-based primitives.

**Alternatives considered:**
- Build a bespoke component library from scratch
- Use a fully managed library (MUI, Chakra)
- Use ShadCN/UI (copy-on-install Radix-based components)

**Final choice:** ShadCN/UI. Components live in `src/components/ui/` and are not modified directly — custom components extend or compose them.

**Reasoning:**  
Fully managed libraries dictate their styling model, which conflicts with Tailwind as the primary styling layer. A bespoke library requires building and maintaining accessible primitives (menus, dialogs, comboboxes, focus management) — work that is already done and well-tested in Radix. ShadCN's copy-on-install model gives full control over the installed code without an external dependency at runtime. The rule to not modify `ui/` components directly means upgrades are possible without merge conflicts in customised source.
