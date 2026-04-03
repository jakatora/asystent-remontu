import type {
  BillingProviderType,
  BillingPlanDefinition,
  BillingEvent,
  BillingPortalLinkPlaceholder,
  ContractorPlanId,
  AccessGrantReason,
} from '@/types/contractor-plans';

export interface BillingProviderInterface {
  readonly providerType: BillingProviderType;
  getAvailablePlans(): Promise<BillingPlanDefinition[]>;
  initiatePurchase(contractorId: string, planId: ContractorPlanId): Promise<{ success: boolean; message: string }>;
  cancelSubscription(contractorId: string): Promise<{ success: boolean; message: string }>;
  getPortalLink(contractorId: string): Promise<BillingPortalLinkPlaceholder | null>;
  verifyReceipt(contractorId: string, receiptData: string): Promise<{ valid: boolean; planId?: ContractorPlanId }>;
}

export class PlaceholderBillingProvider implements BillingProviderInterface {
  readonly providerType: BillingProviderType = 'admin_manual_assignment';

  async getAvailablePlans(): Promise<BillingPlanDefinition[]> {
    return [
      { planId: 'free', providerType: this.providerType, monthlyPricePlaceholder: 0, yearlyPricePlaceholder: 0, currency: 'PLN', isAvailable: true },
      { planId: 'starter', providerType: this.providerType, monthlyPricePlaceholder: 49, yearlyPricePlaceholder: 470, currency: 'PLN', isAvailable: true },
      { planId: 'pro', providerType: this.providerType, monthlyPricePlaceholder: 149, yearlyPricePlaceholder: 1430, currency: 'PLN', isAvailable: true },
      { planId: 'featured', providerType: this.providerType, monthlyPricePlaceholder: 299, yearlyPricePlaceholder: 2870, currency: 'PLN', isAvailable: true },
      { planId: 'enterprise', providerType: this.providerType, monthlyPricePlaceholder: 0, yearlyPricePlaceholder: 0, currency: 'PLN', isAvailable: false },
    ];
  }

  async initiatePurchase(contractorId: string, planId: ContractorPlanId): Promise<{ success: boolean; message: string }> {
    return {
      success: false,
      message: 'Platnosci nie sa jeszcze dostepne. Plan moze byc przypisany recznie przez administratora.',
    };
  }

  async cancelSubscription(contractorId: string): Promise<{ success: boolean; message: string }> {
    return {
      success: false,
      message: 'Anulowanie subskrypcji nie jest jeszcze dostepne. Skontaktuj sie z pomoca techniczna.',
    };
  }

  async getPortalLink(contractorId: string): Promise<BillingPortalLinkPlaceholder | null> {
    return null;
  }

  async verifyReceipt(_contractorId: string, _receiptData: string): Promise<{ valid: boolean; planId?: ContractorPlanId }> {
    return { valid: false };
  }
}

export const billingProvider: BillingProviderInterface = new PlaceholderBillingProvider();

export const BILLING_COMPLIANCE_NOTES = `
BILLING / COMPLIANCE DEVELOPER NOTES
=====================================
1. Mobile in-app billing (Apple IAP / Google Play Billing) may be required
   for digital in-app benefits depending on store/platform rules.

2. Physical-service exceptions: Contractor services are physical/real-world,
   which may qualify for exemptions from in-app purchase requirements on some
   platforms. This must be evaluated with legal counsel before launching
   real checkout.

3. This implementation intentionally prepares entitlements, plan definitions,
   usage tracking, and billing event architecture WITHOUT final checkout.

4. When real billing is added:
   - Replace PlaceholderBillingProvider with platform-specific implementations
   - AppStoreBillingProvider for iOS (StoreKit 2)
   - GooglePlayBillingProvider for Android (Google Play Billing Library)
   - WebBillingProvider for web (Stripe or similar)
   - Implement receipt validation server-side
   - Add webhook handlers for subscription lifecycle events

5. AccessGrantReason tracks HOW a plan was granted, which is critical for
   audit trails and store compliance.

6. All promoted/featured/sponsored labels remain transparent to end users
   regardless of billing method.
` as const;
