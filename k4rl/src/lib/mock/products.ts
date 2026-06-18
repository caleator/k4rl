export type DppStatus = "draft" | "generated";
export type ItemState = "locked" | "unlocked" | "claimed" | "transfer-requested" | "re-locked";

export interface MaterialComponent {
  materialId: string;
  materialName: string;
  percentage: number; // must sum to 100 across all components
  pendingRequestId?: string; // set when material is pending admin approval
}

export interface Product {
  id: string;
  brandId: string;
  name: string;
  sku: string;
  category: string;
  weightGrams: number;
  countryOfManufacture: string;
  thumbnail?: string;
  gallery?: string[];
  composition: MaterialComponent[];
  ecoScore?: number;       // 0–100, undefined until calculated
  ecoGrade?: "A" | "B" | "C" | "D" | "E";
  ecoScorePublic: boolean;
  dppStatus: DppStatus;
  dppGeneratedAt?: string;
  dppUrl?: string;
  createdAt: string;
}

export interface QrItem {
  id: string;
  productId: string;
  batchId: string;
  qrCode: string;    // unique identifier rendered as QR
  claimCode: string; // single-use, printed inside fold
  state: ItemState;
  ownerId?: string;
  ownerEmail?: string;
  unlockedAt?: string;
  claimedAt?: string;
  transferRequestedAt?: string;
  transferRequesterEmail?: string;
}

export interface Batch {
  id: string;
  productId: string;
  brandId: string;
  quantity: number;
  status: "generating" | "ready" | "dispatched" | "cancelled";
  createdAt: string;
  factoryLinkSentAt?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "prod-001",
    brandId: "brand-001",
    name: "Noir Oversized Tee",
    sku: "AN-SS26-TEE-001",
    category: "T-shirt",
    weightGrams: 200,
    countryOfManufacture: "Portugal",
    thumbnail: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&auto=format",
    gallery: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=800&h=600&fit=crop&auto=format",
    ],
    composition: [
      { materialId: "mat-002", materialName: "Organic cotton", percentage: 80 },
      { materialId: "mat-004", materialName: "rPET", percentage: 20 },
    ],
    ecoScore: 81,
    ecoGrade: "B",
    ecoScorePublic: true,
    dppStatus: "generated",
    dppGeneratedAt: "2026-05-10T14:32:00Z",
    dppUrl: "/public/dpp-an-ss26-tee-001",
    createdAt: "2026-05-08T09:00:00Z",
  },
  {
    id: "prod-002",
    brandId: "brand-001",
    name: "Structured Blazer",
    sku: "AN-SS26-BLZ-002",
    category: "Blazer",
    weightGrams: 650,
    countryOfManufacture: "Italy",
    thumbnail: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=400&h=400&fit=crop&auto=format",
    gallery: [
      "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=600&fit=crop&auto=format",
    ],
    composition: [
      { materialId: "mat-008", materialName: "Merino wool", percentage: 70 },
      { materialId: "mat-009", materialName: "Linen", percentage: 30 },
    ],
    ecoScore: 74,
    ecoGrade: "B",
    ecoScorePublic: false,
    dppStatus: "generated",
    dppGeneratedAt: "2026-05-15T10:00:00Z",
    dppUrl: "/public/dpp-an-ss26-blz-002",
    createdAt: "2026-05-12T10:00:00Z",
  },
  {
    id: "prod-003",
    brandId: "brand-001",
    name: "Fluid Midi Skirt",
    sku: "AN-SS26-SKT-003",
    category: "Skirt",
    weightGrams: 280,
    countryOfManufacture: "Greece",
    composition: [
      { materialId: "mat-011", materialName: "Lyocell / TENCEL™", percentage: 100 },
    ],
    ecoScore: undefined,
    ecoScorePublic: false,
    dppStatus: "draft",
    createdAt: "2026-06-05T11:00:00Z",
  },
  {
    id: "prod-004",
    brandId: "brand-002",
    name: "Marble Linen Shirt",
    sku: "MS-SS26-SHT-001",
    category: "Shirt",
    weightGrams: 180,
    countryOfManufacture: "Cyprus",
    thumbnail: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop&auto=format",
    gallery: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&h=600&fit=crop&auto=format",
    ],
    composition: [
      { materialId: "mat-009", materialName: "Linen", percentage: 100 },
    ],
    ecoScore: 91,
    ecoGrade: "A",
    ecoScorePublic: true,
    dppStatus: "generated",
    dppGeneratedAt: "2026-06-12T09:00:00Z",
    dppUrl: "/public/dpp-ms-ss26-sht-001",
    createdAt: "2026-06-11T14:00:00Z",
  },
  {
    id: "prod-draft-001",
    brandId: "brand-001",
    name: "Bamboo Layer Crewneck",
    sku: "AN-SS26-KNT-002",
    category: "Knitwear",
    weightGrams: 280,
    countryOfManufacture: "Portugal",
    composition: [
      { materialId: "mat-009", materialName: "Linen", percentage: 40 },
      { materialId: "", materialName: "Bamboo viscose", percentage: 60, pendingRequestId: "req-001" },
    ],
    ecoScorePublic: false,
    dppStatus: "draft",
    createdAt: "2026-05-28T10:30:00Z",
  },
  {
    id: "prod-005",
    brandId: "brand-001",
    name: "Relaxed Wide-Leg Trouser",
    sku: "AN-SS26-TRS-005",
    category: "Trousers",
    weightGrams: 340,
    countryOfManufacture: "Portugal",
    thumbnail: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=400&fit=crop&auto=format",
    gallery: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&h=600&fit=crop&auto=format",
    ],
    composition: [
      { materialId: "mat-009", materialName: "Linen", percentage: 55 },
      { materialId: "mat-002", materialName: "Organic cotton", percentage: 45 },
    ],
    ecoScore: 88,
    ecoGrade: "A",
    ecoScorePublic: true,
    dppStatus: "generated",
    dppGeneratedAt: "2026-06-02T11:00:00Z",
    dppUrl: "/public/dpp-an-ss26-trs-005",
    createdAt: "2026-05-30T09:00:00Z",
  },
  {
    id: "prod-006",
    brandId: "brand-001",
    name: "Wrap Dress in Deadstock Silk",
    sku: "AN-SS26-DRS-006",
    category: "Dress",
    weightGrams: 220,
    countryOfManufacture: "Italy",
    thumbnail: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop&auto=format",
    gallery: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&h=600&fit=crop&auto=format",
    ],
    composition: [
      { materialId: "mat-005", materialName: "Silk", percentage: 100 },
    ],
    ecoScore: 69,
    ecoGrade: "C",
    ecoScorePublic: false,
    dppStatus: "generated",
    dppGeneratedAt: "2026-06-08T14:00:00Z",
    dppUrl: "/public/dpp-an-ss26-drs-006",
    createdAt: "2026-06-07T10:00:00Z",
  },
];

export const BATCHES: Batch[] = [
  {
    id: "batch-001",
    productId: "prod-001",
    brandId: "brand-001",
    quantity: 500,
    status: "dispatched",
    createdAt: "2026-05-11T08:00:00Z",
    factoryLinkSentAt: "2026-05-11T08:30:00Z",
  },
  {
    id: "batch-002",
    productId: "prod-002",
    brandId: "brand-001",
    quantity: 200,
    status: "ready",
    createdAt: "2026-05-16T09:00:00Z",
  },
  {
    id: "batch-003",
    productId: "prod-004",
    brandId: "brand-002",
    quantity: 150,
    status: "generating",
    createdAt: "2026-06-12T10:00:00Z",
  },
];

// A small sample of QR items for prod-001
export const QR_ITEMS: QrItem[] = [
  {
    id: "item-001",
    productId: "prod-001",
    batchId: "batch-001",
    qrCode: "K4RL-AN-001-000001",
    claimCode: "XK9-4TM",
    state: "claimed",
    ownerEmail: "alex.petrou@gmail.com",
    unlockedAt: "2026-05-20T11:00:00Z",
    claimedAt: "2026-05-20T11:08:00Z",
  },
  {
    id: "item-002",
    productId: "prod-001",
    batchId: "batch-001",
    qrCode: "K4RL-AN-001-000002",
    claimCode: "PL2-7QN",
    state: "unlocked",
    unlockedAt: "2026-06-16T15:00:00Z",
  },
  {
    id: "item-003",
    productId: "prod-001",
    batchId: "batch-001",
    qrCode: "K4RL-AN-001-000003",
    claimCode: "RW5-8DZ",
    state: "locked",
  },
  {
    id: "item-005",
    productId: "prod-002",
    batchId: "batch-002",
    qrCode: "K4RL-AN-002-000001",
    claimCode: "GT6-2HN",
    state: "claimed",
    ownerEmail: "alex.petrou@gmail.com",
    unlockedAt: "2026-05-28T14:00:00Z",
    claimedAt: "2026-05-28T14:22:00Z",
  },
  {
    id: "item-006",
    productId: "prod-002",
    batchId: "batch-002",
    qrCode: "K4RL-AN-002-000002",
    claimCode: "MX9-5WR",
    state: "claimed",
    ownerEmail: "alex.petrou@gmail.com",
    unlockedAt: "2026-06-03T09:10:00Z",
    claimedAt: "2026-06-03T09:31:00Z",
  },
  {
    id: "item-004",
    productId: "prod-001",
    batchId: "batch-001",
    qrCode: "K4RL-AN-001-000004",
    claimCode: "VB3-1KF",
    state: "transfer-requested",
    ownerEmail: "maria.k@hotmail.com",
    unlockedAt: "2026-05-25T09:00:00Z",
    claimedAt: "2026-05-25T09:15:00Z",
    transferRequestedAt: "2026-06-16T10:00:00Z",
    transferRequesterEmail: "new.owner@gmail.com",
  },
  {
    // Previously owned by alex — transferred away without his knowledge (fraud demo scenario)
    id: "item-007",
    productId: "prod-001",
    batchId: "batch-001",
    qrCode: "K4RL-AN-001-000005",
    claimCode: "ZD4-9VP",
    state: "claimed",
    ownerEmail: "new.owner@gmail.com",
    unlockedAt: "2026-04-15T09:00:00Z",
    claimedAt: "2026-04-15T10:00:00Z",
  },
];
