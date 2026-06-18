export interface FraudReport {
  id: string;
  itemId: string;
  reporterEmail: string;
  description: string;
  submittedAt: string;
  status: "open" | "under-review" | "resolved";
}

export const FRAUD_REPORTS: FraudReport[] = [
  {
    id: "dispute-001",
    itemId: "item-007",
    reporterEmail: "alex.petrou@gmail.com",
    description: "I did not authorise a transfer of this item. I never received a transfer request and it now appears to be owned by someone else.",
    submittedAt: "2026-06-10T08:14:00Z",
    status: "open",
  },
];
