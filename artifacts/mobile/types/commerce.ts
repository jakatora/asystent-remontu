import type { ShoppingTier } from './domain';
import type { QualityTier, MaterialCategory } from './pricing';

export type CommerceProviderType = 'shopify' | 'woocommerce' | 'manual_link' | 'mock';

export type CartLineSourceType = 'material' | 'tool' | 'add_on' | 'bundle_item';

export type CheckoutMode = 'web_checkout' | 'native_checkout_placeholder';

export type ToolCartPreference = 'materials_only' | 'materials_and_required_tools' | 'materials_and_all_tools';

export type MappingStatus = 'mapped' | 'unmapped' | 'discontinued' | 'out_of_stock';

export type CartDraftStatus = 'draft' | 'ready' | 'submitted' | 'expired';

export type ShippingClass = 'standard' | 'bulky' | 'hazmat' | 'fragile';

export type CommerceUnitType = 'piece' | 'pack' | 'box' | 'pallet' | 'roll' | 'bag' | 'can' | 'tube' | 'set';

export interface StoreConfig {
  readonly selectedCommerceProvider: CommerceProviderType;
  readonly storeDisplayName: string;
  readonly storefrontUrl: string;
  readonly storefrontApiVersion: string;
  readonly publicStorefrontToken: string;
  readonly checkoutMode: CheckoutMode;
  readonly currency: string;
  readonly defaultShippingRegion: string;
  readonly enableCartDrafts: boolean;
  readonly enableToolSales: boolean;
  readonly enableBundleMode: boolean;
  readonly enableUnavailableItemWarnings: boolean;
}

export interface ProductMapping {
  readonly internalId: string;
  readonly internalType: 'material' | 'tool';
  readonly commerceProvider: CommerceProviderType;
  readonly externalProductId: string;
  readonly externalVariantId: string;
  readonly externalHandle: string;
  readonly sku: string;
  readonly barcode?: string;
  readonly productTitle: string;
  readonly variantTitle: string;
  readonly packageSize: number;
  readonly packageUnit: string;
  readonly unitType: CommerceUnitType;
  readonly quantityToCartTransform: QuantityTransform;
  readonly activeForCommerce: boolean;
  readonly shippingClass?: ShippingClass;
  readonly categoryPath: string;
  readonly tags: readonly string[];
  readonly lastSyncedAt?: string;
}

export interface QuantityTransform {
  readonly mode: 'direct' | 'divide_by_package' | 'multiply' | 'custom';
  readonly factor?: number;
  readonly minQuantity?: number;
  readonly maxQuantity?: number;
  readonly roundUp?: boolean;
}

export interface CartDraft {
  readonly id: string;
  readonly projectId: string;
  readonly status: CartDraftStatus;
  readonly lines: readonly CartDraftLine[];
  readonly toolPreference: ToolCartPreference;
  readonly qualityTier: QualityTier;
  readonly summary: CartDraftSummary;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly notes?: string;
}

export interface CartDraftLine {
  readonly lineId: string;
  readonly internalId: string;
  readonly internalName: string;
  readonly sourceType: CartLineSourceType;
  readonly mappingStatus: MappingStatus;
  readonly mapping?: ProductMapping;
  readonly calculatedQuantity: number;
  readonly userOverrideQuantity?: number;
  readonly effectiveQuantity: number;
  readonly packageSize?: number;
  readonly packageUnit?: string;
  readonly unitPrice: number;
  readonly lineTotal: number;
  readonly tier?: ShoppingTier;
  readonly notes?: string;
  readonly included: boolean;
}

export interface CartDraftSummary {
  readonly totalLines: number;
  readonly mappedLines: number;
  readonly unmappedLines: number;
  readonly materialLines: number;
  readonly toolLines: number;
  readonly addOnLines: number;
  readonly estimatedSubtotal: number;
  readonly currency: string;
  readonly toolsIncluded: boolean;
}

export interface ToolCartConfig {
  readonly toolId: string;
  readonly toolName: string;
  readonly required: boolean;
  readonly owned: boolean;
  readonly addToCart: boolean;
  readonly recommendedAddOn: boolean;
}

export interface BundleDefinition {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly jobIds: readonly string[];
  readonly items: readonly BundleItem[];
  readonly optionalUpgrades: readonly BundleItem[];
  readonly quantityRules: BundleQuantityRules;
  readonly compatibilityTags: readonly string[];
  readonly estimatedSubtotal: number;
  readonly currency: string;
}

export interface BundleItem {
  readonly internalId: string;
  readonly name: string;
  readonly type: 'material' | 'tool';
  readonly quantity: number;
  readonly unit: string;
  readonly unitPrice: number;
}

export interface BundleQuantityRules {
  readonly scaleWithArea: boolean;
  readonly baseAreaM2?: number;
  readonly minQuantityMultiplier?: number;
  readonly maxQuantityMultiplier?: number;
}

export interface CheckoutHandoff {
  readonly cartDraftId: string;
  readonly provider: CommerceProviderType;
  readonly mode: CheckoutMode;
  readonly checkoutUrl?: string;
  readonly payload: CheckoutPayload;
  readonly createdAt: string;
}

export interface CheckoutPayload {
  readonly lines: readonly CheckoutPayloadLine[];
  readonly currency: string;
  readonly locale: string;
  readonly note?: string;
  readonly redirectUrl?: string;
  readonly estimatedTotal: number;
}

export interface CheckoutPayloadLine {
  readonly externalVariantId: string;
  readonly quantity: number;
  readonly properties?: Record<string, string>;
}

export interface CommerceProduct {
  readonly id: string;
  readonly title: string;
  readonly handle: string;
  readonly description?: string;
  readonly vendor?: string;
  readonly productType?: string;
  readonly tags: readonly string[];
  readonly variants: readonly CommerceVariant[];
  readonly images: readonly CommerceImage[];
  readonly availableForSale: boolean;
}

export interface CommerceVariant {
  readonly id: string;
  readonly title: string;
  readonly sku?: string;
  readonly barcode?: string;
  readonly price: number;
  readonly compareAtPrice?: number;
  readonly currency: string;
  readonly availableForSale: boolean;
  readonly quantityAvailable?: number;
  readonly selectedOptions: readonly { name: string; value: string }[];
}

export interface CommerceImage {
  readonly url: string;
  readonly altText?: string;
  readonly width?: number;
  readonly height?: number;
}

export interface CommerceCart {
  readonly id: string;
  readonly checkoutUrl: string;
  readonly lines: readonly CommerceCartLine[];
  readonly estimatedCost: {
    readonly subtotalAmount: number;
    readonly totalAmount: number;
    readonly currency: string;
  };
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CommerceCartLine {
  readonly id: string;
  readonly variantId: string;
  readonly quantity: number;
  readonly title: string;
  readonly unitPrice: number;
  readonly lineTotal: number;
  readonly currency: string;
}

export interface ShippingSummary {
  readonly estimatedDays: number;
  readonly estimatedCost: number;
  readonly currency: string;
  readonly carrier?: string;
  readonly note?: string;
}

export interface StoreAvailability {
  readonly variantId: string;
  readonly available: boolean;
  readonly quantityAvailable?: number;
  readonly locationName?: string;
}

export interface MappingImportResult {
  readonly imported: number;
  readonly updated: number;
  readonly skipped: number;
  readonly errors: readonly MappingImportError[];
}

export interface MappingImportError {
  readonly internalId: string;
  readonly reason: string;
}

export interface MappingExportData {
  readonly version: string;
  readonly exportedAt: string;
  readonly provider: CommerceProviderType;
  readonly mappings: readonly ProductMapping[];
}

export interface MappingImportPreview {
  readonly newMappings: readonly ProductMapping[];
  readonly updatedMappings: readonly { existing: ProductMapping; incoming: ProductMapping }[];
  readonly duplicates: readonly string[];
  readonly totalChanges: number;
}
