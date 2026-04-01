import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type PropsWithChildren,
} from 'react';
import type {
  StoreConfig,
  CartDraft,
  ToolCartPreference,
  ToolCartConfig,
  CheckoutHandoff,
  ProductMapping,
  MappingImportPreview,
  MappingImportResult,
} from '@/types/commerce';
import type { QualityTier } from '@/types/pricing';
import type { ShoppingItem, RenovationJob } from '@/types/domain';
import {
  DEFAULT_STORE_CONFIG,
  validateStoreConfig,
  isCommerceReady,
  mergeStoreConfig,
  MockCommerceProvider,
  buildCartDraft,
  updateCartDraftLineQuantity,
  toggleCartDraftLine,
  buildToolConfigs,
  buildCheckoutHandoff,
  canProceedToCheckout,
  getUnmappedItemsFromDraft,
  exportMappingsToJson,
  parseMappingsFromJson,
  previewImport,
  applyImport,
  validateMappingIntegrity,
} from '@/features/commerce';
import type { CommerceProviderInterface } from '@/features/commerce';
import { getAllMappings } from '@/data/commerce';

interface CommerceContextValue {
  readonly storeConfig: StoreConfig;
  readonly provider: CommerceProviderInterface;
  readonly isReady: boolean;

  updateStoreConfig: (partial: Partial<StoreConfig>) => void;

  readonly currentDraft: CartDraft | null;
  generateCartDraft: (
    projectId: string,
    shoppingItems: readonly ShoppingItem[],
    job: RenovationJob,
    qualityTier: QualityTier,
    toolPreference: ToolCartPreference,
    ownedToolIds?: readonly string[]
  ) => CartDraft;
  updateLineQuantity: (lineId: string, quantity: number) => void;
  toggleLine: (lineId: string, included: boolean) => void;
  clearDraft: () => void;

  prepareCheckout: () => CheckoutHandoff | null;
  readonly lastCheckoutHandoff: CheckoutHandoff | null;

  readonly productMappings: readonly ProductMapping[];
  exportMappings: () => string;
  previewMappingImport: (json: string) => MappingImportPreview;
  applyMappingImport: (json: string) => MappingImportResult;

  getToolConfigs: (job: RenovationJob, ownedToolIds: readonly string[]) => ToolCartConfig[];
}

const CommerceContext = createContext<CommerceContextValue | null>(null);

export function CommerceProvider({ children }: PropsWithChildren) {
  const [storeConfig, setStoreConfig] = useState<StoreConfig>(DEFAULT_STORE_CONFIG);
  const [currentDraft, setCurrentDraft] = useState<CartDraft | null>(null);
  const [lastCheckoutHandoff, setLastCheckoutHandoff] = useState<CheckoutHandoff | null>(null);
  const [mappings, setMappings] = useState<ProductMapping[]>([...getAllMappings()]);

  const provider = useMemo<CommerceProviderInterface>(() => {
    switch (storeConfig.selectedCommerceProvider) {
      case 'shopify':
      case 'woocommerce':
      case 'manual_link':
      case 'mock':
      default:
        return new MockCommerceProvider();
    }
  }, [storeConfig.selectedCommerceProvider]);

  const isReady = useMemo(() => isCommerceReady(storeConfig), [storeConfig]);

  const updateStoreConfig = useCallback((partial: Partial<StoreConfig>) => {
    setStoreConfig((prev) => mergeStoreConfig(prev, partial));
  }, []);

  const generateCartDraft = useCallback(
    (
      projectId: string,
      shoppingItems: readonly ShoppingItem[],
      job: RenovationJob,
      qualityTier: QualityTier,
      toolPreference: ToolCartPreference,
      ownedToolIds?: readonly string[]
    ): CartDraft => {
      const toolConfigs = buildToolConfigs(job, ownedToolIds ?? []);
      const draft = buildCartDraft({
        projectId,
        shoppingItems,
        job,
        qualityTier,
        toolPreference,
        toolConfigs,
        mappings,
        currency: storeConfig.currency,
      });
      setCurrentDraft(draft);
      return draft;
    },
    [mappings, storeConfig.currency]
  );

  const updateLineQuantity = useCallback((lineId: string, quantity: number) => {
    setCurrentDraft((prev) => prev ? updateCartDraftLineQuantity(prev, lineId, quantity) : null);
  }, []);

  const toggleLine = useCallback((lineId: string, included: boolean) => {
    setCurrentDraft((prev) => prev ? toggleCartDraftLine(prev, lineId, included) : null);
  }, []);

  const clearDraft = useCallback(() => {
    setCurrentDraft(null);
  }, []);

  const prepareCheckout = useCallback((): CheckoutHandoff | null => {
    if (!currentDraft) return null;
    const { ready } = canProceedToCheckout(currentDraft);
    if (!ready) return null;
    const handoff = buildCheckoutHandoff(currentDraft, {
      provider: storeConfig.selectedCommerceProvider,
      mode: storeConfig.checkoutMode,
      locale: 'pl-PL',
      currency: storeConfig.currency,
    });
    setLastCheckoutHandoff(handoff);
    return handoff;
  }, [currentDraft, storeConfig]);

  const doExportMappings = useCallback((): string => {
    return exportMappingsToJson(mappings, storeConfig.selectedCommerceProvider);
  }, [mappings, storeConfig.selectedCommerceProvider]);

  const doPreviewImport = useCallback(
    (json: string): MappingImportPreview => {
      const data = parseMappingsFromJson(json);
      return previewImport(mappings, data.mappings);
    },
    [mappings]
  );

  const doApplyImport = useCallback(
    (json: string): MappingImportResult => {
      const data = parseMappingsFromJson(json);
      const { mappings: updated, result } = applyImport(mappings, data.mappings);
      setMappings(updated);
      return result;
    },
    [mappings]
  );

  const getToolConfigsFn = useCallback(
    (job: RenovationJob, ownedToolIds: readonly string[]): ToolCartConfig[] => {
      return buildToolConfigs(job, ownedToolIds);
    },
    []
  );

  const value: CommerceContextValue = {
    storeConfig,
    provider,
    isReady,
    updateStoreConfig,
    currentDraft,
    generateCartDraft,
    updateLineQuantity,
    toggleLine,
    clearDraft,
    prepareCheckout,
    lastCheckoutHandoff,
    productMappings: mappings,
    exportMappings: doExportMappings,
    previewMappingImport: doPreviewImport,
    applyMappingImport: doApplyImport,
    getToolConfigs: getToolConfigsFn,
  };

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export function useCommerce(): CommerceContextValue {
  const ctx = useContext(CommerceContext);
  if (!ctx) throw new Error('useCommerce must be used within CommerceProvider');
  return ctx;
}
