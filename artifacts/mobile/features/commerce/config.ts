import type { StoreConfig, CommerceProviderType, CheckoutMode } from '@/types/commerce';

export const DEFAULT_STORE_CONFIG: StoreConfig = {
  selectedCommerceProvider: 'mock',
  storeDisplayName: 'Sklep remontowy',
  storefrontUrl: '',
  storefrontApiVersion: '2025-01',
  publicStorefrontToken: '',
  checkoutMode: 'web_checkout',
  currency: 'PLN',
  defaultShippingRegion: 'lodzkie',
  enableCartDrafts: true,
  enableToolSales: true,
  enableBundleMode: false,
  enableUnavailableItemWarnings: true,
};

export interface StoreConfigValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export function validateStoreConfig(config: StoreConfig): StoreConfigValidationResult {
  const errors: string[] = [];

  if (!config.storeDisplayName.trim()) {
    errors.push('Nazwa sklepu jest wymagana.');
  }

  const validProviders: CommerceProviderType[] = ['shopify', 'woocommerce', 'manual_link', 'mock'];
  if (!validProviders.includes(config.selectedCommerceProvider)) {
    errors.push(`Nieznany dostawca: ${config.selectedCommerceProvider}`);
  }

  if (config.selectedCommerceProvider !== 'mock') {
    if (!config.storefrontUrl.trim()) {
      errors.push('URL sklepu jest wymagany dla dostawcy innego niż mock.');
    }
    if (!config.publicStorefrontToken.trim()) {
      errors.push('Token API sklepu jest wymagany.');
    }
  }

  const validModes: CheckoutMode[] = ['web_checkout', 'native_checkout_placeholder'];
  if (!validModes.includes(config.checkoutMode)) {
    errors.push(`Nieznany tryb checkout: ${config.checkoutMode}`);
  }

  if (!config.currency || config.currency.length !== 3) {
    errors.push('Waluta musi być kodem ISO 4217 (np. PLN).');
  }

  return { valid: errors.length === 0, errors };
}

export function isCommerceReady(config: StoreConfig): boolean {
  if (config.selectedCommerceProvider === 'mock') return true;
  return !!(
    config.storefrontUrl &&
    config.publicStorefrontToken &&
    config.storeDisplayName
  );
}

export function mergeStoreConfig(base: StoreConfig, partial: Partial<StoreConfig>): StoreConfig {
  return { ...base, ...partial };
}
