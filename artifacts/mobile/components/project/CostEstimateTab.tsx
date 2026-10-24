import { ProductImage } from './ProductImage';
import { getProductPhoto } from '@/data/products/photos';
// Zakładka „Wycena": read-only prezentacja wyceny etapu i całego remontu z
// backendu cen (features/pricing/pricingApi). Bierze REALNY wynik lokalnego
// kalkulatora (engine.calculate) dla etapu, wysyła do POST /pricing/project i
// pokazuje: materiały z najtańszą ofertą (cena + sklep + „najtańsza"), sumę
// etapu, sumę remontu oraz osobno pozycje nierozpoznane (brak ceny w katalogu).
//
// Nic nie liczy po stronie klienta — kwoty (w groszach) i „najtańsza oferta"
// pochodzą z API; tu jest tylko formatowanie na PLN i układ. Nie dotyka formuł,
// ID jobów ani danych kalkulatora.
import React, { useCallback, useEffect, useState } from 'react';
import { View, ActivityIndicator, Pressable, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import type { CalculationResult } from '@/types/domain';
import type { QualityTier } from '@/types/pricing';
import {
  estimateProject,
  fetchPriceHistory,
  toPricingStageInput,
  formatGrosze,
  isPricingApiConfigured,
  ApiError,
  type SerializedProject,
  type SerializedStage,
  type SerializedLine,
  type SerializedPackage,
  type SerializedProductOffer,
  type SerializedConsolidatedLine,
  type SerializedStoreComparison,
  type SerializedStoreBasket,
  type SerializedHistoryPoint,
  type PriceHistoryResponse,
  type UnresolvedReason,
} from '@/features/pricing';

interface CostEstimateTabProps {
  calc: CalculationResult | undefined;
  qualityTier?: QualityTier;
  region?: string;
}

type LoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: SerializedProject };

export function CostEstimateTab({ calc, qualityTier = 'standard', region }: CostEstimateTabProps) {
  const { t } = useLanguage();
  const [state, setState] = useState<LoadState>({ status: 'idle' });

  const fetchEstimate = useCallback(async () => {
    if (!calc) return;
    setState({ status: 'loading' });
    try {
      const stage = toPricingStageInput(calc, qualityTier === 'custom' ? 'standard' : qualityTier);
      // Projekt = ten jeden etap: odpowiedź daje i rozbicie etapu, i sumę remontu.
      const data = await estimateProject([stage], { region });
      setState({ status: 'success', data });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? t('cmp.CostEstimate.errorHttp', { status: err.status })
          : t('cmp.CostEstimate.errorNetwork');
      setState({ status: 'error', message });
    }
  }, [calc, qualityTier, region, t]);

  useEffect(() => {
    if (calc && isPricingApiConfigured) void fetchEstimate();
  }, [calc, fetchEstimate]);

  if (!calc) {
    return <InfoState icon="dollar-sign" text={t('cmp.CostEstimate.noCalc')} />;
  }

  if (!isPricingApiConfigured) {
    return <InfoState icon="wifi-off" text={t('upgrade.compare.noApi')} />;
  }

  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Feather name="tag" size={18} color={Colors.primary} />
        <Txt w="bold" style={{ fontSize: 18, color: Colors.text }}>
          {t('upgrade.compare.title')}
        </Txt>
      </View>

      {state.status === 'loading' && (
        <View style={{ alignItems: 'center', gap: 12, paddingVertical: 40 }}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Txt style={{ fontSize: 14, color: Colors.textSecondary }}>
            {t('cmp.CostEstimate.loading')}
          </Txt>
        </View>
      )}

      {state.status === 'error' && (
        <View style={{ alignItems: 'center', gap: 12, paddingVertical: 32 }}>
          <Feather name="alert-triangle" size={36} color={Colors.danger} />
          <Txt w="semibold" style={{ fontSize: 16, color: Colors.text, textAlign: 'center' }}>
            {t('cmp.CostEstimate.errorTitle')}
          </Txt>
          <Txt style={{ fontSize: 13, color: Colors.textMuted, textAlign: 'center', maxWidth: 280 }}>
            {state.message}
          </Txt>
          <Button label={t('cmp.CostEstimate.retry')} onPress={fetchEstimate} variant="outline" />
        </View>
      )}

      {state.status === 'success' && (
        <EstimateResult data={state.data} onRefresh={fetchEstimate} />
      )}
    </View>
  );
}

function EstimateResult({
  data,
  onRefresh,
}: {
  data: SerializedProject;
  onRefresh: () => void;
}) {
  const { t } = useLanguage();
  const stage: SerializedStage | undefined = data.stages[0];
  const lines = stage?.lines ?? [];
  const resolved = lines.filter((l) => l.resolved);
  const unresolved = lines.filter((l) => !l.resolved);
  const consolidated = data.consolidated;

  // Rozbicie materiały + robocizna (kwoty z backendu w groszach; tu tylko wybór
  // pól z bezpiecznym fallbackiem, gdy backend nie policzył robocizny).
  const stageMaterialsGrosze = stage?.materialsTotalGrosze ?? stage?.stageTotalGrosze ?? 0;
  const stageLaborGrosze = stage?.laborTotalGrosze ?? 0;
  const stageTotalGrosze = stage?.stageTotalWithLaborGrosze ?? stageMaterialsGrosze + stageLaborGrosze;
  const projMaterialsGrosze = data.materialsTotalGrosze ?? data.projectTotalGrosze;
  const projLaborGrosze = data.laborTotalGrosze ?? 0;
  const projTotalGrosze = data.projectTotalWithLaborGrosze ?? projMaterialsGrosze + projLaborGrosze;
  const hasLabor = (stage?.labor?.lines.length ?? 0) > 0 || stageLaborGrosze > 0 || projLaborGrosze > 0;
  const laborUnestimated = stage?.labor?.unestimatedCount ?? 0;
  const consolidatedLines = consolidated?.lines ?? [];
  const savingsGrosze = consolidated?.savingsGrosze ?? 0;
  const storeComparison = data.storeComparison;

  if (lines.length === 0) {
    return <InfoState icon="package" text={t('cmp.CostEstimate.empty')} />;
  }

  return (
    <>
      {unresolved.length > 0 && (
        <View style={{ padding: 16, borderRadius: 16, backgroundColor: Colors.warningBg }} accessibilityRole="alert">
          <Txt style={{ fontSize: 14, lineHeight: 21, color: Colors.text }}>{t('upgrade.compare.partial', { count: unresolved.length })}</Txt>
        </View>
      )}
      {storeComparison && <WhereToBuySection cmp={storeComparison} unresolvedCount={unresolved.length} />}

      {/* Sumy: koszt etapu + koszt całego remontu */}
      <View
        style={{
          backgroundColor: Colors.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: Colors.border,
          overflow: 'hidden',
        }}
      >
        <SummaryLine
          label={t('cmp.CostEstimate.stageCost')}
          value={formatGrosze(stageTotalGrosze)}
          color={Colors.text}
        />
        {hasLabor && (
          <CostBreakdown
            materialsGrosze={stageMaterialsGrosze}
            laborGrosze={stageLaborGrosze}
            totalGrosze={stageTotalGrosze}
          />
        )}
        <View style={{ height: 1, backgroundColor: Colors.border }} />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 14,
            backgroundColor: Colors.primaryBg,
          }}
        >
          <Txt w="bold" style={{ fontSize: 15, color: Colors.primaryDark }}>
            {t('cmp.CostEstimate.projectCost')}
          </Txt>
          <Txt w="bold" style={{ fontSize: 20, color: Colors.primary }}>
            {formatGrosze(projTotalGrosze)}
          </Txt>
        </View>
        {hasLabor && (
          <View style={{ backgroundColor: Colors.primaryBg, paddingBottom: 4 }}>
            <CostBreakdown
              materialsGrosze={projMaterialsGrosze}
              laborGrosze={projLaborGrosze}
              totalGrosze={projTotalGrosze}
            />
          </View>
        )}
        {hasLabor && laborUnestimated > 0 && (
          <View style={{ paddingHorizontal: 14, paddingBottom: 12, backgroundColor: Colors.primaryBg }}>
            <Txt style={{ fontSize: 11, color: Colors.textMuted }}>
              {t('cmp.CostEstimate.laborUnestimated', { count: laborUnestimated })}
            </Txt>
          </View>
        )}
      </View>

      {/* „Kupując łącznie oszczędzasz X zł" — zysk z jednorazowego zaokrąglenia
          do opakowań na całym remoncie (liczy backend, tu tylko formatujemy). */}
      {savingsGrosze > 0 && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            padding: 12,
            borderRadius: 12,
            backgroundColor: Colors.successBg,
            borderWidth: 1,
            borderColor: Colors.success,
          }}
        >
          <Feather name="trending-down" size={18} color={Colors.success} />
          <Txt w="semibold" style={{ flex: 1, fontSize: 13, color: Colors.success }}>
            {t('cmp.CostEstimate.savings', { amount: formatGrosze(savingsGrosze) })}
          </Txt>
        </View>
      )}


      <Txt style={{ fontSize: 11, color: Colors.textMuted }}>
        {t('cmp.CostEstimate.disclaimer')}
      </Txt>

      {/* Skonsolidowana lista zakupowa całego remontu (kup raz, opak. łącznie) */}
      {consolidatedLines.length > 0 && (
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Feather name="shopping-cart" size={16} color={Colors.primary} />
            <Txt w="semibold" style={{ fontSize: 15, color: Colors.text }}>
              {t('cmp.CostEstimate.consolidatedTitle')} ({consolidatedLines.length})
            </Txt>
          </View>
          <Txt style={{ fontSize: 12, color: Colors.textMuted }}>
            {t('cmp.CostEstimate.consolidatedHint')}
          </Txt>
          {consolidatedLines.map((line, idx) => (
            <ConsolidatedLineCard key={`c-${line.product.id}-${idx}`} line={line} />
          ))}
        </View>
      )}

      {/* Materiały z najtańszą ofertą */}
      {resolved.length > 0 && (
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Feather name="package" size={16} color={Colors.primary} />
            <Txt w="semibold" style={{ fontSize: 15, color: Colors.text }}>
              {t('cmp.CostEstimate.materialsTitle')} ({resolved.length})
            </Txt>
          </View>
          {resolved.map((line, idx) => (
            <ResolvedLineCard key={`${line.product?.id ?? 'r'}-${idx}`} line={line} />
          ))}
        </View>
      )}

      {/* Nierozpoznane — pokazane osobno, NIE wliczone do sumy */}
      {unresolved.length > 0 && (
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Feather name="help-circle" size={16} color={Colors.warning} />
            <Txt w="semibold" style={{ fontSize: 15, color: Colors.warning }}>
              {t('cmp.CostEstimate.unresolvedTitle', { count: unresolved.length })}
            </Txt>
          </View>
          <Txt style={{ fontSize: 12, color: Colors.textMuted }}>
            {t('cmp.CostEstimate.unresolvedHint')}
          </Txt>
          {unresolved.map((line, idx) => (
            <UnresolvedLineCard key={`u-${idx}`} line={line} />
          ))}
        </View>
      )}

      <Button
        label={t('cmp.CostEstimate.refresh')}
        onPress={onRefresh}
        variant="outline"
        fullWidth
      />
    </>
  );
}

function ResolvedLineCard({ line }: { line: SerializedLine }) {
  const { t } = useLanguage();
  const offer = line.cheapestOffer;
  const product = line.product;
  return (
    <View
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 12,
        gap: 6,
      }}
    >
      <ProductImage uri={getProductPhoto(product ?? {})} name={product?.name ?? ""} size={64} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        <Txt w="semibold" style={{ flex: 1, fontSize: 14, color: Colors.text }}>
          {product?.name ?? line.query.normalizedName ?? '—'}
        </Txt>
        <Txt w="bold" style={{ fontSize: 14, color: Colors.text }}>
          {formatGrosze(line.lineCostGrosze)}
        </Txt>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {offer && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Feather name="shopping-bag" size={12} color={Colors.textMuted} />
            <Txt style={{ fontSize: 12, color: Colors.textSecondary }}>{offer.store}</Txt>
          </View>
        )}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 6,
            paddingVertical: 2,
            backgroundColor: Colors.successBg,
            borderRadius: 6,
          }}
        >
          <Feather name="award" size={11} color={Colors.success} />
          <Txt w="medium" style={{ fontSize: 11, color: Colors.success }}>
            {t('cmp.CostEstimate.cheapest')}
          </Txt>
        </View>
      </View>
      <Txt style={{ fontSize: 11, color: Colors.textMuted }}>
        {t('cmp.CostEstimate.lineDetail', {
          qty: formatQuantity(line.quantity),
          unit: line.unit ?? '',
          unitPrice: offer ? formatGrosze(offer.unitPriceGrosze) : '—',
          packages: line.packagesNeeded ?? 0,
        })}
      </Txt>
      {line.packages && line.packages.length > 1 && (
        <PackageBreakdown
          packages={line.packages}
          unit={line.unit}
          totalGrosze={line.packagesTotalGrosze ?? line.lineCostGrosze}
          savingsGrosze={line.packagesSavingsGrosze ?? 0}
        />
      )}
      {product?.id && (
        <PriceHistoryPanel
          productId={product.id}
          ean={product.ean}
          gtin={product.gtin}
        />
      )}
      {line.offers && line.offers.length > 1 && (
        <OfferComparisonList offers={line.offers} />
      )}
    </View>
  );
}

/**
 * Rozbicie pozycji na konkretne opakowania (optymalny dobór wielkości):
 * „2× 10 l + 1× 5 l = 219,90 zł". Pokazywane tylko gdy materiał ma kilka wielkości
 * opakowań (kombinacja tańsza niż jeden rozmiar × sufit). Nic nie liczy — kwoty
 * (grosze) i sztuki pochodzą z backendu, tu tylko formatowanie na PLN i sklejenie
 * napisu. Gdy jest oszczędność vs wycena naiwna — pokazuje ją badge'em.
 */
function PackageBreakdown({
  packages,
  unit,
  totalGrosze,
  savingsGrosze,
}: {
  packages: SerializedPackage[];
  unit: string | null;
  totalGrosze: number;
  savingsGrosze: number;
}) {
  const { t } = useLanguage();
  const combo = packages
    .map((p) => `${p.count}× ${formatQuantity(p.packageSize)} ${unit ?? ''}`.trim())
    .join(' + ');

  return (
    <View
      style={{
        gap: 4,
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <Feather name="box" size={12} color={Colors.primary} />
        <Txt w="medium" style={{ flex: 1, fontSize: 12, color: Colors.text }}>
          {t('cmp.CostEstimate.packageBreakdown', {
            combo,
            total: formatGrosze(totalGrosze),
          })}
        </Txt>
      </View>
      {savingsGrosze > 0 && (
        <View style={{ flexDirection: 'row' }}>
          <Badge
            icon="trending-down"
            text={t('cmp.CostEstimate.packageSaving', { amount: formatGrosze(savingsGrosze) })}
            color={Colors.success}
            bg={Colors.successBg}
          />
        </View>
      )}
    </View>
  );
}

/**
 * Rozwijalne porównanie WSZYSTKICH ofert danego produktu (Sklep A/B/C + najtańszy).
 * Oferty przychodzą z backendu POSORTOWANE od najtańszej (pierwsza z ceną = najtańsza),
 * więc UI NIC nie liczy ani nie sortuje: formatuje grosze na PLN, oznacza najtańszą
 * badge'em, pokazuje cenę regularną (przekreśloną) tylko gdy realnie wyższa od
 * aktualnej, cenę za jednostkę, dostępność i link do produktu. Zwinięte domyślnie.
 */
function OfferComparisonList({ offers }: { offers: SerializedProductOffer[] }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  // Najtańsza = pierwsza oferta z ceną (backend sortuje rosnąco, null-ceny na końcu).
  const cheapestOfferId = offers.find((o) => o.priceGrosze !== null)?.offerId;

  return (
    <View style={{ gap: 6 }}>
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 2 }}
        accessibilityRole="button"
      >
        <Feather
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={Colors.primary}
        />
        <Txt w="medium" style={{ fontSize: 12, color: Colors.primary }}>
          {expanded
            ? t('cmp.CostEstimate.hideOffers')
            : t('cmp.CostEstimate.compareOffers', { count: offers.length })}
        </Txt>
      </Pressable>

      {expanded && (
        <View
          style={{
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          {offers.map((offer, idx) => (
            <OfferRow
              key={offer.offerId}
              offer={offer}
              isCheapest={offer.offerId === cheapestOfferId}
              isFirst={idx === 0}
            />
          ))}
        </View>
      )}
    </View>
  );
}

/** Jeden wiersz oferty: sklep + badge „najtańsza", cena aktualna/regularna, zł/jedn., dostępność, link. */
function OfferRow({
  offer,
  isCheapest,
  isFirst,
}: {
  offer: SerializedProductOffer;
  isCheapest: boolean;
  isFirst: boolean;
}) {
  const { t } = useLanguage();
  const hasPromo =
    offer.regularPriceGrosze !== null &&
    offer.priceGrosze !== null &&
    offer.regularPriceGrosze > offer.priceGrosze;

  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 8,
        gap: 4,
        borderTopWidth: isFirst ? 0 : 1,
        borderTopColor: Colors.border,
        backgroundColor: isCheapest ? Colors.successBg : Colors.surface,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, flexWrap: 'wrap' }}>
          <Feather name="shopping-bag" size={12} color={Colors.textMuted} />
          <Txt w="medium" style={{ fontSize: 13, color: Colors.text }}>
            {offer.store}
          </Txt>
          {isCheapest && (
            <Badge
              icon="award"
              text={t('cmp.CostEstimate.cheapest')}
              color={Colors.success}
              bg={Colors.surface}
            />
          )}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {hasPromo && (
            <Txt
              style={{
                fontSize: 12,
                color: Colors.textMuted,
                textDecorationLine: 'line-through',
              }}
            >
              {formatGrosze(offer.regularPriceGrosze)}
            </Txt>
          )}
          <Txt w="bold" style={{ fontSize: 14, color: hasPromo ? Colors.danger : Colors.text }}>
            {offer.priceGrosze !== null ? formatGrosze(offer.priceGrosze) : '—'}
          </Txt>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {offer.pricePerUnitGrosze !== null && (
          <Txt style={{ fontSize: 11, color: Colors.textSecondary }}>
            {t('cmp.CostEstimate.perUnit', {
              price: formatGrosze(offer.pricePerUnitGrosze),
              unit: offer.unit ?? '',
            })}
          </Txt>
        )}
        {offer.availability && (
          <Txt style={{ fontSize: 11, color: Colors.textMuted }}>
            {availabilityLabel(offer.availability, t)}
          </Txt>
        )}
        {offer.url && (
          <Pressable
            onPress={() => {
              if (offer.url) void Linking.openURL(offer.url).catch(() => {});
            }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}
            accessibilityRole="link"
          >
            <Feather name="external-link" size={11} color={Colors.primary} />
            <Txt w="medium" style={{ fontSize: 11, color: Colors.primary }}>
              {t('cmp.CostEstimate.openProduct')}
            </Txt>
          </Pressable>
        )}
      </View>

      {offer.fetchedAt && (
        <Txt style={{ fontSize: 10, color: Colors.textMuted }}>
          {t('cmp.CostEstimate.offerFreshness', {
            date: formatHistoryDate(offer.fetchedAt),
            source: offer.source ?? offer.store,
          })}
        </Txt>
      )}
    </View>
  );
}

/** Mapuje surową dostępność ze sklepu na etykietę; nieznane wartości pokazuje 1:1. */
function availabilityLabel(
  raw: string,
  t: (key: any, params?: Record<string, string | number>) => string,
): string {
  const key = raw.trim().toLowerCase();
  if (key === 'in_stock' || key === 'instock') return t('cmp.CostEstimate.availability.in_stock');
  if (key === 'out_of_stock' || key === 'outofstock')
    return t('cmp.CostEstimate.availability.out_of_stock');
  return raw;
}

/**
 * Sekcja „Gdzie kupić": porównanie sklepów dla całego remontu. Pokazuje najtańszy
 * pojedynczy sklep na całość (albo notę, gdy żaden nie ma kompletu), koszt całości
 * w każdym sklepie z pokryciem, koszyk optymalny (najtaniej per produkt) z
 * rozbiciem po sklepach oraz baner „w jednym sklepie: +X". Nic nie liczy — kwoty
 * (grosze) pochodzą z backendu, tu tylko formatowanie na PLN.
 */
function WhereToBuySection({ cmp, unresolvedCount }: { cmp: SerializedStoreComparison; unresolvedCount: number }) {
  const { t } = useLanguage();
  if (cmp.productCount === 0 || cmp.stores.length === 0) return null;

  const full = unresolvedCount === 0 ? cmp.cheapestFullStore : null;
  const extra = cmp.singleStoreExtraGrosze;

  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Feather name="map-pin" size={16} color={Colors.primary} />
        <Txt w="semibold" style={{ fontSize: 15, color: Colors.text }}>
          {t('cmp.CostEstimate.whereToBuyTitle')}
        </Txt>
      </View>
      <Txt style={{ fontSize: 12, color: Colors.textMuted }}>
        {t('upgrade.compare.scope')}
      </Txt>

      {/* Najtańszy sklep na całość (pełne pokrycie) albo nota, gdy brak kompletu */}
      {full ? (
        <View
          style={{
            backgroundColor: Colors.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.border,
            padding: 12,
            gap: 4,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Txt style={{ fontSize: 12, color: Colors.textSecondary }}>
                {t('upgrade.compare.oneStore')}
              </Txt>
              <Txt w="bold" style={{ fontSize: 15, color: Colors.text }}>
                {full.store}
              </Txt>
            </View>
            <Txt w="bold" style={{ fontSize: 18, color: Colors.primary }}>
              {formatGrosze(full.totalGrosze)}
            </Txt>
          </View>
        </View>
      ) : (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            padding: 12,
            borderRadius: 12,
            backgroundColor: Colors.warningBg,
            borderWidth: 1,
            borderColor: '#FDE68A',
          }}
        >
          <Feather name="info" size={16} color={Colors.warning} />
          <Txt style={{ flex: 1, fontSize: 12, color: Colors.text }}>
            {t('cmp.CostEstimate.noFullStore')}
          </Txt>
        </View>
      )}

      {/* Koszt całości w każdym sklepie (rosnąco) + pokrycie */}
      <View
        style={{
          backgroundColor: Colors.surface,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: Colors.border,
          overflow: 'hidden',
        }}
      >
        <View style={{ padding: 10, paddingBottom: 6 }}>
          <Txt w="medium" style={{ fontSize: 12, color: Colors.textSecondary }}>
            {t('cmp.CostEstimate.allStoresLabel')}
          </Txt>
        </View>
        {[...cmp.stores].sort((a, b) => a.missingCount - b.missingCount || a.totalGrosze - b.totalGrosze).map((s) => (
          <StoreBasketRow key={s.store} basket={s} productCount={cmp.productCount + unresolvedCount} />
        ))}
      </View>

      {/* Koszyk optymalny (najtaniej per produkt) + rozbicie po sklepach */}
      <View
        style={{
          backgroundColor: Colors.primaryBg,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: Colors.border,
          padding: 12,
          gap: 4,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <Txt w="semibold" style={{ flex: 1, fontSize: 13, color: Colors.primaryDark }}>
            {t('upgrade.compare.manyStores')}
          </Txt>
          <Txt w="bold" style={{ fontSize: 16, color: Colors.primary }}>
            {formatGrosze(cmp.optimalBasketGrosze)}
          </Txt>
        </View>
        <Txt style={{ fontSize: 11, color: Colors.textMuted }}>
          {t('cmp.CostEstimate.optimalBasketHint')}
        </Txt>
        {cmp.optimalByStore.map((s) => (
          <Txt key={s.store} style={{ fontSize: 12, color: Colors.textSecondary }}>
            {t('cmp.CostEstimate.optimalStoreLine', {
              store: s.store,
              amount: formatGrosze(s.totalGrosze),
              count: s.itemCount,
            })}
          </Txt>
        ))}
      </View>

      {/* Baner: ile więcej kosztuje kupno wszystkiego w jednym sklepie */}
      {full && extra !== null && extra > 0 && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            padding: 12,
            borderRadius: 12,
            backgroundColor: Colors.surfaceAlt,
            borderWidth: 1,
            borderColor: Colors.border,
          }}
        >
          <Feather name="trending-up" size={18} color={Colors.textSecondary} />
          <Txt w="semibold" style={{ flex: 1, fontSize: 13, color: Colors.text }}>
            {t('upgrade.compare.saving', { amount: formatGrosze(extra) })}
          </Txt>
        </View>
      )}
      {full && extra !== null && extra <= 0 && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            padding: 12,
            borderRadius: 12,
            backgroundColor: Colors.successBg,
            borderWidth: 1,
            borderColor: Colors.success,
          }}
        >
          <Feather name="check-circle" size={18} color={Colors.success} />
          <Txt w="semibold" style={{ flex: 1, fontSize: 13, color: Colors.success }}>
            {t('cmp.CostEstimate.singleStoreNoExtra', { store: full.store })}
          </Txt>
        </View>
      )}
    </View>
  );
}

/** Wiersz „koszt całości w jednym sklepie": nazwa + kwota + pokrycie (pokrywa X/Y). */
function StoreBasketRow({
  basket,
  productCount,
}: {
  basket: SerializedStoreBasket;
  productCount: number;
}) {
  const { t } = useLanguage();
  const full = basket.coveredCount === productCount;
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Txt w="medium" style={{ fontSize: 13, color: Colors.text }}>
          {basket.store}
        </Txt>
        <Txt
          style={{
            fontSize: 11,
            color: full ? Colors.textMuted : Colors.warning,
          }}
        >
          {t('cmp.CostEstimate.storeCoverage', {
            covered: basket.coveredCount,
            total: productCount,
          })}
        </Txt>
      </View>
      <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>
        {formatGrosze(basket.totalGrosze)}
      </Txt>
    </View>
  );
}

/**
 * Karta skonsolidowanej pozycji zakupowej: produkt zebrany ze wszystkich etapów.
 * Pokazuje łączną ilość natywną, liczbę opakowań (policzoną RAZ na sumie), sklep,
 * koszt skonsolidowany oraz — gdy dodatnia — oszczędność vs suma per-etap. Nic nie
 * liczy: kwoty (grosze) i ilości pochodzą z backendu, tu tylko formatowanie.
 */
function ConsolidatedLineCard({ line }: { line: SerializedConsolidatedLine }) {
  const { t } = useLanguage();
  const offer = line.cheapestOffer;
  return (
    <View
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 12,
        gap: 6,
      }}
    >
      <ProductImage uri={getProductPhoto(line.product ?? {})} name={line.product?.name ?? ""} size={64} />
      {line.packages && <PackageBreakdown packages={line.packages} unit={line.unit} totalGrosze={line.lineCostGrosze} savingsGrosze={line.savingsGrosze} />}
      {line.packages?.map((entry, index) => entry.url?.startsWith('https://') ? (
        <Pressable key={`${entry.store}-${index}`} onPress={() => { void Linking.openURL(entry.url!).catch(() => {}); }} accessibilityRole="link" style={{ minHeight: 44, justifyContent: 'center', paddingVertical: 10 }}>
          <Txt w="semibold" style={{ fontSize: 14, color: Colors.primaryDark }}>{entry.store} · {t('upgrade.compare.open')}</Txt>
        </Pressable>
      ) : null)}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        <Txt w="semibold" style={{ flex: 1, fontSize: 14, color: Colors.text }}>
          {line.product.name}
        </Txt>
        <Txt w="bold" style={{ fontSize: 14, color: Colors.text }}>
          {formatGrosze(line.lineCostGrosze)}
        </Txt>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {offer && !line.packages && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Feather name="shopping-bag" size={12} color={Colors.textMuted} />
            <Txt style={{ fontSize: 12, color: Colors.textSecondary }}>{offer.store}</Txt>
          </View>
        )}
        {line.savingsGrosze > 0 && (
          <Badge
            icon="trending-down"
            text={t('cmp.CostEstimate.savedBadge', { amount: formatGrosze(line.savingsGrosze) })}
            color={Colors.success}
            bg={Colors.successBg}
          />
        )}
      </View>
      {!line.packages && (
        <Txt style={{ fontSize: 11, color: Colors.textMuted }}>
          {t('cmp.CostEstimate.consolidatedLineDetail', {
            qty: formatQuantity(line.totalQuantity),
            unit: line.unit ?? '',
            packages: line.packagesNeeded,
            unitPrice: offer ? formatGrosze(offer.unitPriceGrosze) : '—',
          })}
        </Txt>
      )}
    </View>
  );
}

/**
 * Rozwijalny panel „Historia ceny" produktu (warstwa odczytu /pricing/history).
 * Zwinięty pokazuje szybkie badge'y (najniższa / ostatnia zmiana / „prawdziwa
 * promocja"); po tapnięciu rozwija: sparkline z punktów cenowych (rysowany
 * z danych, View-owe słupki — bez plików graficznych), podsumowanie
 * (najniższa/średnia/aktualna/zmiana%) oraz listę punktów cenowych z datą pobrania
 * (malejąco po dacie). Read-only: sam pobiera pełną historię (grosze) i tylko ją
 * formatuje — NIC nie liczy (statystyki i kwoty przychodzą z backendu). Brak
 * historii (404/null) => nic nie renderuje. Błędy sieci przełykamy po cichu, żeby
 * nie psuć głównej wyceny.
 */
function PriceHistoryPanel({
  productId,
  ean,
  gtin,
}: {
  productId: string;
  ean: string | null;
  gtin: string | null;
}) {
  const { t } = useLanguage();
  const [data, setData] = useState<PriceHistoryResponse | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetchPriceHistory({ productId, ean, gtin });
        // Demo history must not manufacture a promotion badge for a real offer.
        const hasUnverifiedHistory = res?.history.some(point => !point.source || /seed|fixture|mock|demo|reference/i.test(point.source));
        if (!cancelled) setData(hasUnverifiedHistory ? null : res);
      } catch {
        if (!cancelled) setData(null); // awaria historii nie blokuje wyceny
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId, ean, gtin]);

  if (!data || data.stats.count === 0) return null;

  const stats = data.stats;
  const hasChange = stats.changePct !== null && stats.changePct !== 0;
  const wentUp = (stats.changePct ?? 0) > 0;

  // Tylko punkty z ceną efektywną. API zwraca je chronologicznie (najstarsze
  // pierwsze) — tak też rysujemy sparkline (lewa→prawa = starsze→nowsze).
  const chronological = data.history.filter(
    (p): p is SerializedHistoryPoint & { effectiveGrosze: number } =>
      p.effectiveGrosze !== null,
  );
  // Lista malejąco po dacie (najnowsze najpierw) — wymóg zadania.
  const newestFirst = [...chronological].sort((a, b) =>
    a.fetchedAt < b.fetchedAt ? 1 : a.fetchedAt > b.fetchedAt ? -1 : 0,
  );

  return (
    <View style={{ gap: 6 }}>
      {/* Nagłówek: toggle + szybkie badge'y (widoczne również po zwinięciu). */}
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', paddingVertical: 2 }}
        accessibilityRole="button"
      >
        <Feather
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={Colors.primary}
        />
        <Txt w="medium" style={{ fontSize: 12, color: Colors.primary }}>
          {expanded
            ? t('cmp.CostEstimate.priceHistoryHide')
            : t('cmp.CostEstimate.priceHistory', { count: stats.count })}
        </Txt>
        {stats.isRealPromo && (
          <Badge
            icon="tag"
            text={t('cmp.CostEstimate.realPromo')}
            color={Colors.success}
            bg={Colors.successBg}
          />
        )}
        {stats.lowest !== null && (
          <Badge
            icon="trending-down"
            text={t('cmp.CostEstimate.lowest', { price: formatGrosze(stats.lowest) })}
            color={Colors.textSecondary}
            bg={Colors.surfaceAlt}
          />
        )}
        {hasChange && (
          <Badge
            icon={wentUp ? 'arrow-up-right' : 'arrow-down-right'}
            text={`${wentUp ? '+' : ''}${stats.changePct}%`}
            color={wentUp ? Colors.danger : Colors.success}
            bg={wentUp ? Colors.dangerBg : Colors.successBg}
          />
        )}
      </Pressable>

      {expanded && (
        <View
          style={{
            gap: 10,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
          }}
        >
          {/* Sparkline z punktów cenowych (>=2 punkty, żeby był sens rysować). */}
          {chronological.length > 1 && <PriceSparkline points={chronological} />}

          {/* Podsumowanie: najniższa / średnia / aktualna / zmiana% */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <StatCell label={t('cmp.CostEstimate.statLowest')} value={formatGrosze(stats.lowest)} />
            <StatCell label={t('cmp.CostEstimate.statAverage')} value={formatGrosze(stats.average)} />
            <StatCell label={t('cmp.CostEstimate.statCurrent')} value={formatGrosze(stats.current)} />
            <StatCell
              label={t('cmp.CostEstimate.statChange')}
              value={hasChange ? `${wentUp ? '+' : ''}${stats.changePct}%` : '—'}
              color={hasChange ? (wentUp ? Colors.danger : Colors.success) : Colors.text}
            />
          </View>

          {/* Lista punktów cenowych: data pobrania + kwota (malejąco po dacie). */}
          <View
            style={{
              borderWidth: 1,
              borderColor: Colors.border,
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            {newestFirst.map((point, idx) => (
              <PriceHistoryRow
                key={`${point.fetchedAt}-${point.store}-${idx}`}
                point={point}
                isFirst={idx === 0}
                isLowest={stats.lowest !== null && point.effectiveGrosze === stats.lowest}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

/**
 * Prosty sparkline słupkowy rysowany WYŁĄCZNIE z danych (View-owe słupki, bez
 * plików graficznych ani bibliotek wykresów). Wysokość słupka proporcjonalna do
 * ceny efektywnej punktu; ostatni słupek (najnowsza cena) wyróżniony. Nic nie
 * liczy poza skalowaniem pikseli do wysokości — kwoty pochodzą z backendu.
 */
function PriceSparkline({
  points,
}: {
  points: Array<SerializedHistoryPoint & { effectiveGrosze: number }>;
}) {
  const values = points.map((p) => p.effectiveGrosze);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const H = 44;
  const MIN_BAR = 4;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: H }}>
      {points.map((p, i) => {
        const h = range === 0 ? H : MIN_BAR + ((p.effectiveGrosze - min) / range) * (H - MIN_BAR);
        const isLast = i === points.length - 1;
        return (
          <View
            key={`${p.fetchedAt}-${i}`}
            style={{
              flex: 1,
              height: h,
              borderTopLeftRadius: 2,
              borderTopRightRadius: 2,
              backgroundColor: isLast ? Colors.primary : Colors.primaryBg,
            }}
          />
        );
      })}
    </View>
  );
}

/** Komórka podsumowania statystyki: etykieta u góry, wartość (grosze→PLN) pod nią. */
function StatCell({
  label,
  value,
  color = Colors.text,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View
      style={{
        flexGrow: 1,
        flexBasis: '46%',
        backgroundColor: Colors.surfaceAlt,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        gap: 2,
      }}
    >
      <Txt style={{ fontSize: 10, color: Colors.textMuted, textTransform: 'uppercase' }}>
        {label}
      </Txt>
      <Txt w="bold" style={{ fontSize: 14, color }}>
        {value}
      </Txt>
    </View>
  );
}

/** Jeden wiersz historii ceny: data pobrania + sklep, po prawej kwota efektywna. */
function PriceHistoryRow({
  point,
  isFirst,
  isLowest,
}: {
  point: SerializedHistoryPoint & { effectiveGrosze: number };
  isFirst: boolean;
  isLowest: boolean;
}) {
  const { t } = useLanguage();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderTopWidth: isFirst ? 0 : 1,
        borderTopColor: Colors.border,
        backgroundColor: isLowest ? Colors.successBg : Colors.surface,
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Txt w="medium" style={{ fontSize: 12, color: Colors.text }}>
          {formatHistoryDate(point.fetchedAt)}
        </Txt>
        <Txt style={{ fontSize: 11, color: Colors.textMuted }}>{point.store}</Txt>
      </View>
      {isLowest && (
        <Badge
          icon="trending-down"
          text={t('cmp.CostEstimate.statLowest')}
          color={Colors.success}
          bg={Colors.surface}
        />
      )}
      <Txt w="bold" style={{ fontSize: 13, color: Colors.text }}>
        {formatGrosze(point.effectiveGrosze)}
      </Txt>
    </View>
  );
}

/** Mała pigułka: ikona Feather + tekst, na tle. */
function Badge({
  icon,
  text,
  color,
  bg,
}: {
  icon: string;
  text: string;
  color: string;
  bg: string;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        backgroundColor: bg,
        borderRadius: 6,
      }}
    >
      <Feather name={icon as any} size={11} color={color} />
      <Txt w="medium" style={{ fontSize: 11, color }}>
        {text}
      </Txt>
    </View>
  );
}

function UnresolvedLineCard({ line }: { line: SerializedLine }) {
  const { t } = useLanguage();
  return (
    <View
      style={{
        backgroundColor: Colors.warningBg,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FDE68A',
        padding: 12,
        gap: 4,
      }}
    >
      <Txt w="medium" style={{ fontSize: 14, color: Colors.text }}>
        {line.query.normalizedName ?? line.query.ean ?? line.query.gtin ?? '—'}
      </Txt>
      <Txt style={{ fontSize: 12, color: Colors.textSecondary }}>
        {reasonLabel(line.reason, t)}
      </Txt>
    </View>
  );
}

/**
 * Rozbicie kosztu na „Materiały X · Robocizna Y · Razem Z". Nic nie liczy —
 * kwoty (grosze) pochodzą z backendu, tu tylko formatowanie na PLN i sklejenie
 * napisu (i18n PL/EN). Używane dla etapu i dla całego remontu.
 */
function CostBreakdown({
  materialsGrosze,
  laborGrosze,
  totalGrosze,
}: {
  materialsGrosze: number;
  laborGrosze: number;
  totalGrosze: number;
}) {
  const { t } = useLanguage();
  return (
    <View style={{ paddingHorizontal: 14, paddingBottom: 10, paddingTop: 2 }}>
      <Txt style={{ fontSize: 12, color: Colors.textSecondary }}>
        {t('cmp.CostEstimate.costBreakdown', {
          materials: formatGrosze(materialsGrosze),
          labor: formatGrosze(laborGrosze),
          total: formatGrosze(totalGrosze),
        })}
      </Txt>
    </View>
  );
}

function SummaryLine({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 14,
      }}
    >
      <Txt w="medium" style={{ fontSize: 14, color: Colors.textSecondary }}>
        {label}
      </Txt>
      <Txt w="semibold" style={{ fontSize: 16, color }}>
        {value}
      </Txt>
    </View>
  );
}

function InfoState({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 12, paddingVertical: 40 }}>
      <Feather name={icon as any} size={36} color={Colors.textMuted} />
      <Txt
        w="medium"
        style={{ fontSize: 14, color: Colors.textSecondary, textAlign: 'center', maxWidth: 280 }}
      >
        {text}
      </Txt>
    </View>
  );
}

/** Ilość: przycina zbędne zera (12.00 → 12, 2.50 → 2.5). Tylko prezentacja. */
function formatQuantity(qty: number): string {
  if (!isFinite(qty)) return '0';
  return Number.isInteger(qty) ? String(qty) : String(Number(qty.toFixed(2)));
}

/**
 * ISO 8601 → „DD.MM.YYYY" (format neutralny językowo, jednoznaczny w PL i EN).
 * Wejście nieparsowalne zwraca surowe (fail-safe, żeby nie wywalić listy).
 */
function formatHistoryDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${d.getFullYear()}`;
}

function reasonLabel(
  reason: UnresolvedReason | undefined,
  t: (key: any, params?: Record<string, string | number>) => string,
): string {
  switch (reason) {
    case 'not_found':
      return t('cmp.CostEstimate.reason.not_found');
    case 'no_offer':
      return t('cmp.CostEstimate.reason.no_offer');
    case 'no_price':
      return t('cmp.CostEstimate.reason.no_price');
    case 'empty_query':
      return t('cmp.CostEstimate.reason.empty_query');
    default:
      return t('cmp.CostEstimate.reason.not_found');
  }
}
