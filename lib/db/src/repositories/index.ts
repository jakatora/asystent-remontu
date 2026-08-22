// Warstwa dostępu do danych (DAO) nad katalogiem produktów, ofertami cenowymi
// i historią cen. Repozytoria przyjmują instancję Drizzle (`db`) jako argument.
export * from "./types";
export * from "./helpers";
export * from "./products.repo";
export * from "./product-offers.repo";
export * from "./price-history.repo";

// Typy rekordów (select) re-eksportowane z warstwy DAO, żeby konsumenci nie
// musieli sięgać osobno do ../schema (repozytoria i tak zwracają te typy).
export type { Product } from "../schema/products";
export type { ProductOffer } from "../schema/product-offers";
export type { PriceHistory } from "../schema/price-history";
