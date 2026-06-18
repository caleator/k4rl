export type FactoryType = "Cut & Sew" | "Knitting" | "Weaving" | "Finishing" | "Full Package";
export type CertificateStatus = "pending" | "uploaded" | "expired";

export interface FactoryCertificate {
  id: string;
  type: string; // e.g. "OEKO-TEX", "GOTS", "GRS"
  fileName: string;
  uploadedAt: string;
}

export interface FactoryLink {
  id: string;
  factoryId: string;
  type: "certificate-upload" | "label-download";
  token: string;
  batchId?: string;
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
  status: CertificateStatus;
}

export interface Factory {
  id: string;
  brandId: string;
  name: string;
  country: string;
  type: FactoryType;
  email: string;
  certificates: FactoryCertificate[];
  createdAt: string;
}

export const FACTORIES: Factory[] = [
  {
    id: "fac-001",
    brandId: "brand-001",
    name: "Texteis Lena",
    country: "Portugal",
    type: "Cut & Sew",
    email: "compliance@texteis-lena.pt",
    certificates: [
      { id: "cert-001", type: "OEKO-TEX Standard 100", fileName: "oeko-tex-2026.pdf", uploadedAt: "2026-05-12T10:00:00Z" },
      { id: "cert-002", type: "GOTS", fileName: "gots-cert-2026.pdf", uploadedAt: "2026-05-12T10:05:00Z" },
    ],
    createdAt: "2026-05-01T08:00:00Z",
  },
  {
    id: "fac-002",
    brandId: "brand-001",
    name: "Manifattura Rossi",
    country: "Italy",
    type: "Full Package",
    email: "quality@m-rossi.it",
    certificates: [
      { id: "cert-003", type: "OEKO-TEX Standard 100", fileName: "oeko-tex-rossi-2026.pdf", uploadedAt: "2026-05-18T14:00:00Z" },
    ],
    createdAt: "2026-05-10T09:00:00Z",
  },
  {
    id: "fac-003",
    brandId: "brand-002",
    name: "Cyprus Textile Co.",
    country: "Cyprus",
    type: "Cut & Sew",
    email: "info@cy-textile.com",
    certificates: [],
    createdAt: "2026-06-11T08:00:00Z",
  },
];

export const FACTORY_LINKS: FactoryLink[] = [
  {
    id: "link-001",
    factoryId: "fac-001",
    type: "certificate-upload",
    token: "tok-cert-abc123",
    createdAt: "2026-05-11T08:00:00Z",
    expiresAt: "2026-05-18T08:00:00Z",
    usedAt: "2026-05-12T10:00:00Z",
    status: "uploaded",
  },
  {
    id: "link-002",
    factoryId: "fac-001",
    type: "label-download",
    token: "tok-lbl-def456",
    batchId: "batch-001",
    createdAt: "2026-05-11T08:30:00Z",
    expiresAt: "2026-05-18T08:30:00Z",
    usedAt: "2026-05-11T09:00:00Z",
    status: "uploaded",
  },
  {
    id: "link-003",
    factoryId: "fac-003",
    type: "certificate-upload",
    token: "tok-cert-ghi789",
    createdAt: "2026-06-12T10:00:00Z",
    expiresAt: "2026-06-19T10:00:00Z",
    status: "pending",
  },
];
