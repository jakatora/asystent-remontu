import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useLocalSearchParams, router, Stack, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { getJobById } from '@/data/jobs';
import type { ShoppingItem, ToolItem } from '@/types/domain';
import { formatCurrency } from '@/utils/calculator';
import { WarningBanner } from '@/components/ui/WarningBanner';
import { Button } from '@/components/ui/Button';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';

// ─── Tab type ─────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'materials' | 'tools' | 'guide' | 'shopping';

const TAB_LABELS: Record<Tab, string> = {
  overview: 'Przegląd',
  materials: 'Materiały',
  tools: 'Narzędzia',
  guide: 'Instrukcja',
  shopping: 'Zakupy',
};

const STATUS_COLORS = {
  planning:     { active: Colors.info,    bg: Colors.infoBg,     border: '#BFDBFE' },
  'in-progress': { active: Colors.warning, bg: Colors.warningBg,  border: '#FDE68A' },
  completed:    { active: Colors.success, bg: Colors.successBg,  border: '#BBF7D0' },
};

// ─── DIY assessment ───────────────────────────────────────────────────────────

function diyAssessment(difficulty: string, hirePro: boolean): {
  level: 'easy' | 'moderate' | 'hire';
  color: string;
  bg: string;
  icon: string;
  headline: string;
  details: string;
} {
  if (hirePro || difficulty === 'hard') {
    return {
      level: 'hire',
      color: Colors.danger,
      bg: Colors.dangerBg,
      icon: 'alert-triangle',
      headline: 'Zdecydowanie zatrudnij fachowca',
      details:
        'Ta praca wymaga specjalistycznej wiedzy i sprzętu. Błędy mogą być kosztowne lub niebezpieczne.',
    };
  }
  if (difficulty === 'medium') {
    return {
      level: 'moderate',
      color: Colors.warning,
      bg: Colors.warningBg,
      icon: 'alert-circle',
      headline: 'Możliwe samodzielnie, ale wymaga uwagi',
      details:
        'Możesz zrobić to sam, ale postępuj zgodnie z instrukcją krok po kroku. W razie wątpliwości skonsultuj się ze sprzedawcą w sklepie budowlanym.',
    };
  }
  return {
    level: 'easy',
    color: Colors.success,
    bg: Colors.successBg,
    icon: 'check-circle',
    headline: 'Świetnie nadaje się do samodzielnego wykonania',
    details: 'Ta praca jest dostępna dla amatorów. Wystarczy dokładność i postępowanie zgodnie z naszą instrukcją.',
  };
}

// ─── Tool card ────────────────────────────────────────────────────────────────

function ToolCard({ tool }: { tool: ToolItem }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 14,
        gap: 12,
      }}
    >
      {/* Icon */}
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          backgroundColor: tool.required ? Colors.primaryBg : Colors.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Feather
          name={(tool.icon as any) ?? 'tool'}
          size={18}
          color={tool.required ? Colors.primary : Colors.textSecondary}
        />
      </View>

      {/* Info */}
      <View style={{ flex: 1, gap: 3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>
            {tool.name}
          </Txt>
          {!tool.required && (
            <View
              style={{
                paddingHorizontal: 7,
                paddingVertical: 2,
                backgroundColor: Colors.surfaceAlt,
                borderRadius: 6,
              }}
            >
              <Txt style={{ fontSize: 11, color: Colors.textMuted }}>opcjonalne</Txt>
            </View>
          )}
          {tool.rentable && (
            <View
              style={{
                paddingHorizontal: 7,
                paddingVertical: 2,
                backgroundColor: Colors.infoBg,
                borderRadius: 6,
              }}
            >
              <Txt style={{ fontSize: 11, color: Colors.info }}>do wynajęcia</Txt>
            </View>
          )}
        </View>

        {tool.notes && (
          <Txt style={{ fontSize: 12, color: Colors.textSecondary, lineHeight: 17 }}>
            {tool.notes}
          </Txt>
        )}

        {/* Cost hints */}
        {(tool.estimatedBuyCostPLN || tool.estimatedRentCostPLN) ? (
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 2 }}>
            {tool.estimatedBuyCostPLN && (
              <Txt style={{ fontSize: 12, color: Colors.textMuted }}>
                Kup: ~{formatCurrency(tool.estimatedBuyCostPLN)}
              </Txt>
            )}
            {tool.estimatedRentCostPLN && (
              <Txt style={{ fontSize: 12, color: Colors.info }}>
                Wynajmij: ~{formatCurrency(tool.estimatedRentCostPLN)}
              </Txt>
            )}
          </View>
        ) : null}

        {tool.safetyNote && (
          <View
            style={{
              flexDirection: 'row',
              gap: 6,
              backgroundColor: Colors.warningBg,
              borderRadius: 8,
              padding: 8,
              alignItems: 'flex-start',
              marginTop: 4,
            }}
          >
            <Feather name="alert-triangle" size={12} color={Colors.warning} style={{ marginTop: 1 }} />
            <Txt style={{ flex: 1, fontSize: 11, color: '#92400e', lineHeight: 15 }}>
              {tool.safetyNote}
            </Txt>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProjectDetailScreen() {
  const { id, fromWizard } = useLocalSearchParams<{ id: string; fromWizard?: string }>();
  const insets = useSafeAreaInsets();
  const { projects, updateProject, removeProject, getProjectShoppingItems, generateAndAddShoppingItems, toggleItem } = useApp();

  const [tab, setTab]               = useState<Tab>('overview');
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);

  const project = projects.find((p) => p.id === id);
  const job     = project ? getJobById(project.jobId) : null;

  const loadShopping = useCallback(async () => {
    if (!id) return;
    const items = await getProjectShoppingItems(id);
    setShoppingItems(items);
  }, [id, getProjectShoppingItems]);

  useFocusEffect(useCallback(() => { loadShopping(); }, [loadShopping]));

  const handleGenerateShoppingList = async () => {
    if (!project?.calculationResult) return;
    await generateAndAddShoppingItems(project.id, project.calculationResult);
    await loadShopping();
    setTab('shopping');
  };

  const handleStatusChange = async (status: 'planning' | 'in-progress' | 'completed') => {
    if (!project) return;
    await updateProject({ ...project, status });
  };

  const handleDelete = () => {
    Alert.alert(
      'Usuń projekt',
      `Usunąć projekt "${project?.name}"? Tej operacji nie można cofnąć.`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => { await removeProject(id!); router.back(); },
        },
      ]
    );
  };

  if (!project || !job) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background, gap: 16 }}>
        <Txt w="medium" style={{ fontSize: 16, color: Colors.textSecondary }}>
          Projekt nie znaleziony
        </Txt>
        <Button label="Wróć" onPress={() => router.back()} variant="outline" />
      </View>
    );
  }

  const calc          = project.calculationResult;
  const bottomPad     = Platform.OS === 'web' ? 34 : insets.bottom + 16;
  const purchasedCount = shoppingItems.filter((i) => i.purchased).length;
  const isFirstTime   = fromWizard === '1' && !welcomeDismissed;

  // Tools from job
  const requiredTools  = job.tools.filter((t) => t.required);
  const optionalTools  = job.tools.filter((t) => !t.required);

  // DIY assessment
  const diy = diyAssessment(job.difficulty, job.hireProfessionalRecommended);

  // Pro cost estimate (rough: labour = 150–200% of material cost)
  const proLaborMultiplier = 1.8;
  const proEstimate = calc ? calc.totalCost * (1 + proLaborMultiplier) : null;

  const TABS: Tab[] = ['overview', 'materials', 'tools', 'guide', 'shopping'];

  return (
    <>
      <Stack.Screen
        options={{
          title: project.name,
          headerBackTitle: 'Wróć',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete} style={{ marginRight: 4 }}>
              <Feather name="trash-2" size={20} color={Colors.danger} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* ── Tab bar ──────────────────────────────────────────────────────────── */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: Colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        }}
      >
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: 'center',
              borderBottomWidth: 2,
              borderBottomColor: tab === t ? Colors.primary : 'transparent',
            }}
          >
            <Txt
              w={tab === t ? 'bold' : 'medium'}
              style={{
                fontSize: 11,
                color: tab === t ? Colors.primary : Colors.textMuted,
                textAlign: 'center',
              }}
            >
              {TAB_LABELS[t]}
            </Txt>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={{ padding: 20, paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >

        {/* ═══════════════════════════════════════════════════════════════════
            OVERVIEW TAB
        ═══════════════════════════════════════════════════════════════════ */}
        {tab === 'overview' && (
          <View style={{ gap: 16 }}>

            {/* First-time wizard welcome */}
            {isFirstTime && (
              <View
                style={{
                  backgroundColor: Colors.primaryBg,
                  borderRadius: 16,
                  borderWidth: 1.5,
                  borderColor: Colors.primary + '50',
                  padding: 16,
                  gap: 10,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: Colors.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Feather name="zap" size={20} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Txt w="bold" style={{ fontSize: 16, color: Colors.primary }}>
                      Twój projekt jest gotowy!
                    </Txt>
                    <Txt style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }}>
                      Obliczyliśmy materiały, koszt i czas realizacji.
                    </Txt>
                  </View>
                </View>
                <Txt style={{ fontSize: 13, color: Colors.text, lineHeight: 19 }}>
                  Przejrzyj zakładki powyżej: <Txt w="semibold">Materiały</Txt> — co kupić,{' '}
                  <Txt w="semibold">Narzędzia</Txt> — czym pracować,{' '}
                  <Txt w="semibold">Instrukcja</Txt> — jak to zrobić krok po kroku.
                </Txt>
                <TouchableOpacity
                  onPress={() => setWelcomeDismissed(true)}
                  style={{ alignSelf: 'flex-end' }}
                >
                  <Txt style={{ fontSize: 13, color: Colors.primary }}>Zamknij ✕</Txt>
                </TouchableOpacity>
              </View>
            )}

            {/* Project title */}
            <View>
              <Txt w="bold" style={{ fontSize: 22, color: Colors.text }}>{project.name}</Txt>
              <Txt style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 4 }}>
                {job.name}
              </Txt>
            </View>

            {/* Status buttons */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['planning', 'in-progress', 'completed'] as const).map((s) => {
                const labels = { planning: 'Planowanie', 'in-progress': 'W trakcie', completed: 'Ukończony' };
                const cfg = STATUS_COLORS[s];
                const isActive = project.status === s;
                return (
                  <TouchableOpacity
                    key={s}
                    onPress={() => handleStatusChange(s)}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 12,
                      alignItems: 'center',
                      borderWidth: 1.5,
                      borderColor: isActive ? cfg.active : Colors.border,
                      backgroundColor: isActive ? cfg.bg : Colors.surface,
                    }}
                  >
                    <Txt
                      w="semibold"
                      style={{ fontSize: 12, color: isActive ? cfg.active : Colors.textSecondary }}
                    >
                      {labels[s]}
                    </Txt>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Cost + time card */}
            {calc && (
              <View
                style={{
                  backgroundColor: Colors.surface,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  overflow: 'hidden',
                }}
              >
                {/* DIY cost row */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Feather name="tool" size={16} color={Colors.textSecondary} />
                    <Txt style={{ fontSize: 14, color: Colors.textSecondary }}>Materiały (samemu)</Txt>
                  </View>
                  <Txt w="bold" style={{ fontSize: 16, color: Colors.text }}>
                    {formatCurrency(calc.totalCost)}
                  </Txt>
                </View>

                {/* Pro estimate row */}
                {proEstimate && (
                  <>
                    <View style={{ height: 1, backgroundColor: Colors.border }} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Feather name="users" size={16} color={Colors.textSecondary} />
                        <Txt style={{ fontSize: 14, color: Colors.textSecondary }}>Z fachowcem (szacunek)</Txt>
                      </View>
                      <Txt w="semibold" style={{ fontSize: 14, color: Colors.textSecondary }}>
                        ~{formatCurrency(proEstimate)}
                      </Txt>
                    </View>
                  </>
                )}

                <View style={{ height: 1, backgroundColor: Colors.border }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Feather name="clock" size={16} color={Colors.textSecondary} />
                    <Txt style={{ fontSize: 14, color: Colors.textSecondary }}>Czas realizacji</Txt>
                  </View>
                  <Txt w="bold" style={{ fontSize: 16, color: Colors.text }}>
                    {calc.totalDays} {calc.totalDays === 1 ? 'dzień' : 'dni'}
                  </Txt>
                </View>

                {shoppingItems.length > 0 && (
                  <>
                    <View style={{ height: 1, backgroundColor: Colors.border }} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Feather name="shopping-cart" size={16} color={Colors.textSecondary} />
                        <Txt style={{ fontSize: 14, color: Colors.textSecondary }}>Zakupy</Txt>
                      </View>
                      <Txt w="bold" style={{ fontSize: 16, color: Colors.text }}>
                        {purchasedCount}/{shoppingItems.length} kupionych
                      </Txt>
                    </View>
                  </>
                )}
              </View>
            )}

            {/* Warnings */}
            {calc?.warnings && calc.warnings.length > 0 && (
              <WarningBanner warnings={calc.warnings} />
            )}

            {/* DIY Recommendation banner */}
            <View
              style={{
                backgroundColor: diy.bg,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: diy.color + '40',
                padding: 14,
                gap: 8,
                flexDirection: 'row',
                alignItems: 'flex-start',
              }}
            >
              <Feather name={diy.icon as any} size={20} color={diy.color} style={{ marginTop: 1 }} />
              <View style={{ flex: 1, gap: 4 }}>
                <Txt w="bold" style={{ fontSize: 14, color: diy.color }}>
                  {diy.headline}
                </Txt>
                <Txt style={{ fontSize: 13, color: Colors.text, lineHeight: 18 }}>
                  {diy.details}
                </Txt>
              </View>
            </View>

            {/* Hire pro CTA */}
            {job.hireProfessionalRecommended && (
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  backgroundColor: Colors.dangerBg,
                  borderRadius: 12,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: '#FECACA',
                }}
                onPress={() => router.push({ pathname: '/hire-pro', params: { jobId: job.id } })}
                activeOpacity={0.8}
              >
                <Feather name="phone" size={18} color={Colors.danger} />
                <Txt w="medium" style={{ flex: 1, fontSize: 14, color: Colors.danger }}>
                  Jak znaleźć dobrego fachowca?
                </Txt>
                <Feather name="chevron-right" size={16} color={Colors.danger} />
              </TouchableOpacity>
            )}

            {/* Quick actions */}
            <View style={{ gap: 10 }}>
              <Button
                label="Otwórz pełny opis pracy"
                variant="outline"
                onPress={() => router.push({ pathname: '/job/[id]', params: { id: job.id } })}
                fullWidth
              />
              {shoppingItems.length === 0 && calc && (
                <Button
                  label="Generuj listę zakupów"
                  onPress={handleGenerateShoppingList}
                  fullWidth
                  icon={<Feather name="shopping-cart" size={16} color="#fff" />}
                />
              )}
            </View>
          </View>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            MATERIALS TAB
        ═══════════════════════════════════════════════════════════════════ */}
        {tab === 'materials' && calc && (
          <View style={{ gap: 12 }}>
            <Txt w="bold" style={{ fontSize: 18, color: Colors.text, marginBottom: 4 }}>
              Lista materiałów
            </Txt>
            <Txt style={{ fontSize: 14, color: Colors.textSecondary }}>
              Ilości uwzględniają 10% zapasu na straty i docięcia.
            </Txt>

            {calc.materials.map((m, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: Colors.surface,
                  borderRadius: 12,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  gap: 10,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Txt w="medium" style={{ fontSize: 14, color: Colors.text }}>
                    {m.material.name}
                  </Txt>
                  {m.material.notes && (
                    <Txt style={{ fontSize: 11, color: Colors.textMuted, marginTop: 2 }}>
                      {m.material.notes}
                    </Txt>
                  )}
                </View>
                <View style={{ alignItems: 'center', minWidth: 52 }}>
                  <Txt w="bold" style={{ fontSize: 16, color: Colors.text }}>
                    {m.quantity.toFixed(m.quantity < 10 ? 1 : 0)}
                  </Txt>
                  <Txt style={{ fontSize: 11, color: Colors.textMuted }}>
                    {m.material.unit}
                  </Txt>
                </View>
                <Txt w="semibold" style={{ fontSize: 14, color: Colors.primary, minWidth: 70, textAlign: 'right' }}>
                  {formatCurrency(m.cost)}
                </Txt>
              </View>
            ))}

            {/* Total */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: Colors.primaryBg,
                borderRadius: 12,
                padding: 14,
                borderWidth: 1,
                borderColor: Colors.primaryLight,
              }}
            >
              <Txt w="semibold" style={{ fontSize: 15, color: Colors.primaryDark }}>
                Łączny koszt materiałów
              </Txt>
              <Txt w="bold" style={{ fontSize: 20, color: Colors.primary }}>
                {formatCurrency(calc.totalCost)}
              </Txt>
            </View>

            <Button
              label={shoppingItems.length > 0 ? 'Odśwież listę zakupów' : 'Generuj listę zakupów'}
              onPress={handleGenerateShoppingList}
              fullWidth
              icon={<Feather name="shopping-cart" size={16} color="#fff" />}
            />
          </View>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TOOLS TAB
        ═══════════════════════════════════════════════════════════════════ */}
        {tab === 'tools' && (
          <View style={{ gap: 16 }}>
            <View>
              <Txt w="bold" style={{ fontSize: 18, color: Colors.text }}>
                Potrzebne narzędzia
              </Txt>
              <Txt style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 4 }}>
                Upewnij się, że masz wszystkie obowiązkowe narzędzia przed rozpoczęciem.
              </Txt>
            </View>

            {/* DIY level reminder */}
            <View
              style={{
                backgroundColor: diy.bg,
                borderRadius: 12,
                padding: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Feather name={diy.icon as any} size={18} color={diy.color} />
              <Txt w="semibold" style={{ flex: 1, fontSize: 13, color: diy.color }}>
                {diy.headline}
              </Txt>
            </View>

            {/* Required tools */}
            {requiredTools.length > 0 && (
              <View style={{ gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: Colors.primary,
                    }}
                  />
                  <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>
                    Obowiązkowe ({requiredTools.length})
                  </Txt>
                </View>
                {requiredTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </View>
            )}

            {/* Optional tools */}
            {optionalTools.length > 0 && (
              <View style={{ gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: Colors.border,
                    }}
                  />
                  <Txt w="semibold" style={{ fontSize: 14, color: Colors.textSecondary }}>
                    Opcjonalne — ułatwiają pracę ({optionalTools.length})
                  </Txt>
                </View>
                {optionalTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </View>
            )}

            {job.tools.length === 0 && (
              <View
                style={{
                  alignItems: 'center',
                  paddingVertical: 32,
                  gap: 8,
                }}
              >
                <Feather name="tool" size={32} color={Colors.textMuted} />
                <Txt w="semibold" style={{ fontSize: 16, color: Colors.textSecondary }}>
                  Brak specjalnych narzędzi
                </Txt>
                <Txt style={{ fontSize: 14, color: Colors.textMuted, textAlign: 'center' }}>
                  Ta praca nie wymaga specjalistycznego sprzętu.
                </Txt>
              </View>
            )}

            {/* Rentable summary hint */}
            {job.tools.some((t) => t.rentable) && (
              <View
                style={{
                  backgroundColor: Colors.infoBg,
                  borderRadius: 12,
                  padding: 12,
                  flexDirection: 'row',
                  gap: 10,
                  alignItems: 'flex-start',
                }}
              >
                <Feather name="info" size={16} color={Colors.info} style={{ marginTop: 1 }} />
                <Txt style={{ flex: 1, fontSize: 13, color: '#1e40af', lineHeight: 18 }}>
                  Narzędzia oznaczone "do wynajęcia" możesz wypożyczyć w sklepach budowlanych
                  (np. Leroy Merlin, Castorama). Często taniej niż kupno.
                </Txt>
              </View>
            )}
          </View>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            GUIDE TAB
        ═══════════════════════════════════════════════════════════════════ */}
        {tab === 'guide' && (
          <View style={{ gap: 12 }}>
            <View>
              <Txt w="bold" style={{ fontSize: 18, color: Colors.text }}>
                Instrukcja krok po kroku
              </Txt>
              <Txt style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 4 }}>
                Wykonuj czynności w podanej kolejności.
              </Txt>
            </View>

            {job.instructions.map((step) => {
              const dur =
                step.durationMin >= 60
                  ? `${Math.round(step.durationMin / 60)}h`
                  : `${step.durationMin}min`;
              return (
                <View
                  key={step.step}
                  style={{
                    flexDirection: 'row',
                    gap: 14,
                    backgroundColor: Colors.surface,
                    borderRadius: 16,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: Colors.border,
                  }}
                >
                  {/* Step number */}
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: Colors.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Txt w="bold" style={{ fontSize: 14, color: '#fff' }}>{step.step}</Txt>
                  </View>

                  {/* Content */}
                  <View style={{ flex: 1, gap: 6 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <Txt w="bold" style={{ flex: 1, fontSize: 15, color: Colors.text }}>
                        {step.title}
                      </Txt>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                          backgroundColor: Colors.surfaceAlt,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 8,
                        }}
                      >
                        <Feather name="clock" size={11} color={Colors.textMuted} />
                        <Txt w="medium" style={{ fontSize: 11, color: Colors.textMuted }}>~{dur}</Txt>
                      </View>
                    </View>

                    <Txt style={{ fontSize: 14, color: Colors.textSecondary, lineHeight: 20 }}>
                      {step.description}
                    </Txt>

                    {step.tip && (
                      <View
                        style={{
                          flexDirection: 'row',
                          gap: 8,
                          backgroundColor: Colors.warningBg,
                          borderRadius: 10,
                          padding: 10,
                          alignItems: 'flex-start',
                        }}
                      >
                        <Feather name="zap" size={13} color={Colors.warning} style={{ marginTop: 1 }} />
                        <Txt style={{ flex: 1, fontSize: 13, lineHeight: 18, color: '#92400e' }}>
                          {step.tip}
                        </Txt>
                      </View>
                    )}

                    {step.warning && (
                      <View
                        style={{
                          flexDirection: 'row',
                          gap: 8,
                          backgroundColor: Colors.dangerBg,
                          borderRadius: 10,
                          padding: 10,
                          alignItems: 'flex-start',
                        }}
                      >
                        <Feather name="alert-triangle" size={13} color={Colors.danger} style={{ marginTop: 1 }} />
                        <Txt style={{ flex: 1, fontSize: 13, lineHeight: 18, color: '#991b1b' }}>
                          {step.warning}
                        </Txt>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            SHOPPING TAB
        ═══════════════════════════════════════════════════════════════════ */}
        {tab === 'shopping' && (
          <View style={{ gap: 12 }}>
            <Txt w="bold" style={{ fontSize: 18, color: Colors.text, marginBottom: 4 }}>
              Lista zakupów
            </Txt>

            {shoppingItems.length === 0 ? (
              <View style={{ alignItems: 'center', gap: 12, paddingVertical: 32 }}>
                <Feather name="shopping-cart" size={40} color={Colors.textMuted} />
                <Txt w="semibold" style={{ fontSize: 18, color: Colors.textSecondary }}>
                  Brak listy zakupów
                </Txt>
                <Txt style={{ fontSize: 14, color: Colors.textMuted, textAlign: 'center', maxWidth: 260 }}>
                  Wygeneruj listę zakupów na podstawie obliczonych materiałów.
                </Txt>
                <Button
                  label="Generuj listę zakupów"
                  onPress={handleGenerateShoppingList}
                  icon={<Feather name="shopping-cart" size={16} color="#fff" />}
                />
              </View>
            ) : (
              <>
                {/* Progress */}
                <View style={{ gap: 6 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Txt w="medium" style={{ fontSize: 13, color: Colors.textSecondary }}>
                      Kupione
                    </Txt>
                    <Txt w="semibold" style={{ fontSize: 13, color: Colors.text }}>
                      {purchasedCount} z {shoppingItems.length}
                    </Txt>
                  </View>
                  <View
                    style={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: Colors.border,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: Colors.primary,
                        width: `${(purchasedCount / shoppingItems.length) * 100}%`,
                      }}
                    />
                  </View>
                </View>

                {shoppingItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      backgroundColor: Colors.surface,
                      borderRadius: 12,
                      padding: 14,
                      borderWidth: 1,
                      borderColor: Colors.border,
                      opacity: item.purchased ? 0.6 : 1,
                    }}
                    onPress={async () => {
                      await toggleItem(item.id, !item.purchased);
                      loadShopping();
                    }}
                    activeOpacity={0.7}
                  >
                    <View
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 13,
                        borderWidth: 2,
                        borderColor: item.purchased ? Colors.success : Colors.border,
                        backgroundColor: item.purchased ? Colors.success : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {item.purchased && <Feather name="check" size={14} color="#fff" />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Txt
                        w="medium"
                        style={{
                          fontSize: 14,
                          color: item.purchased ? Colors.textMuted : Colors.text,
                          textDecorationLine: item.purchased ? 'line-through' : 'none',
                        }}
                      >
                        {item.name}
                      </Txt>
                      <Txt style={{ fontSize: 12, color: Colors.textMuted, marginTop: 2 }}>
                        {item.quantity.toFixed(1)} {item.unit}
                      </Txt>
                    </View>
                    <Txt
                      w="semibold"
                      style={{
                        fontSize: 14,
                        color: item.purchased ? Colors.textMuted : Colors.primary,
                      }}
                    >
                      ~{formatCurrency(item.estimatedPrice)}
                    </Txt>
                  </TouchableOpacity>
                ))}

                {/* Total */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: Colors.border,
                    marginTop: 4,
                  }}
                >
                  <Txt w="semibold" style={{ fontSize: 15, color: Colors.text }}>Suma</Txt>
                  <Txt w="bold" style={{ fontSize: 18, color: Colors.primary }}>
                    {formatCurrency(shoppingItems.reduce((s, i) => s + i.estimatedPrice, 0))}
                  </Txt>
                </View>

                <Button
                  label="Odśwież listę zakupów"
                  variant="outline"
                  onPress={handleGenerateShoppingList}
                  fullWidth
                />
              </>
            )}
          </View>
        )}

      </ScrollView>
    </>
  );
}
