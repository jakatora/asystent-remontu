import {confirmedIndoEndcapDemand,type IndoEndcapDemand} from './indo-endcaps';
// Adapter: wynik kalkulatora (engine.calculate z mobile) -> wejście wyceny.
//
// Bierze REALNY `CalculationResult` pojedynczego joba/etapu (lista materiałów z
// policzonymi ilościami) i mapuje każdą pozycję na `EstimateItem`, po czym
// deleguje do istniejących `estimateStageCost`/`estimateProjectCost`. Nie zmienia
// UI ani silnika kalkulatora — czyta tylko jego wynik.
//
// KLUCZ DOPASOWANIA (spójny z estimate.ts/resolveProduct):
//   1) ean/gtin materiału, jeśli są (priorytet),
//   2) inaczej znormalizowana nazwa + kategoria.
// Nazwę normalizujemy TĄ SAMĄ funkcją `normalizeProductName`, którą katalog
// liczy `normalized_name` przy zapisie — dzięki temu dopasowanie po nazwie jest
// spójne niezależnie od wstrzykniętych deps.
//
// ILOŚĆ: przekazujemy `line.quantity` — ilość w jednostkach natywnych materiału
// już zaokrągloną w GÓRĘ przez silnik do jego potrzeby. `estimateStageCost`
// dokłada własne zaokrąglenie w górę do wielkości opakowania Z OFERTY katalogu.
// Świadomie NIE przekazujemy `packs` (to opakowania referencyjne z mobile, nie z
// katalogu) — liczbę opakowań ustala katalog cen. Kierunek błędu jest bezpieczny
// dla wyceny zakupów: nigdy nie zaniżamy ilości (co najwyżej jedno opakowanie za
// dużo). Wszystkie kwoty na wyjściu są w GROSZACH (patrz estimate.ts).

import { normalizeProductName, type Database } from "@workspace/db/repositories";

import {
  estimateProjectCost,
  estimateStageCost,
  type EstimateDeps,
} from "./estimate";
import { estimateStageLabor, type Measurements } from "./labor";
import { ERISMANN_3333_5_EAN, ERISMANN_3333_5_ROLL, planPlainWallpaperPanels, type PlainWallpaperRequirement } from './wallpaper-rolls';
import type {
  EstimateItem,
  EstimateOptions,
  ItemQuery,
  ProjectEstimate,
  StageEstimate,
} from "./types";

/**
 * Minimalny kształt materiału z wyniku kalkulatora — wspólny podzbiór
 * `MaterialItem` i `MaterialRequirement` z mobile. `ean`/`gtin` są opcjonalne:
 * dziś katalog materiałów ich nie ma, ale gdy się pojawią, dopasowanie po kodzie
 * ma priorytet bez zmian w tym adapterze.
 */
export interface CalculatorMaterial {
  readonly packageFamily?: 'v33-easy-kitchen-white-satin-v1';
  readonly id: string;
  readonly name: string;
  readonly unit: string;
  readonly category?: string | null;
  readonly ean?: string | null;
  readonly gtin?: string | null;
}

/** Minimalny kształt pozycji z `CalculationResult.materials` (MaterialLineItem). */
export interface CalculatorMaterialLine {
  readonly indoEndcaps?: IndoEndcapDemand;
  readonly plainWallpaper?: PlainWallpaperRequirement;
  readonly material: CalculatorMaterial;
  /** Ilość w jednostkach natywnych materiału (zaokrąglona przez silnik). */
  readonly quantity: number;
  /** Liczba opakowań referencyjnych z mobile — celowo NIE używana do wyceny. */
  readonly packs?: number;
}

/** Minimalny kształt wyniku `engine.calculate` (CalculationResult). */
export interface CalculatorStageResult {
  readonly jobId: string;
  readonly materials: readonly CalculatorMaterialLine[];
  /**
   * Obmiary etapu z kalkulatora (MeasurementMap: m² ścian/podłogi, mb obwodu,
   * szt urządzeń itd.). Opcjonalne i ADDYTYWNE — używane WYŁĄCZNIE do wyceny
   * robocizny. Brak => robocizna nieoszacowana (materiały liczą się jak dotąd).
   */
  readonly measurements?: Measurements;
}

/** Wycena etapu z dodaną informacją, z którego joba pochodzi (traceability). */
export interface StageEstimateFromCalculation extends StageEstimate {
  /** Id joba/etapu z kalkulatora, dla którego policzono wycenę. */
  readonly jobId: string;
}

/**
 * Dokłada do wyniku materiałowego etapu rozbicie na materiały + robociznę.
 * ADDYTYWNE: `stageTotalGrosze` (materiały) zostaje bez zmian; dochodzą osobne
 * pola sumaryczne i szczegóły robocizny. Wszystko w GROSZACH.
 */
function withLabor(
  stage: StageEstimate,
  jobId: string,
  measurements: Measurements,
  options: EstimateOptions,
): StageEstimateFromCalculation {
  const labor = estimateStageLabor(jobId, measurements, options);
  const materialsTotalGrosze = stage.stageTotalGrosze;
  return {
    ...stage,
    jobId,
    materialsTotalGrosze,
    laborTotalGrosze: labor.laborTotalGrosze,
    stageTotalWithLaborGrosze: materialsTotalGrosze + labor.laborTotalGrosze,
    labor,
  };
}

/**
 * Buduje `ItemQuery` z materiału kalkulatora. Puste/whitespace kody i nazwa
 * schodzą do `null`, żeby resolveProduct w estimate.ts nie próbował dopasowywać
 * po pustym kryterium. Nazwa jest normalizowana funkcją katalogu.
 */
function toItemQuery(material: CalculatorMaterial): ItemQuery {
  const ean = material.ean?.trim() || null;
  const gtin = material.gtin?.trim() || null;
  const rawName = material.name?.trim();
  const normalizedName = rawName ? normalizeProductName(rawName) || null : null;
  const category = material.category?.trim() || null;
  return { ean, gtin, normalizedName, category, ...(material.packageFamily?{packageFamily:material.packageFamily}:{}) };
}

/** Mapuje pojedynczą pozycję kalkulatora na `EstimateItem` wyceny. */
export function toEstimateItem(line: CalculatorMaterialLine): EstimateItem {
  return {
    query: toItemQuery(line.material),
    quantity: line.quantity,
    unit: line.material.unit?.trim() || null,
  };
}

/** Mapuje cały wynik etapu na listę pozycji wyceny (kolejność zachowana). */
export function toEstimateItems(
  jobResult: CalculatorStageResult,
): EstimateItem[] {
  return jobResult.materials.map(toEstimateItem);
}

/**
 * Wycena JEDNEGO etapu z realnego wyniku kalkulatora. Dla każdego materiału
 * ustala klucz dopasowania (ean/gtin ⇒ nazwa+kategoria), a resztę (najtańsza
 * oferta, wielkość opakowania, liczba opakowań, koszt w groszach) liczą istniejące
 * helpery przez `estimateStageCost`. DAO wstrzykiwane przez `deps`.
 */
export async function estimateStageCostFromCalculation(
  db: Database,
  jobResult: CalculatorStageResult,
  options: EstimateOptions = {},
  deps?: EstimateDeps,
): Promise<StageEstimateFromCalculation> {
  const items = toEstimateItems(jobResult);
  const stage = await estimateStageCost(db, items, options, deps);
  for (const [index, line] of stage.lines.entries()) {
    const input = jobResult.materials[index], cut = input?.plainWallpaper;
    if(line.resolved&&input?.material.ean===line.product.ean){const pair=confirmedIndoEndcapDemand(line.product.ean,line.unit,line.packageSize,input.quantity,input.indoEndcaps);if(pair)line.indoEndcaps=pair;}
    if (!line.resolved || line.product.ean !== ERISMANN_3333_5_EAN || input.material.ean !== ERISMANN_3333_5_EAN || line.unit !== 'szt' || line.packageSize !== 1 || cut?.version !== 1 || !Array.isArray(cut.panels)) continue;
    const plan = planPlainWallpaperPanels(cut.panels, ERISMANN_3333_5_ROLL);
    // Manual/custom shopping quantities cannot retain stale full-wall cuts.
    if (plan && input.quantity === plan.rollsNeeded) line.plainWallpaper = { version: 1, panels: cut.panels.map(panel => ({ ...panel })) };
  }
  return withLabor(stage, jobResult.jobId, jobResult.measurements ?? {}, options);
}

/**
 * Wycena całego remontu z N wyników kalkulatora (po jednym na etap/job). Liczy
 * każdy etap osobno, a sumę składa `estimateProjectCost`. Zwraca też etapy z
 * `jobId`, żeby rozbicie pozycja→sklep→cena→opakowania dało się przypisać do joba.
 */
export async function estimateProjectCostFromCalculation(
  db: Database,
  jobResults: readonly CalculatorStageResult[],
  options: EstimateOptions = {},
  deps?: EstimateDeps,
): Promise<Omit<ProjectEstimate,'stages'> & { stages: StageEstimateFromCalculation[] }> {
  const stages: StageEstimateFromCalculation[] = [];
  for (const jobResult of jobResults) {
    stages.push(
      await estimateStageCostFromCalculation(db, jobResult, options, deps),
    );
  }
  const project = estimateProjectCost(stages);
  // Project-wide stock reconciliation preserves each stage's jobId and labor.
  return { ...project, stages:project.stages as StageEstimateFromCalculation[] };
}
