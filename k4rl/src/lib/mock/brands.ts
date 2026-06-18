export type SubscriptionTier = "Starter" | "Growth" | "Enterprise";
export type SubscriptionStatus = "trialling" | "active" | "past-due" | "cancelled";

export interface BrandMember {
  id: string;
  name: string;
  email: string;
  role: "brand-admin" | "brand-editor";
  joinedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  country: string;
  email: string;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  dppUsedThisMonth: number;
  dppLimitThisMonth: number;
  trialEndsAt?: string;
  createdAt: string;
  members: BrandMember[];
}

export const BRANDS: Brand[] = [
  {
    id: "brand-001",
    name: "Atelier Noir",
    country: "Greece",
    email: "ops@ateliernoir.com",
    subscriptionTier: "Growth",
    subscriptionStatus: "active",
    dppUsedThisMonth: 312,
    dppLimitThisMonth: 1000,
    createdAt: "2026-04-20T09:00:00Z",
    members: [
      { id: "mem-001", name: "Sofia Papadaki", email: "sofia@ateliernoir.com", role: "brand-admin", joinedAt: "2026-04-20T09:00:00Z" },
      { id: "mem-002", name: "Nikos Andreou", email: "nikos@ateliernoir.com", role: "brand-editor", joinedAt: "2026-04-22T11:00:00Z" },
    ],
  },
  {
    id: "brand-002",
    name: "Marble Studio",
    country: "Cyprus",
    email: "hello@marblestudio.cy",
    subscriptionTier: "Starter",
    subscriptionStatus: "trialling",
    dppUsedThisMonth: 18,
    dppLimitThisMonth: 500,
    trialEndsAt: "2026-06-25T00:00:00Z",
    createdAt: "2026-06-11T08:00:00Z",
    members: [
      { id: "mem-003", name: "Lena Christodoulou", email: "lena@marblestudio.cy", role: "brand-admin", joinedAt: "2026-06-11T08:00:00Z" },
    ],
  },
  {
    id: "brand-003",
    name: "Volos Knitwear",
    country: "Greece",
    email: "info@volosknitwear.gr",
    subscriptionTier: "Starter",
    subscriptionStatus: "past-due",
    dppUsedThisMonth: 44,
    dppLimitThisMonth: 500,
    createdAt: "2026-05-01T10:00:00Z",
    members: [
      { id: "mem-004", name: "Dimitris Voulgaris", email: "d.voulgaris@volosknitwear.gr", role: "brand-admin", joinedAt: "2026-05-01T10:00:00Z" },
    ],
  },
  {
    id: "brand-004",
    name: "Hatalin Properties Ltd",
    country: "Cyprus",
    email: "lyne@hatalin.com",
    subscriptionTier: "Enterprise",
    subscriptionStatus: "active",
    dppUsedThisMonth: 1840,
    dppLimitThisMonth: 99999,
    createdAt: "2026-04-14T00:00:00Z",
    members: [
      { id: "mem-005", name: "Lyne Zein", email: "lyne@hatalin.com", role: "brand-admin", joinedAt: "2026-04-14T00:00:00Z" },
    ],
  },
];
