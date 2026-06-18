/**
 * EcoScore calculation engine.
 * Based on the K4RL custom methodology (EcoScore_Excel_Calculation_Explanation.docx
 * and Blend_Modifier_Rules.docx).
 *
 * Score range: 0–100. Grade: A ≥ 85, B ≥ 70, C ≥ 55, D ≥ 40, E < 40.
 */

import { Material } from "./mock/materials";

// Weighting factors (from Parameters sheet)
const WEIGHTS = {
  co2: 0.35,
  water: 0.25,
  energy: 0.15,
  chemistry: 0.15,
  circularity: 0.10,
};

// Normalization reference maxima (worst-case benchmarks)
const MAX_REF = {
  co2: 30,      // kg CO₂e/kg — cashmere-level ceiling
  water: 20000, // L/kg — conventional cotton ceiling
  energy: 150,  // MJ/kg — nylon-level ceiling
};

export interface CompositionInput {
  material: Material;
  percentage: number; // 0–100, all components must sum to 100
  isRecycled?: boolean;
  isOrganic?: boolean;
  hasElastane?: boolean;    // true if this component contains elastane >10%
  hasPuCoating?: boolean;
  hasPvcCoating?: boolean;
  hasHazardousFinish?: boolean;
}

export interface EcoScoreResult {
  score: number;
  grade: "A" | "B" | "C" | "D" | "E";
  subscores: {
    co2: number;
    water: number;
    energy: number;
    chemistry: number;
    circularity: number;
  };
  blendedImpacts: {
    co2PerKg: number;
    waterPerKg: number;
    energyPerKg: number;
  };
}

function applyModifiers(component: CompositionInput) {
  let { co2PerKg, waterPerKg, energyPerKg, chemistryScore, circularityScore } =
    component.material;

  // Positive modifiers
  if (component.isRecycled) {
    co2PerKg *= 0.5;
    energyPerKg *= 0.5;
    waterPerKg *= 0.1; // up to 90% reduction for recycled cotton
  }
  if (component.isOrganic) {
    waterPerKg *= 0.4;  // −60%
    chemistryScore = Math.max(0, chemistryScore * 0.6); // −40%
  }
  // Lyocell/TENCEL chemistry reduction (applied via material data, but enforce)
  if (component.material.name.toLowerCase().includes("lyocell") ||
      component.material.name.toLowerCase().includes("tencel")) {
    chemistryScore = Math.max(0, chemistryScore * 0.7); // −30%
  }

  // Negative modifiers — apply after positive
  if (component.hasPuCoating) {
    co2PerKg *= 1.4;          // +40%
    chemistryScore = Math.max(0, chemistryScore - 2); // −20 points (scaled)
  }
  if (component.hasPvcCoating) {
    co2PerKg *= 1.6;          // +60%
    energyPerKg += 50;
  }
  if (component.hasHazardousFinish) {
    chemistryScore = Math.min(chemistryScore - 5, 1); // floor at worst case
  }
  if (component.hasElastane) {
    circularityScore = Math.min(circularityScore, 30); // cap circularity
    co2PerKg *= 1.05;  // +5% per 5% elastane (simplified)
    chemistryScore = Math.min(chemistryScore + 0.5, 10);
  }

  return { co2PerKg, waterPerKg, energyPerKg, chemistryScore, circularityScore };
}

export function calculateEcoScore(components: CompositionInput[]): EcoScoreResult {
  // Validate composition sums to 100
  const total = components.reduce((sum, c) => sum + c.percentage, 0);
  if (Math.abs(total - 100) > 0.5) {
    throw new Error(`Composition must sum to 100%, got ${total}%`);
  }

  // Step 1: Apply modifiers per component
  const modified = components.map((c) => ({
    ...applyModifiers(c),
    fraction: c.percentage / 100,
  }));

  // Step 2: Blended impacts (weighted average)
  const blended = {
    co2PerKg: modified.reduce((s, m) => s + m.co2PerKg * m.fraction, 0),
    waterPerKg: modified.reduce((s, m) => s + m.waterPerKg * m.fraction, 0),
    energyPerKg: modified.reduce((s, m) => s + m.energyPerKg * m.fraction, 0),
    chemistryScore: modified.reduce((s, m) => s + m.chemistryScore * m.fraction, 0),
    circularityScore: modified.reduce((s, m) => s + m.circularityScore * m.fraction, 0),
  };

  // Step 3: Normalize (0–100, lower impact = higher subscore)
  const sub = {
    co2: Math.max(0, (1 - blended.co2PerKg / MAX_REF.co2) * 100),
    water: Math.max(0, (1 - blended.waterPerKg / MAX_REF.water) * 100),
    energy: Math.max(0, (1 - blended.energyPerKg / MAX_REF.energy) * 100),
    chemistry: Math.max(0, (1 - blended.chemistryScore / 10) * 100),
    circularity: blended.circularityScore,
  };

  // Step 4: Weighted final score
  const score = Math.round(
    sub.co2 * WEIGHTS.co2 +
    sub.water * WEIGHTS.water +
    sub.energy * WEIGHTS.energy +
    sub.chemistry * WEIGHTS.chemistry +
    sub.circularity * WEIGHTS.circularity
  );

  const clamped = Math.min(100, Math.max(0, score));

  const grade =
    clamped >= 85 ? "A" :
    clamped >= 70 ? "B" :
    clamped >= 55 ? "C" :
    clamped >= 40 ? "D" : "E";

  return {
    score: clamped,
    grade,
    subscores: sub,
    blendedImpacts: {
      co2PerKg: blended.co2PerKg,
      waterPerKg: blended.waterPerKg,
      energyPerKg: blended.energyPerKg,
    },
  };
}
