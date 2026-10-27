// Walidacja wejścia endpointów wyceny. Kształt zgodny z kontraktem adaptera
// `@workspace/pricing-service` (CalculatorStageResult / CalculatorMaterialLine /
// EstimateOptions). Waliduje TYLKO strukturę wejścia z kalkulatora — ceny i
// opakowania liczy serwis wyceny na podstawie katalogu, nie klient.
import { z } from "zod";

const materialSchema = z.object({
  id: z.string(),
  name: z.string(),
  unit: z.string(),
  category: z.string().nullish(),
  ean: z.string().nullish(),
  gtin: z.string().nullish(),
});

const materialLineSchema = z.object({
  material: materialSchema,
  // Ilość natywna materiału policzona przez silnik — nieujemna i skończona.
  quantity: z.number().finite().nonnegative(),
  // Opakowania referencyjne z mobile — przyjmowane, ale wycena ich NIE używa.
  packs: z.number().finite().optional(),
});

export const stageResultSchema = z.object({
  jobId: z.string(),
  materials: z.array(materialLineSchema),
  // Obmiary etapu (MeasurementMap: m² ścian/podłogi, mb obwodu, szt urządzeń).
  // Opcjonalne — używane WYŁĄCZNIE do wyceny robocizny. Wartości skończone;
  // niepoprawne klucze (nie-liczby) są ignorowane przez walidację.
  measurements: z.record(z.string(), z.number().finite()).optional(),
});

export const optionsSchema = z
  .object({
    region: z.string().nullish(),
    store: z.string().nullish(),
    refreshPrices: z.boolean().optional(),
    delivery: z.object({
      mode: z.enum(['shipping', 'pickup']),
      method: z.enum(['automatic', 'manual']).optional(),
      postalCode: z.string().regex(/^\d{2}-\d{3}$/).optional(),
      allowSeparateOrders: z.boolean().optional(),
      costsGrosze: z.record(z.string().min(1).max(80), z.number().int().min(0).max(10_000_000))
        .refine(value => Object.keys(value).length <= 20).optional(),
    }).optional(),
  })
  .optional();

/** Body dla POST /api/pricing/stage. */
export const stageRequestSchema = z.object({
  job: stageResultSchema,
  options: optionsSchema,
});

/** Body dla POST /api/pricing/project (i payload GET-a). */
export const projectRequestSchema = z.object({
  jobs: z.array(stageResultSchema),
  options: optionsSchema,
});

export type StageRequest = z.infer<typeof stageRequestSchema>;
export type ProjectRequest = z.infer<typeof projectRequestSchema>;
