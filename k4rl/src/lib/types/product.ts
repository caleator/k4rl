export interface CompositionEntry {
  materialId: string;
  materialName: string;
  percentage: number;
  pendingRequestId?: string; // set when material request is pending approval
  isRecycled?: boolean;
  isOrganic?: boolean;
  hasElastane?: boolean;
  hasPuCoating?: boolean;
  hasPvcCoating?: boolean;
  hasHazardousFinish?: boolean;
}

export interface NewProductDraft {
  name: string;
  sku: string;
  category: string;
  weightGrams?: number;
  countryOfManufacture: string;
  composition: CompositionEntry[];
  ecoScorePublic: boolean;
  thumbnail?: string;
  gallery?: string[];
}
