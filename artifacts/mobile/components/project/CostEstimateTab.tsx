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
import { View, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import type { CalculationResult } from '@/types/domain';
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
  type SerializedConsolidatedLine,
  type SerializedStoreComparison,
  type SerializedStoreBasket,
  type SerializedPriceStats,
  type UnresolvedReason,
} from '@/features/pricing';

interface CostEstimateTabProps {
  calc: CalculationResult | undefined;
}

type LoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: SerializedProject };

export function CostEstimateTab({ calc }: CostEstimateTabProps) {
  const { t } = useLanguage();
  const [state, setState] = useState<LoadState>({ status: 'idle' });

  const fetchEstimate = useCallback(async () => {
    if (!calc) return;
    setState({ status: 'loading' });
    try {
      const stage = toPricingStageInput(calc);
      // Projekt = ten jeden etap: odpowiedź daje i rozbicie etapu, i sumę remontu.
      const data = await estimateProject([stage]);
      setState({ status: 'success', data });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? t('cmp.CostEstimate.errorHttp', { status: err.status })
          : t('cmp.CostEstimate.errorNetwork');
      setState({ status: 'error', message });
    }
  }, [calc, t]);

  useEffect(() => {
    if (calc && isPricingApiConfigured) void fetchEstimate();
  }, [calc, fetchEstimate]);

  if (!calc) {
    return <InfoState icon="dollar-sign" text={t('cmp.CostEstimate.noCalc')} />;
  }

  if (!isPricingApiConfigured) {
    return <InfoState icon="wifi-off" text={t('cmp.CostEstimate.notConfigured')} />;
  }

  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Feather name="tag" size={18} color={Colors.primary} />
        <Txt w="bold" style={{ fontSize: 18, color: Colors.text }}>
          {t('cmp.CostEstimate.title')}
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
  const consolidatedLines = consolidated?.lines ?? [];
  const savingsGrosze = consolidated?.savingsGrosze ?? 0;
  const storeComparison = data.storeComparison;

  if (lines.length === 0) {
    return <InfoState icon="package" text={t('cmp.CostEstimate.empty')} />;
  }

  return (
    <>
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
          value={formatGrosze(stage?.stageTotalGrosze ?? 0)}
          color={Colors.text}
        />
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
            {formatGrosze(data.projectTotalGrosze)}
          </Txt>
        </View>
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

      {/* „Gdzie kupić": najtańszy sklep na całość vs koszyk optymalny (rozbity) */}
      {storeComparison && <WhereToBuySection cmp={storeComparison} />}

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
      {product?.id && (
        <PriceHistoryIndicator
          productId={product.id}
          ean={product.ean}
          gtin={product.gtin}
        />
      )}
    </View>
  );
}

/**
 * Sekcja „Gdzie kupić": porównanie sklepów dla całego remontu. Pokazuje najtańszy
 * pojedynczy sklep na całość (albo notę, gdy żaden nie ma kompletu), koszt całości
 * w każdym sklepie z pokryciem, koszyk optymalny (najtaniej per produkt) z
 * rozbiciem po sklepach oraz baner „w jednym sklepie: +X". Nic nie liczy — kwoty
 * (grosze) pochodzą z backendu, tu tylko formatowanie na PLN.
 */
function WhereToBuySection({ cmp }: { cmp: SerializedStoreComparison }) {
  const { t } = useLanguage();
  if (cmp.productCount === 0 || cmp.stores.length === 0) return null;

  const full = cmp.cheapestFullStore;
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
        {t('cmp.CostEstimate.whereToBuyHint')}
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
                {t('cmp.CostEstimate.cheapestStoreLabel')}
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
        {cmp.stores.map((s) => (
          <StoreBasketRow key={s.store} basket={s} productCount={cmp.productCount} />
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
            {t('cmp.CostEstimate.optimalBasketLabel')}
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
            {t('cmp.CostEstimate.singleStoreExtra', {
              store: full.store,
              amount: formatGrosze(extra),
            })}
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
  const full = basket.missingCount === 0;
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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        <Txt w="semibold" style={{ flex: 1, fontSize: 14, color: Colors.text }}>
          {line.product.name}
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
        {line.savingsGrosze > 0 && (
          <Badge
            icon="trending-down"
            text={t('cmp.CostEstimate.savedBadge', { amount: formatGrosze(line.savingsGrosze) })}
            color={Colors.success}
            bg={Colors.successBg}
          />
        )}
      </View>
      <Txt style={{ fontSize: 11, color: Colors.textMuted }}>
        {t('cmp.CostEstimate.consolidatedLineDetail', {
          qty: formatQuantity(line.totalQuantity),
          unit: line.unit ?? '',
          packages: line.packagesNeeded,
          unitPrice: offer ? formatGrosze(offer.unitPriceGrosze) : '—',
        })}
      </Txt>
    </View>
  );
}

/**
 * Mały wskaźnik nad historią cen produktu (warstwa odczytu /pricing/history):
 * badge „najniższa X", strzałka ostatniej zmiany ceny oraz znacznik „prawdziwa
 * promocja". Read-only: sam pobiera statystyki (grosze) i tylko je formatuje —
 * nic nie liczy. Brak historii (404/null) => nic nie renderuje. Błędy sieci
 * przełykamy po cichu, żeby nie psuć głównej wyceny.
 */
function PriceHistoryIndicator({
  productId,
  ean,
  gtin,
}: {
  productId: string;
  ean: string | null;
  gtin: string | null;
}) {
  const { t } = useLanguage();
  const [stats, setStats] = useState<SerializedPriceStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchPriceHistory({ productId, ean, gtin });
        if (!cancelled) setStats(data?.stats ?? null);
      } catch {
        if (!cancelled) setStats(null); // awaria historii nie blokuje wyceny
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId, ean, gtin]);

  if (!stats || stats.count === 0) return null;

  const hasChange = stats.changePct !== null && stats.changePct !== 0;
  const wentUp = (stats.changePct ?? 0) > 0;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
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
