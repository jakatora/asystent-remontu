import type {
  CommerceProduct,
  CommerceVariant,
  CommerceCart,
  CommerceCartLine,
  ShippingSummary,
  StoreAvailability,
} from '@/types/commerce';

export interface CommerceProviderInterface {
  readonly name: string;
  readonly connected: boolean;

  searchProducts(query: string, first?: number): Promise<CommerceProduct[]>;
  getProductByExternalId(externalId: string): Promise<CommerceProduct | null>;
  getProductVariants(productId: string): Promise<CommerceVariant[]>;

  createCart(lines: { variantId: string; quantity: number }[]): Promise<CommerceCart>;
  addCartLines(cartId: string, lines: { variantId: string; quantity: number }[]): Promise<CommerceCart>;
  updateCartLines(cartId: string, lines: { lineId: string; quantity: number }[]): Promise<CommerceCart>;
  removeCartLines(cartId: string, lineIds: string[]): Promise<CommerceCart>;
  getCart(cartId: string): Promise<CommerceCart | null>;
  getCheckoutUrl(cartId: string): Promise<string>;

  getStoreAvailability(variantIds: string[]): Promise<StoreAvailability[]>;
  estimateShippingSummary(variantIds: string[], region: string): Promise<ShippingSummary>;
}
