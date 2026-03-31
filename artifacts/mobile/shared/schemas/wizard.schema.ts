import { z } from 'zod';

// ─── Step sub-schemas ─────────────────────────────────────────────────────────

export const WizardNameSchema = z.object({
  name: z
    .string()
    .min(1, 'Wpisz nazwę projektu')
    .max(100, 'Maksymalnie 100 znaków')
    .trim(),
});
export type WizardNameData = z.infer<typeof WizardNameSchema>;

export const WizardCategorySchema = z.object({
  categoryId: z.string().min(1, 'Wybierz kategorię'),
});
export type WizardCategoryData = z.infer<typeof WizardCategorySchema>;

export const WizardRoomSchema = z.object({
  room: z.string().min(1, 'Wybierz pomieszczenie'),
});
export type WizardRoomData = z.infer<typeof WizardRoomSchema>;

export const WizardJobSchema = z.object({
  jobId: z.string().min(1, 'Wybierz rodzaj pracy'),
});
export type WizardJobData = z.infer<typeof WizardJobSchema>;

export const WizardConditionSchema = z.object({
  condition: z.enum(['poor', 'fair', 'good'], {
    errorMap: () => ({ message: 'Wybierz stan pomieszczenia' }),
  }),
});
export type WizardConditionData = z.infer<typeof WizardConditionSchema>;

export const WizardDesiredSchema = z.object({
  desiredResult: z.enum(['refresh', 'standard', 'complete'], {
    errorMap: () => ({ message: 'Wybierz oczekiwany efekt' }),
  }),
});
export type WizardDesiredData = z.infer<typeof WizardDesiredSchema>;

export const WizardBudgetSchema = z.object({
  budgetLevel: z.enum(['economy', 'standard', 'premium'], {
    errorMap: () => ({ message: 'Wybierz poziom budżetu' }),
  }),
});
export type WizardBudgetData = z.infer<typeof WizardBudgetSchema>;

export const WizardDiySchema = z.object({
  diyMode: z.enum(['diy', 'compare', 'hire'], {
    errorMap: () => ({ message: 'Wybierz sposób realizacji' }),
  }),
});
export type WizardDiyData = z.infer<typeof WizardDiySchema>;

export const WizardMeasurementsSchema = z.object({
  measurements: z
    .record(z.string(), z.coerce.number().nonnegative('Wartość musi być nieujemna'))
    .refine(
      (m) => Object.values(m).every((v) => isFinite(v)),
      'Wszystkie wartości muszą być liczbami'
    ),
});
export type WizardMeasurementsData = z.infer<typeof WizardMeasurementsSchema>;

// ─── Full wizard data ─────────────────────────────────────────────────────────

export const WizardSchema = WizardNameSchema
  .merge(WizardCategorySchema)
  .merge(WizardRoomSchema)
  .merge(WizardJobSchema)
  .merge(WizardConditionSchema)
  .merge(WizardDesiredSchema)
  .merge(WizardBudgetSchema)
  .merge(WizardDiySchema)
  .merge(WizardMeasurementsSchema);

export type WizardData = z.infer<typeof WizardSchema>;

// ─── Room options data ────────────────────────────────────────────────────────

export interface RoomOption {
  id: string;
  label: string;
  icon: string;
  examples?: string;
}

export const ROOM_OPTIONS: RoomOption[] = [
  { id: 'salon',      label: 'Salon',           icon: 'tv',          examples: 'pokój dzienny, gabinet, jadalnia' },
  { id: 'sypialnia',  label: 'Sypialnia',        icon: 'moon',        examples: 'pokój sypialny, pokój gościnny' },
  { id: 'lazienka',   label: 'Łazienka',         icon: 'droplet',     examples: 'łazienka, toaleta, prysznic' },
  { id: 'kuchnia',    label: 'Kuchnia',           icon: 'coffee',      examples: 'kuchnia, aneks kuchenny' },
  { id: 'przedpokoj', label: 'Przedpokój',        icon: 'home',        examples: 'wiatrołap, korytarz, hol' },
  { id: 'biuro',      label: 'Biuro / gabinet',   icon: 'briefcase',   examples: 'home office, pracownia' },
  { id: 'pokoj',      label: 'Pokój dziecięcy',   icon: 'smile',       examples: 'pokój dziecka, pokój nastolatka' },
  { id: 'balkon',     label: 'Balkon / taras',    icon: 'sun',         examples: 'balkon, taras, loggia' },
  { id: 'piwnica',    label: 'Piwnica / strych',  icon: 'archive',     examples: 'piwnica, strych, garaż' },
  { id: 'inne',       label: 'Inne',              icon: 'more-horizontal', examples: 'dowolne inne pomieszczenie' },
];
