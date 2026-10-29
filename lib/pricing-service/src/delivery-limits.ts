/** Input bounds for complete renovation baskets; search and external I/O have
 * their own smaller budgets so these do not imply exhaustive optimization. */
export const DELIVERY_LIMITS = {
  // The common basket has up to 100 measured works plus one extras stage.
  jobs: 101,
  materialLines: 1_000,
  products: 200,
  stores: 64,
  packagesPerProduct: 10_000,
} as const;
