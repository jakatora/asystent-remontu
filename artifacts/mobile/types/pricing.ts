import type { ShoppingTier } from './domain';

export type PriceCurrency = 'PLN';
export type LaborUnit = 'm2' | 'mb' | 'szt' | 'room' | 'pack' | 'kg' | 'l';
export type MaterialCategory = 'economy' | 'standard' | 'better';
export type PriceSourceType = 'contractor_survey' | 'retail_store' | 'market_reference' | 'user_override';

export interface RegionProfile {
  readonly code: string;
  readonly label: string;
  readonly isBaseline: boolean;
}

export interface PriceSourceMetadata {
  readonly sourceName: string;
  readonly sourceType: PriceSourceType;
  readonly sourceUrl?: string;
  readonly lastUpdated: string;
}

export interface PriceRange {
  readonly min: number;
  readonly max: number;
  readonly baseline: number;
}

export interface LaborPriceReference {
  readonly id: string;
  readonly renovationJobId: string;
  readonly regionCode: string;
  readonly regionLabel: string;
  readonly laborUnit: LaborUnit;
  readonly laborPriceMin: number;
  readonly laborPriceMax: number;
  readonly laborPriceBaseline: number;
  readonly currency: PriceCurrency;
  readonly sourceName: string;
  readonly sourceType: PriceSourceType;
  readonly sourceUrl?: string;
  readonly lastUpdated: string;
  readonly notes?: string;
}

export interface MaterialPriceReference {
  readonly id: string;
  readonly materialType: string;
  readonly productLabel: string;
  readonly brand?: string;
  readonly packageSize: number;
  readonly packageUnit: string;
  readonly pricePerPackage: number;
  readonly pricePerM2?: number;
  readonly pricePerL?: number;
  readonly pricePerKg?: number;
  readonly pricePerMb?: number;
  readonly category: MaterialCategory;
  readonly storeName: string;
  readonly sourceUrl?: string;
  readonly lastUpdated: string;
  readonly regionSensitivityNote?: string;
  readonly notes?: string;
  readonly currency: PriceCurrency;
}

export interface PriceOverride {
  readonly id: string;
  readonly projectId: string;
  readonly targetType: 'labor' | 'material';
  readonly targetId: string;
  readonly overridePrice: number;
  readonly notes?: string;
  readonly createdAt: string;
}

export interface ProjectPriceSnapshot {
  readonly projectId: string;
  readonly regionCode: string;
  readonly qualityTier: MaterialCategory;
  readonly laborEstimateMin: number;
  readonly laborEstimateMax: number;
  readonly materialEstimate: number;
  readonly toolsEstimate: number;
  readonly totalEstimateMin: number;
  readonly totalEstimateMax: number;
  readonly currency: PriceCurrency;
  readonly snapshotDate: string;
  readonly overrides: PriceOverride[];
}

export type QualityTier = MaterialCategory | 'custom';

export interface PricingState {
  readonly regionCode: string;
  readonly qualityTier: QualityTier;
  readonly overrides: PriceOverride[];
}

export interface JobLaborMapping {
  readonly jobId: string;
  readonly laborPriceIds: readonly string[];
}

export interface JobMaterialMapping {
  readonly jobId: string;
  readonly materialPriceIds: Record<MaterialCategory, readonly string[]>;
}

export interface PricedBudgetEstimate {
  readonly materialsSubtotal: number;
  readonly laborSubtotalMin: number;
  readonly laborSubtotalMax: number;
  readonly toolsSubtotal: number;
  readonly totalEstimateMin: number;
  readonly totalEstimateMax: number;
  readonly laborDetails: LaborLineItem[];
  readonly materialDetails: MaterialLineItemPriced[];
  readonly regionCode: string;
  readonly regionLabel: string;
  readonly qualityTier: QualityTier;
  readonly lastUpdated: string;
  readonly currency: PriceCurrency;
}

export interface LaborLineItem {
  readonly laborRef: LaborPriceReference;
  readonly area: number;
  readonly costMin: number;
  readonly costMax: number;
  readonly costBaseline: number;
  readonly overridePrice?: number;
}

export interface MaterialLineItemPriced {
  readonly materialRef: MaterialPriceReference;
  readonly quantity: number;
  readonly packagesNeeded: number;
  readonly totalCost: number;
  readonly overridePrice?: number;
}
