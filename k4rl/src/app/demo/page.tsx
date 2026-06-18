import Link from "next/link";
import { ArrowUpRight, Building2, Factory, Mail, Smartphone, ShieldCheck } from "lucide-react";

const ADMIN_LINKS = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    description: "Platform-level metrics — total brands, DPPs, QR codes issued, and a live ownership activity feed.",
  },
  {
    href: "/admin/materials",
    label: "Material library",
    description: "Admin-curated library of materials with full LCA data. Materials have no approval status — every entry in the library is ready for use. Brand-requested materials appear here after the admin enriches them with LCA values, carrying the originating brand and request date in the expanded row detail.",
  },
  {
    href: "/admin/materials/requests",
    label: "Material requests",
    description: "Review brand-submitted material requests. Approve (providing LCA values) or reject with a reason.",
    meta: "2 pending requests",
  },
  {
    href: "/admin/brands",
    label: "Brands",
    description: "All registered brands with tier, status, team members, and per-brand DPP + QR usage.",
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    description: "Per-brand claim rates, DPP counts, subscription mix, and platform-wide fraud report summary.",
  },
];

const BRAND_LINKS = [
  {
    href: "/brand/products",
    label: "Products list",
    description: "Browse and filter all products for the brand.",
  },
  {
    href: "/brand/products/new",
    label: "Create new product",
    description: "Step-by-step product creation flow with material composition.",
  },
  {
    href: "/brand/products/prod-001",
    label: "Product detail",
    meta: "prod-001 · Noir Oversized Tee",
    description: "Full product view — composition, eco-score, DPP status, and QR batch management. Generate a DPP or dispatch a batch from here.",
  },
  {
    href: "/brand/materials",
    label: "Material requests",
    description: "View status of all material requests — pending, approved, or rejected with reason. Switch role to brand-admin or brand-editor.",
  },
  {
    href: "/brand/disputes",
    label: "Disputes",
    description: "Fraud reports submitted by consumers who believe an item was transferred without their authorisation.",
  },
];

const FACTORY_LINKS = [
  {
    href: "/factory/tok-cert-ghi789",
    label: "Certificate upload",
    meta: "Marble Studio · Cyprus Textile Co.",
    description: "Upload OEKO-TEX or GOTS certificates for a specific product run.",
  },
  {
    href: "/factory/tok-lbl-def456",
    label: "Label download",
    meta: "Atelier Noir · Texteis Lena",
    description: "Print-ready QR and claim code labels for a dispatched batch.",
  },
  {
    href: "/factory/tok-cert-abc123",
    label: "Certificate upload",
    meta: "Atelier Noir · Texteis Lena",
    description: "Upload OEKO-TEX or GOTS certificates for a specific product run.",
  },
];

const CONSUMER_LINKS = [
  {
    href: "/scan",
    label: "QR scan simulator",
    description: "Mock camera viewfinder with a real-looking QR code. Tap 'Simulate scan' to enter the consumer product flow.",
  },
  {
    href: "/product/K4RL-AN-001-000002",
    label: "Public DPP — unlocked item",
    meta: "K4RL-AN-001-000002",
    description: "What a consumer sees after scanning a QR code. Shows composition, eco-score, factory, and the activation CTA.",
  },
  {
    href: "/product/K4RL-AN-001-000001",
    label: "Public DPP — claimed item",
    meta: "K4RL-AN-001-000001",
    description: "Item already owned. Shows 'Request ownership transfer' form and 'Report an issue' fraud flag — no account required.",
  },
  {
    href: "/consumer/claim/K4RL-AN-001-000002",
    label: "Claim flow",
    meta: "Claim code: PL2-7QN",
    description: "3-step ownership registration: email → claim code → confirmation. Use claim code PL2-7QN.",
  },
  {
    href: "/consumer/auth/login",
    label: "Consumer login",
    meta: "demo1234 for all accounts",
    description: "Sign in as alex.petrou@gmail.com (owns item-001) or maria.k@hotmail.com (has a pending transfer).",
  },
  {
    href: "/consumer/item/item-001",
    label: "Item detail + timeline",
    meta: "Sign in as alex.petrou@gmail.com",
    description: "Ownership history timeline for a claimed item. Log in first to view.",
  },
  {
    href: "/consumer/transfer/item-004",
    label: "Transfer approval",
    meta: "Sign in as maria.k@hotmail.com",
    description: "Owner reviews a pending transfer request — approve or reject. Log in as maria.k@hotmail.com first.",
  },
  {
    href: "/consumer/item/item-007",
    label: "Fraud report",
    meta: "Sign in as alex.petrou@gmail.com",
    description: "Item previously owned by Alex, now transferred away. Shows the 'Report an issue' form available to previous owners.",
  },
];

const EMAIL_LINKS = [
  {
    href: "/email-preview/certificate-upload",
    label: "Certificate upload email",
    description: "Transactional email sent to a factory requesting compliance documents.",
  },
];

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b bg-card">
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs tracking-tight">K4</span>
            </div>
            <span className="font-semibold text-sm text-foreground">K4RL</span>
          </div>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Client preview</span>
        </div>
      </header>

      {/* Hero */}
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <p className="text-xs font-medium text-primary uppercase tracking-wider mb-3">Phase 1 UI · Work in progress</p>
          <h1 className="text-2xl font-semibold text-foreground mb-2">K4RL platform demo</h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            A curated walkthrough of the four user journeys built to date — brand portal, factory link flow, consumer ownership flow, and transactional email notifications. No login required. All data is illustrative.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="mx-auto max-w-4xl px-6 py-10 space-y-10">

        {/* Admin portal */}
        <Section
          icon={ShieldCheck}
          label="Admin portal"
          headline="Platform governance and oversight"
          description="The K4RL internal team uses this portal to manage the material library, oversee brand accounts, and monitor platform-wide activity."
          links={ADMIN_LINKS}
        />

        {/* Brand portal */}
        <Section
          icon={Building2}
          label="Brand portal"
          headline="Manage products & DPP compliance"
          description="Fashion brands use this portal to build products, define material composition, and generate EU Digital Product Passports."
          links={BRAND_LINKS}
        />

        {/* Factory portal */}
        <Section
          icon={Factory}
          label="Factory portal"
          headline="Token-based access for manufacturing partners"
          description="Factories receive a one-time link — no account required. Each link unlocks a single action: upload a certificate or download print-ready labels."
          links={FACTORY_LINKS}
        />

        {/* Consumer web app */}
        <Section
          icon={Smartphone}
          label="Consumer web app"
          headline="Scan, claim, and transfer ownership"
          description="The end-consumer journey — from scanning a QR code to registering ownership and managing transfers. Mobile-first, no account required to claim."
          links={CONSUMER_LINKS}
        />

        {/* Email notifications */}
        <Section
          icon={Mail}
          label="Email notifications"
          headline="Transactional emails sent to factories"
          description="Rendered previews of the emails K4RL sends on behalf of brands when they trigger a certificate request or label dispatch."
          links={EMAIL_LINKS}
        />

      </div>

      {/* Footer */}
      <footer className="border-t mt-10">
        <div className="mx-auto max-w-4xl px-6 py-5 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">K4RL · Quintessential</span>
          <span className="text-xs text-muted-foreground">Confidential · Not for distribution</span>
        </div>
      </footer>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

interface LinkDef {
  href: string;
  label: string;
  meta?: string;
  description: string;
}

function Section({
  icon: Icon,
  label,
  headline,
  description,
  links,
}: {
  icon: React.ElementType;
  label: string;
  headline: string;
  description: string;
  links: LinkDef[];
}) {
  return (
    <div>
      {/* Section header */}
      <div className="flex items-start gap-3 mb-5">
        <div className="mt-0.5 h-8 w-8 shrink-0 rounded-md border bg-card flex items-center justify-center">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
          <h2 className="text-base font-semibold text-foreground leading-snug">{headline}</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">{description}</p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-sm font-medium text-foreground leading-snug">{link.label}</span>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground mt-0.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
            {link.meta && (
              <p className="text-[11px] font-mono text-muted-foreground mb-1.5">{link.meta}</p>
            )}
            <p className="text-xs text-muted-foreground leading-relaxed">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
