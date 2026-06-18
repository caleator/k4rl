export type MaterialCategory =
  | "Natural fiber"
  | "Recycled synthetic"
  | "Synthetic"
  | "Semi-synthetic"
  | "Vegan leather"
  | "Trim"
  | "Coating";

export type ToxicityLevel = "Low" | "Medium" | "High";
export type CircularityLevel = "Low" | "Medium" | "High";

export interface MaterialProvenance {
  brandId: string;
  brandName: string;
  requestDate: string; // ISO date string
  requestId: string;
}

export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  co2PerKg: number;       // kg CO₂e/kg
  waterPerKg: number;     // L/kg
  energyPerKg: number;    // MJ/kg
  chemistryScore: number; // 0–10 (lower = worse)
  circularityScore: number; // 0–100
  toxicity: ToxicityLevel;
  circularity: CircularityLevel;
  notes: string;
  approved: boolean;
  provenance?: MaterialProvenance;
}

export const MATERIALS: Material[] = [
  {
    id: "mat-001",
    name: "Cotton (conventional)",
    category: "Natural fiber",
    co2PerKg: 2.2,
    waterPerKg: 12500,
    energyPerKg: 50,
    chemistryScore: 6,
    circularityScore: 60,
    toxicity: "Medium",
    circularity: "Medium",
    notes: "High water use; medium chemistry risk",
    approved: true,
  },
  {
    id: "mat-002",
    name: "Organic cotton",
    category: "Natural fiber",
    co2PerKg: 1.5,
    waterPerKg: 9000,
    energyPerKg: 50,
    chemistryScore: 3,
    circularityScore: 60,
    toxicity: "Low",
    circularity: "Medium",
    notes: "Lower pesticide use; reduced water impact",
    approved: true,
  },
  {
    id: "mat-003",
    name: "Polyester (virgin)",
    category: "Synthetic",
    co2PerKg: 5.2,
    waterPerKg: 95,
    energyPerKg: 60,
    chemistryScore: 5,
    circularityScore: 50,
    toxicity: "Medium",
    circularity: "Medium",
    notes: "Fossil feedstock; microplastics risk",
    approved: true,
  },
  {
    id: "mat-004",
    name: "rPET",
    category: "Recycled synthetic",
    co2PerKg: 1.5,
    waterPerKg: 20,
    energyPerKg: 30,
    chemistryScore: 3,
    circularityScore: 70,
    toxicity: "Low",
    circularity: "High",
    notes: "Recycled polyester (mechanical)",
    approved: true,
  },
  {
    id: "mat-005",
    name: "Nylon (virgin)",
    category: "Synthetic",
    co2PerKg: 7.5,
    waterPerKg: 140,
    energyPerKg: 120,
    chemistryScore: 5,
    circularityScore: 40,
    toxicity: "Medium",
    circularity: "Low",
    notes: "High energy footprint; limited recycling infrastructure",
    approved: true,
  },
  {
    id: "mat-006",
    name: "Recycled nylon",
    category: "Recycled synthetic",
    co2PerKg: 3.0,
    waterPerKg: 50,
    energyPerKg: 50,
    chemistryScore: 3,
    circularityScore: 65,
    toxicity: "Low",
    circularity: "High",
    notes: "Significantly lower footprint vs virgin",
    approved: true,
  },
  {
    id: "mat-007",
    name: "Wool",
    category: "Natural fiber",
    co2PerKg: 15.0,
    waterPerKg: 170,
    energyPerKg: 63,
    chemistryScore: 5,
    circularityScore: 55,
    toxicity: "Low",
    circularity: "Medium",
    notes: "High GHG due to methane; wool scouring water use",
    approved: true,
  },
  {
    id: "mat-008",
    name: "Merino wool",
    category: "Natural fiber",
    co2PerKg: 13.0,
    waterPerKg: 150,
    energyPerKg: 60,
    chemistryScore: 4,
    circularityScore: 60,
    toxicity: "Low",
    circularity: "Medium",
    notes: "Fine wool; slightly better chemistry profile",
    approved: true,
  },
  {
    id: "mat-009",
    name: "Linen",
    category: "Natural fiber",
    co2PerKg: 0.65,
    waterPerKg: 1650,
    energyPerKg: 25,
    chemistryScore: 2,
    circularityScore: 75,
    toxicity: "Low",
    circularity: "High",
    notes: "Low agrochemical input; biodegradable",
    approved: true,
  },
  {
    id: "mat-010",
    name: "Viscose (conventional)",
    category: "Semi-synthetic",
    co2PerKg: 4.0,
    waterPerKg: 3000,
    energyPerKg: 65,
    chemistryScore: 7,
    circularityScore: 40,
    toxicity: "High",
    circularity: "Low",
    notes: "Chemical-intensive wet processing; deforestation risk",
    approved: true,
  },
  {
    id: "mat-011",
    name: "Lyocell / TENCEL™",
    category: "Semi-synthetic",
    co2PerKg: 2.5,
    waterPerKg: 700,
    energyPerKg: 40,
    chemistryScore: 2,
    circularityScore: 70,
    toxicity: "Low",
    circularity: "High",
    notes: "Closed-loop solvent process; FSC-certified wood sources",
    approved: true,
  },
  {
    id: "mat-012",
    name: "Elastane / Spandex",
    category: "Synthetic",
    co2PerKg: 6.0,
    waterPerKg: 110,
    energyPerKg: 125,
    chemistryScore: 8,
    circularityScore: 15,
    toxicity: "High",
    circularity: "Low",
    notes: "Severe recyclability constraint; chemistry penalty applies",
    approved: true,
  },
  {
    id: "mat-013",
    name: "PU coating",
    category: "Coating",
    co2PerKg: 7.5,
    waterPerKg: 225,
    energyPerKg: 90,
    chemistryScore: 7,
    circularityScore: 30,
    toxicity: "High",
    circularity: "Low",
    notes: "Negative modifier: +40% CO₂, −20 chemistry points",
    approved: true,
  },
  {
    id: "mat-014",
    name: "Cashmere",
    category: "Natural fiber",
    co2PerKg: 25.0,
    waterPerKg: 200,
    energyPerKg: 80,
    chemistryScore: 5,
    circularityScore: 55,
    toxicity: "Low",
    circularity: "Medium",
    notes: "Very high GHG; land degradation concerns",
    approved: true,
  },
  {
    id: "mat-015",
    name: "Hemp",
    category: "Natural fiber",
    co2PerKg: 0.95,
    waterPerKg: 1050,
    energyPerKg: 25,
    chemistryScore: 2,
    circularityScore: 80,
    toxicity: "Low",
    circularity: "High",
    notes: "Low agrochemical needs; soil carbon sequestration",
    approved: true,
  },
  {
    id: "mat-016",
    name: "Econyl (recycled nylon yarn)",
    category: "Recycled synthetic",
    co2PerKg: 2.1,
    waterPerKg: 55,
    energyPerKg: 45,
    chemistryScore: 4,
    circularityScore: 72,
    toxicity: "Low",
    circularity: "High",
    notes: "ECONYL® regenerated nylon from ghost nets and industrial plastic waste",
    approved: true,
    provenance: {
      brandId: "brand-001",
      brandName: "Atelier Noir",
      requestDate: "2026-04-20T09:10:00Z",
      requestId: "req-003",
    },
  },
];

export interface MaterialRequest {
  id: string;
  brandId: string;
  brandName: string;
  materialName: string;
  category: MaterialCategory;
  notes?: string;
  // Optional LCA values submitted by brand
  co2PerKg?: number;
  waterPerKg?: number;
  energyPerKg?: number;
  chemistryScore?: number;
  circularityScore?: number;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  approvedAt?: string;
  rejectedAt?: string;
  approvedMaterialId?: string; // set when approved — references the new MATERIALS entry
}

export const MATERIAL_REQUESTS: MaterialRequest[] = [
  {
    id: "req-001",
    brandId: "brand-001",
    brandName: "Atelier Noir",
    materialName: "Bamboo viscose",
    category: "Semi-synthetic",
    notes: "Need this for our SS26 collection base layer. Supplier: Litrax.",
    co2PerKg: 2.8,
    waterPerKg: 2200,
    energyPerKg: 45,
    submittedAt: "2026-05-28T10:22:00Z",
    status: "pending",
  },
  {
    id: "req-002",
    brandId: "brand-003",
    brandName: "Volos Knitwear",
    materialName: "Alpaca (fine)",
    category: "Natural fiber",
    notes: "For luxury knitwear line. Similar environmental profile to merino wool.",
    submittedAt: "2026-06-02T14:05:00Z",
    status: "pending",
  },
  {
    id: "req-003",
    brandId: "brand-001",
    brandName: "Atelier Noir",
    materialName: "Econyl (recycled nylon yarn)",
    category: "Recycled synthetic",
    notes: "ECONYL® regenerated nylon — made from ghost nets and industrial plastic waste.",
    co2PerKg: 2.1,
    waterPerKg: 55,
    energyPerKg: 45,
    chemistryScore: 4,
    circularityScore: 72,
    submittedAt: "2026-04-20T09:10:00Z",
    status: "approved",
    approvedAt: "2026-04-25T11:30:00Z",
    approvedMaterialId: "mat-016",
  },
  {
    id: "req-004",
    brandId: "brand-002",
    brandName: "Marble Studio",
    materialName: "Conventional bamboo fiber",
    category: "Natural fiber",
    notes: "For SS26 summer shirts. Looking for a breathable alternative to cotton.",
    submittedAt: "2026-05-15T16:40:00Z",
    status: "rejected",
    rejectedAt: "2026-05-20T10:15:00Z",
    rejectionReason: "Conventional bamboo processing is chemically intensive and classified as semi-synthetic by EU regulations. Please submit Lyocell/TENCEL™ or specify the exact processing method. If the product is mechanically processed bamboo linen, resubmit under 'Natural fiber'.",
  },
];
