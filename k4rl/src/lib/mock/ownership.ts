export type OwnershipEventType =
  | "manufactured"
  | "unlocked"
  | "claimed"
  | "transfer-requested"
  | "transfer-approved"
  | "transfer-rejected"
  | "released"
  | "fraud-flagged";

export interface OwnershipEvent {
  id: string;
  itemId: string;
  type: OwnershipEventType;
  actorEmail?: string;
  timestamp: string;
  note?: string;
}

// Append-only ownership timeline — never deleted
export const OWNERSHIP_EVENTS: OwnershipEvent[] = [
  {
    id: "evt-001",
    itemId: "item-001",
    type: "manufactured",
    timestamp: "2026-05-10T00:00:00Z",
    note: "Item produced. Factory: Texteis Lena, Portugal.",
  },
  {
    id: "evt-002",
    itemId: "item-001",
    type: "unlocked",
    timestamp: "2026-05-20T11:00:00Z",
    note: "First QR scan — claim window opened.",
  },
  {
    id: "evt-003",
    itemId: "item-001",
    type: "claimed",
    actorEmail: "alex.petrou@gmail.com",
    timestamp: "2026-05-20T11:08:00Z",
  },
  {
    id: "evt-004",
    itemId: "item-004",
    type: "manufactured",
    timestamp: "2026-05-10T00:00:00Z",
  },
  {
    id: "evt-005",
    itemId: "item-004",
    type: "unlocked",
    timestamp: "2026-05-25T09:00:00Z",
  },
  {
    id: "evt-006",
    itemId: "item-004",
    type: "claimed",
    actorEmail: "maria.k@hotmail.com",
    timestamp: "2026-05-25T09:15:00Z",
  },
  {
    id: "evt-007",
    itemId: "item-004",
    type: "transfer-requested",
    actorEmail: "new.owner@gmail.com",
    timestamp: "2026-06-16T10:00:00Z",
    note: "New owner submitted claim request.",
  },
  {
    id: "evt-008",
    itemId: "item-002",
    type: "manufactured",
    timestamp: "2026-05-10T00:00:00Z",
  },
  {
    id: "evt-009",
    itemId: "item-002",
    type: "unlocked",
    timestamp: "2026-06-16T15:00:00Z",
    note: "Claim window open. Expires 72h from first scan.",
  },
  {
    id: "evt-010",
    itemId: "item-003",
    type: "manufactured",
    timestamp: "2026-05-10T00:00:00Z",
  },
  {
    id: "evt-011",
    itemId: "item-005",
    type: "manufactured",
    timestamp: "2026-05-14T00:00:00Z",
  },
  {
    id: "evt-012",
    itemId: "item-005",
    type: "unlocked",
    timestamp: "2026-05-28T14:00:00Z",
    note: "First QR scan — claim window opened.",
  },
  {
    id: "evt-013",
    itemId: "item-005",
    type: "claimed",
    actorEmail: "alex.petrou@gmail.com",
    timestamp: "2026-05-28T14:22:00Z",
  },
  {
    id: "evt-014",
    itemId: "item-006",
    type: "manufactured",
    timestamp: "2026-05-14T00:00:00Z",
  },
  {
    id: "evt-015",
    itemId: "item-006",
    type: "unlocked",
    timestamp: "2026-06-03T09:10:00Z",
    note: "First QR scan — claim window opened.",
  },
  {
    id: "evt-016",
    itemId: "item-006",
    type: "claimed",
    actorEmail: "alex.petrou@gmail.com",
    timestamp: "2026-06-03T09:31:00Z",
  },
  // item-007: Alex's item that was fraudulently transferred (demo scenario)
  {
    id: "evt-017",
    itemId: "item-007",
    type: "manufactured",
    timestamp: "2026-04-10T00:00:00Z",
  },
  {
    id: "evt-018",
    itemId: "item-007",
    type: "unlocked",
    timestamp: "2026-04-15T09:00:00Z",
    note: "First QR scan — claim window opened.",
  },
  {
    id: "evt-019",
    itemId: "item-007",
    type: "claimed",
    actorEmail: "alex.petrou@gmail.com",
    timestamp: "2026-04-15T10:00:00Z",
  },
  {
    id: "evt-020",
    itemId: "item-007",
    type: "transfer-approved",
    actorEmail: "alex.petrou@gmail.com",
    timestamp: "2026-06-08T11:42:00Z",
    note: "Ownership transferred to new.owner@gmail.com.",
  },
];
