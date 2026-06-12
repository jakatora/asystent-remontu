import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { CATEGORIES } from '@/data/categories';
import { ProjectCard } from '@/components/ProjectCard';
import { CategoryCard } from '@/components/CategoryCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Txt } from '@/components/ui/Txt';
import type { ProjectActivity } from '@/types/domain';
import { Colors } from '@/constants/colors';
import { ACTIVITY_ICONS, timeAgoShort } from '@/utils/format';
import { useLanguage } from '@/context/LanguageContext';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { projects, getRecentActivities } = useApp();
  const { t } = useLanguage();
  const [recentActivities, setRecentActivities] = useState<ProjectActivity[]>([]);

  useFocusEffect(
    useCallback(() => {
      getRecentActivities(8).then(setRecentActivities);
    }, [getRecentActivities])
  );

  const recentProjects = projects.slice(0, 3);
  const activeCount = projects.filter((p) => p.status === 'in-progress').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;
  const activeProject = projects.find((p) => p.status === 'in-progress');

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.background }}
      contentContainerStyle={{ paddingTop: topPad + 12, paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 }}>
        <View style={{ flex: 1 }}>
          <Txt w="bold" style={{ fontSize: 24, color: Colors.text }}>Remont Asystent</Txt>
          <Txt style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }}>{t('home.subtitle')}</Txt>
        </View>
        <TouchableOpacity
          style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', ...shadowPrimary }}
          onPress={() => router.push('/wizard')}
          activeOpacity={0.8}
          testID="new-project-btn"
          accessibilityLabel={t('home.newProjectA11y')}
          accessibilityRole="button"
        >
          <Feather name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ── Continue active project (priority) ─────────────────────────────── */}
      {activeProject && (
        <TouchableOpacity
          style={{
            marginHorizontal: 20,
            marginBottom: 16,
            backgroundColor: Colors.warningBg,
            borderRadius: 16,
            padding: 14,
            borderWidth: 1,
            borderColor: '#FDE68A',
            flexDirection: 'row',
            alignItems: 'center',
          }}
          onPress={() => router.push({ pathname: '/project/[id]', params: { id: activeProject.id } })}
          activeOpacity={0.85}
          accessibilityLabel={t('home.continue.a11y', { name: activeProject.name })}
        >
          <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.warning, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <Feather name="play" size={16} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Txt w="bold" style={{ fontSize: 14, color: '#92400E' }}>
              {t('home.continue.label', { name: activeProject.name })}
            </Txt>
            <Txt style={{ fontSize: 12, color: '#B45309' }}>
              {activeProject.jobName}
              {activeProject.roomName ? ` · ${activeProject.roomName}` : ''}
            </Txt>
          </View>
          <Feather name="chevron-right" size={18} color={Colors.warning} />
        </TouchableOpacity>
      )}

      {/* ── HERO: Browse renovations (PRIMARY CONTENT) ─────────────────────── */}
      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
        <Txt w="bold" style={{ fontSize: 18, color: Colors.text }}>{t('home.hero.title')}</Txt>
        <Txt style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4, lineHeight: 19 }}>
          {t('home.hero.subtitle')}
        </Txt>
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onPress={() => router.push({ pathname: '/category/[id]', params: { id: cat.id } })}
            />
          ))}
        </View>
      </View>

      {/* ── Stats badges (compact) ─────────────────────────────────────────── */}
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 18 }}>
        <StatBadge value={projects.length} label={t('home.stat.projects')} color={Colors.text} borderColor={Colors.border} />
        <StatBadge value={activeCount} label={t('home.stat.inProgress')} color={Colors.primary} borderColor={Colors.primaryLight} />
        <StatBadge value={completedCount} label={t('home.stat.completed')} color={Colors.success} borderColor="#BBF7D0" />
      </View>

      {/* ── Quick-start wizard (secondary CTA) ─────────────────────────────── */}
      <TouchableOpacity
        style={{
          marginHorizontal: 20,
          marginBottom: 18,
          backgroundColor: Colors.primaryBg,
          borderRadius: 16,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: Colors.primaryLight,
        }}
        onPress={() => router.push('/wizard')}
        activeOpacity={0.85}
        testID="quick-start-banner"
        accessibilityLabel={t('home.quickStart.a11y')}
      >
        <View style={{ flex: 1 }}>
          <Txt w="bold" style={{ fontSize: 15, color: Colors.primaryDark }}>{t('home.quickStart.title')}</Txt>
          <Txt style={{ fontSize: 12, color: Colors.primary, marginTop: 2 }}>{t('home.quickStart.subtitle')}</Txt>
        </View>
        <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="arrow-right" size={20} color={Colors.primary} />
        </View>
      </TouchableOpacity>

      {/* ── House build banner ─────────────────────────────────────────────── */}
      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <TouchableOpacity
          style={{ backgroundColor: '#EFF6FF', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#BFDBFE' }}
          onPress={() => router.push('/house-build')}
          activeOpacity={0.85}
          testID="house-build-banner"
          accessibilityLabel={t('home.houseBuild.a11y')}
        >
          <View style={{ flex: 1 }}>
            <Txt w="bold" style={{ fontSize: 15, color: '#2563EB' }}>{t('home.houseBuild.title')}</Txt>
            <Txt style={{ fontSize: 12, color: '#3B82F6', marginTop: 2 }}>{t('home.houseBuild.subtitle')}</Txt>
          </View>
          <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="home" size={20} color="#2563EB" />
          </View>
        </TouchableOpacity>
      </View>

      {/* ── Your projects ──────────────────────────────────────────────────── */}
      {recentProjects.length > 0 && (
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <SectionHeader
            title={t('home.section.yourProjects')}
            actionLabel={projects.length > 3 ? t('home.yourProjects.all') : undefined}
            onAction={() => router.push('/(tabs)/projects')}
          />
          {recentProjects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onPress={() => router.push({ pathname: '/project/[id]', params: { id: p.id } })}
            />
          ))}
        </View>
      )}

      {/* ── Recent activity ────────────────────────────────────────────────── */}
      {recentActivities.length > 0 && (
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <SectionHeader title={t('home.section.recentActivity')} />
          <View style={{ backgroundColor: Colors.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 12, gap: 10 }}>
            {recentActivities.map((a) => {
              const proj = projects.find((p) => p.id === a.projectId);
              return (
                <TouchableOpacity
                  key={a.id}
                  onPress={() => proj && router.push({ pathname: '/project/[id]', params: { id: proj.id } })}
                  activeOpacity={0.8}
                  style={{ flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 2 }}
                  accessibilityLabel={
                    proj
                      ? t('home.activity.a11yWithProject', { description: a.description, project: proj.name })
                      : t('home.activity.a11y', { description: a.description })
                  }
                >
                  <Feather
                    name={(ACTIVITY_ICONS[a.actionType as keyof typeof ACTIVITY_ICONS] ?? 'circle') as any}
                    size={14}
                    color={Colors.textMuted}
                  />
                  <View style={{ flex: 1 }}>
                    <Txt style={{ fontSize: 13, color: Colors.text }} numberOfLines={1}>{a.description}</Txt>
                    {proj && <Txt style={{ fontSize: 11, color: Colors.textMuted }}>{proj.name}</Txt>}
                  </View>
                  <Txt style={{ fontSize: 11, color: Colors.textMuted }}>{timeAgoShort(a.createdAt)}</Txt>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* ── Contractor tiles (fast tools) ──────────────────────────────────── */}
      <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
        <SectionHeader title={t('home.section.fastTools')} />
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
          <ActionTile
            icon="search"
            label={t('home.action.findPro')}
            bg={Colors.primaryBg}
            fg={Colors.primary}
            onPress={() => router.push('/contractor')}
          />
          <ActionTile
            icon="file-text"
            label={t('home.action.myRequests')}
            bg={Colors.infoBg}
            fg={Colors.info}
            onPress={() => router.push('/contractor/my-requests')}
          />
          <ActionTile
            icon="user-plus"
            label={t('home.action.iAmPro')}
            bg={Colors.successBg}
            fg={Colors.success}
            onPress={() => router.push('/contractor/register')}
          />
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <ActionTile
            icon="award"
            label={t('home.action.plans')}
            bg="#FEF3C7"
            fg="#D97706"
            onPress={() => router.push('/contractor/plans' as any)}
          />
          <ActionTile
            icon="settings"
            label={t('home.action.adminPlans')}
            bg="#EDE9FE"
            fg="#7C3AED"
            onPress={() => router.push('/contractor/admin-plans' as any)}
          />
        </View>
      </View>

      {/* ── Empty projects empty state ─────────────────────────────────────── */}
      {recentProjects.length === 0 && (
        <View style={{ paddingHorizontal: 20, marginBottom: 24, marginTop: 12 }}>
          <EmptyState
            icon="folder"
            title={t('home.empty.title')}
            description={t('home.empty.description')}
          />
        </View>
      )}
    </ScrollView>
  );
}

const shadowPrimary = {
  shadowColor: Colors.primary,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 4,
};

function StatBadge({ value, label, color, borderColor }: { value: number; label: string; color: string; borderColor: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: 12,
        paddingVertical: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor,
      }}
    >
      <Txt w="bold" style={{ fontSize: 18, color }}>{value}</Txt>
      <Txt style={{ fontSize: 11, color: Colors.textMuted, marginTop: 2 }}>{label}</Txt>
    </View>
  );
}

function ActionTile({
  icon,
  label,
  bg,
  fg,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  bg: string;
  fg: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        gap: 6,
      }}
      accessibilityLabel={label}
    >
      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
        <Feather name={icon} size={18} color={fg} />
      </View>
      <Txt w="semibold" style={{ fontSize: 11, color: Colors.text, textAlign: 'center' }} numberOfLines={2}>
        {label}
      </Txt>
    </TouchableOpacity>
  );
}
