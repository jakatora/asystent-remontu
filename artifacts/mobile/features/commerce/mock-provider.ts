import type {
  CommerceProduct,
  CommerceVariant,
  CommerceCart,
  ShippingSummary,
  StoreAvailability,
} from '@/types/commerce';
import type { CommerceProviderInterface } from './provider';
import { generateId } from '@/shared/lib/id';
import { nowISO } from '@/shared/lib/date';

const MOCK_DELAY_MS = 300;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

const MOCK_PRODUCTS: CommerceProduct[] = [
  {
    id: 'mock-prod-paint-std',
    title: 'Farba GoodHome Ściany i Sufit biały mat 10 l',
    handle: 'farba-goodhome-bialy-mat-10l',
    vendor: 'GoodHome',
    productType: 'Paint',
    tags: ['paint', 'white', 'interior'],
    availableForSale: true,
    images: [],
    variants: [
      {
        id: 'mock-var-paint-std-10l',
        title: '10 l',
        sku: 'GH-PAINT-WHT-10L',
        price: 72.98,
        currency: 'PLN',
        availableForSale: true,
        quantityAvailable: 150,
        selectedOptions: [{ name: 'Rozmiar', value: '10 l' }],
      },
    ],
  },
  {
    id: 'mock-prod-primer',
    title: 'Grunt uniwersalny Knauf 5 l',
    handle: 'grunt-knauf-5l',
    vendor: 'Knauf',
    productType: 'Primer',
    tags: ['primer', 'universal'],
    availableForSale: true,
    images: [],
    variants: [
      {
        id: 'mock-var-primer-5l',
        title: '5 l',
        sku: 'KN-PRIMER-5L',
        price: 30.98,
        currency: 'PLN',
        availableForSale: true,
        quantityAvailable: 200,
        selectedOptions: [{ name: 'Rozmiar', value: '5 l' }],
      },
    ],
  },
  {
    id: 'mock-prod-laminate',
    title: 'Panele laminowane Oakland wodoodporne AC4 2.51 m²',
    handle: 'panele-oakland-ac4',
    vendor: 'Oakland',
    productType: 'Flooring',
    tags: ['laminate', 'waterproof', 'ac4'],
    availableForSale: true,
    images: [],
    variants: [
      {
        id: 'mock-var-laminate-251',
        title: '2.51 m²',
        sku: 'OAK-LAM-AC4-251',
        price: 67.72,
        currency: 'PLN',
        availableForSale: true,
        quantityAvailable: 80,
        selectedOptions: [{ name: 'Opakowanie', value: '2.51 m²' }],
      },
    ],
  },
];

let mockCarts = new Map<string, CommerceCart>();

export class MockCommerceProvider implements CommerceProviderInterface {
  readonly name = 'mock';
  readonly connected = true;

  async searchProducts(query: string, first = 10): Promise<CommerceProduct[]> {
    await delay(MOCK_DELAY_MS);
    const q = query.toLowerCase();
    return MOCK_PRODUCTS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q))
    ).slice(0, first);
  }

  async getProductByExternalId(externalId: string): Promise<CommerceProduct | null> {
    await delay(MOCK_DELAY_MS);
    return MOCK_PRODUCTS.find((p) => p.id === externalId) ?? null;
  }

  async getProductVariants(productId: string): Promise<CommerceVariant[]> {
    await delay(MOCK_DELAY_MS);
    const product = MOCK_PRODUCTS.find((p) => p.id === productId);
    return [...(product?.variants ?? [])];
  }

  async createCart(lines: { variantId: string; quantity: number }[]): Promise<CommerceCart> {
    await delay(MOCK_DELAY_MS);
    const cartId = generateId('cart');
    const cartLines = lines.map((l) => this.resolveCartLine(l.variantId, l.quantity));
    const now = nowISO();
    const cart: CommerceCart = {
      id: cartId,
      checkoutUrl: `https://mock-store.example.com/checkout/${cartId}`,
      lines: cartLines,
      estimatedCost: this.computeCartCost(cartLines),
      createdAt: now,
      updatedAt: now,
    };
    mockCarts.set(cartId, cart);
    return cart;
  }

  async addCartLines(cartId: string, lines: { variantId: string; quantity: number }[]): Promise<CommerceCart> {
    await delay(MOCK_DELAY_MS);
    const cart = mockCarts.get(cartId);
    if (!cart) throw new Error(`Cart ${cartId} not found`);
    const newLines = lines.map((l) => this.resolveCartLine(l.variantId, l.quantity));
    const updatedLines = [...cart.lines, ...newLines];
    const updated: CommerceCart = {
      ...cart,
      lines: updatedLines,
      estimatedCost: this.computeCartCost(updatedLines),
      updatedAt: nowISO(),
    };
    mockCarts.set(cartId, updated);
    return updated;
  }

  async updateCartLines(cartId: string, lines: { lineId: string; quantity: number }[]): Promise<CommerceCart> {
    await delay(MOCK_DELAY_MS);
    const cart = mockCarts.get(cartId);
    if (!cart) throw new Error(`Cart ${cartId} not found`);
    const updateMap = new Map(lines.map((l) => [l.lineId, l.quantity]));
    const updatedLines = cart.lines.map((cl) => {
      const newQty = updateMap.get(cl.id);
      if (newQty === undefined) return cl;
      return { ...cl, quantity: newQty, lineTotal: Math.round(cl.unitPrice * newQty * 100) / 100 };
    });
    const updated: CommerceCart = {
      ...cart,
      lines: updatedLines,
      estimatedCost: this.computeCartCost(updatedLines),
      updatedAt: nowISO(),
    };
    mockCarts.set(cartId, updated);
    return updated;
  }

  async removeCartLines(cartId: string, lineIds: string[]): Promise<CommerceCart> {
    await delay(MOCK_DELAY_MS);
    const cart = mockCarts.get(cartId);
    if (!cart) throw new Error(`Cart ${cartId} not found`);
    const removeSet = new Set(lineIds);
    const updatedLines = cart.lines.filter((cl) => !removeSet.has(cl.id));
    const updated: CommerceCart = {
      ...cart,
      lines: updatedLines,
      estimatedCost: this.computeCartCost(updatedLines),
      updatedAt: nowISO(),
    };
    mockCarts.set(cartId, updated);
    return updated;
  }

  async getCart(cartId: string): Promise<CommerceCart | null> {
    await delay(MOCK_DELAY_MS);
    return mockCarts.get(cartId) ?? null;
  }

  async getCheckoutUrl(cartId: string): Promise<string> {
    await delay(MOCK_DELAY_MS);
    return `https://mock-store.example.com/checkout/${cartId}`;
  }

  async getStoreAvailability(variantIds: string[]): Promise<StoreAvailability[]> {
    await delay(MOCK_DELAY_MS);
    return variantIds.map((vid) => {
      const found = MOCK_PRODUCTS.some((p) => p.variants.some((v) => v.id === vid));
      return {
        variantId: vid,
        available: found,
        quantityAvailable: found ? 100 : 0,
        locationName: 'Magazyn centralny',
      };
    });
  }

  async estimateShippingSummary(variantIds: string[], region: string): Promise<ShippingSummary> {
    await delay(MOCK_DELAY_MS);
    return {
      estimatedDays: 3,
      estimatedCost: variantIds.length > 5 ? 0 : 14.99,
      currency: 'PLN',
      carrier: 'InPost',
      note: region === 'lodzkie' ? 'Darmowa dostawa od 6 produktów' : undefined,
    };
  }

  private resolveCartLine(variantId: string, quantity: number) {
    let title = variantId;
    let unitPrice = 0;
    for (const p of MOCK_PRODUCTS) {
      const v = p.variants.find((v) => v.id === variantId);
      if (v) {
        title = `${p.title} — ${v.title}`;
        unitPrice = v.price;
        break;
      }
    }
    return {
      id: generateId('cl'),
      variantId,
      quantity,
      title,
      unitPrice,
      lineTotal: Math.round(unitPrice * quantity * 100) / 100,
      currency: 'PLN',
    };
  }

  private computeCartCost(lines: readonly { lineTotal: number }[]) {
    const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
    return {
      subtotalAmount: Math.round(subtotal * 100) / 100,
      totalAmount: Math.round(subtotal * 100) / 100,
      currency: 'PLN',
    };
  }
}
