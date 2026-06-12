import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Platform, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { isSentryConfigured } from '@/lib/sentry';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { pluralize } from '@/utils/format';
import { APP_CONFIG } from '@/config/contact';
import { LANGUAGES } from '@/constants/translations';

interface SettingRowProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  iconColor?: string;
  iconBg?: string;
  danger?: boolean;
  badge?: string;
}

function SettingRow({ icon, title, subtitle, onPress, iconColor = Colors.primary, iconBg = Colors.primaryBg, danger = false, badge }: SettingRowProps) {
  const color = danger ? Colors.danger : iconColor;
  const bg = danger ? Colors.dangerBg : iconBg;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 14,
      }}
      accessibilityLabel={`${title}${subtitle ? `. ${subtitle}` : ''}`}
      accessibilityRole={onPress ? 'button' : 'text'}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bg,
        }}
      >
        <Feather name={icon as any} size={18} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Txt w="medium" style={{ fontSize: 15, color: danger ? Colors.danger : Colors.text }}>
          {title}
        </Txt>
        {subtitle && (
          <Txt style={{ fontSize: 12, color: Colors.textMuted, marginTop: 2 }}>
            {subtitle}
          </Txt>
        )}
      </View>
      {badge && (
        <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, backgroundColor: Colors.successBg }}>
          <Txt w="semibold" style={{ fontSize: 12, color: Colors.success }}>{badge}</Txt>
        </View>
      )}
      {onPress && <Feather name="chevron-right" size={18} color={Colors.textMuted} />}
    </TouchableOpacity>
  );
}

function SettingDivider() {
  return <View style={{ height: 1, backgroundColor: Colors.borderLight, marginLeft: 66 }} />;
}

function SectionLabel({ label }: { label: string }) {
  return (
    <Txt
      w="semibold"
      style={{
        fontSize: 13,
        color: Colors.textMuted,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}
    >
      {label}
    </Txt>
  );
}

function LanguageRow({
  nativeLabel,
  label,
  active,
  onPress,
}: {
  nativeLabel: string;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 }}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={nativeLabel}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: active ? Colors.primaryBg : Colors.surfaceAlt,
        }}
      >
        <Feather name="globe" size={18} color={active ? Colors.primary : Colors.textMuted} />
      </View>
      <View style={{ flex: 1 }}>
        <Txt w="medium" style={{ fontSize: 15, color: Colors.text }}>
          {nativeLabel}
        </Txt>
        <Txt style={{ fontSize: 12, color: Colors.textMuted, marginTop: 2 }}>{label}</Txt>
      </View>
      {active && <Feather name="check" size={18} color={Colors.primary} />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { projects, refreshProjects } = useApp();
  const { t, language, setLanguage } = useLanguage();
  const [isDeletingData, setIsDeletingData] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  const projectWord = pluralize(
    projects.length,
    t('settings.projectWord.one'),
    t('settings.projectWord.few'),
    t('settings.projectWord.many')
  );

  const handleAbout = () => {
    Alert.alert(
      APP_CONFIG.appName,
      t('settings.alert.about', { version: APP_CONFIG.version }),
      [{ text: t('common.ok') }]
    );
  };

  const handleHelp = () => {
    Alert.alert(t('settings.help.title'), t('settings.alert.help'), [
      { text: t('common.understood') },
    ]);
  };

  const handleSafety = () => {
    Alert.alert(t('settings.safety.title'), t('settings.alert.safety'), [
      { text: t('common.understood') },
    ]);
  };

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert(t('common.error'), t('settings.alert.openLinkError'));
    });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.background }}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
        <Txt w="bold" style={{ fontSize: 26, color: Colors.text }}>{t('settings.title')}</Txt>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          marginHorizontal: 20,
          marginBottom: 24,
          backgroundColor: Colors.surface,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: Colors.border,
        }}
        accessibilityLabel={`${projects.length} ${projectWord}`}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: Colors.primaryBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Feather name="home" size={28} color={Colors.primary} />
        </View>
        <View>
          <Txt w="bold" style={{ fontSize: 18, color: Colors.text }}>{APP_CONFIG.appName}</Txt>
          <Txt style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }}>
            {projects.length} {projectWord}
          </Txt>
        </View>
      </View>

      {LANGUAGES.length > 1 && (
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <SectionLabel label={t('settings.section.language')} />
          <View style={{ backgroundColor: Colors.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' }}>
            {LANGUAGES.map((lang, idx) => (
              <React.Fragment key={lang.code}>
                {idx > 0 && <SettingDivider />}
                <LanguageRow
                  nativeLabel={lang.nativeLabel}
                  label={lang.label}
                  active={language === lang.code}
                  onPress={() => setLanguage(lang.code)}
                />
              </React.Fragment>
            ))}
          </View>
        </View>
      )}

      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <SectionLabel label={t('settings.section.data')} />
        <View style={{ backgroundColor: Colors.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' }}>
          <SettingRow
            icon="folder"
            title={t('settings.projects.title')}
            subtitle={t('settings.projects.subtitle', { count: projects.length, word: projectWord })}
            iconColor={Colors.info}
            iconBg={Colors.infoBg}
          />
          <SettingDivider />
          <SettingRow
            icon="shield"
            title={t('settings.offline.title')}
            subtitle={t('settings.offline.subtitle')}
            iconColor={Colors.success}
            iconBg={Colors.successBg}
            badge={t('settings.offline.badge')}
          />
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <SectionLabel label={t('settings.section.sync')} />
        <View style={{ backgroundColor: Colors.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' }}>
          <SettingRow
            icon="cloud"
            title={t('settings.cloud.title')}
            subtitle={isSupabaseConfigured ? t('settings.cloud.connected') : t('settings.cloud.unavailable')}
            iconColor={Colors.info}
            iconBg={Colors.infoBg}
          />
          <SettingDivider />
          <SettingRow
            icon="user"
            title={t('settings.account.title')}
            subtitle={t('settings.account.subtitle')}
            iconColor="#8B5CF6"
            iconBg="#F5F3FF"
          />
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <SectionLabel label={t('settings.section.app')} />
        <View style={{ backgroundColor: Colors.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' }}>
          <SettingRow
            icon="info"
            title={t('settings.about.title')}
            subtitle={t('settings.about.subtitle', { version: APP_CONFIG.version })}
            onPress={handleAbout}
            iconColor={Colors.secondary}
            iconBg={Colors.surfaceAlt}
          />
          <SettingDivider />
          <SettingRow
            icon="book-open"
            title={t('settings.help.title')}
            subtitle={t('settings.help.subtitle')}
            onPress={handleHelp}
            iconColor={Colors.info}
            iconBg={Colors.infoBg}
          />
          <SettingDivider />
          <SettingRow
            icon="activity"
            title={t('settings.errors.title')}
            subtitle={isSentryConfigured ? t('settings.errors.on') : t('settings.errors.off')}
            iconColor={Colors.warning}
            iconBg={Colors.warningBg}
          />
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <SectionLabel label={t('settings.section.helpLegal')} />
        <View style={{ backgroundColor: Colors.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' }}>
          <SettingRow
            icon="help-circle"
            title={t('settings.support.title')}
            subtitle={t('settings.support.subtitle')}
            onPress={() => openUrl(APP_CONFIG.supportUrl)}
            iconColor={Colors.info}
            iconBg={Colors.infoBg}
          />
          <SettingDivider />
          <SettingRow
            icon="lock"
            title={t('settings.privacy.title')}
            subtitle={t('settings.privacy.subtitle')}
            onPress={() => openUrl(APP_CONFIG.privacyUrl)}
            iconColor="#8B5CF6"
            iconBg="#F5F3FF"
          />
          <SettingDivider />
          <SettingRow
            icon="file-text"
            title={t('settings.terms.title')}
            subtitle={t('settings.terms.subtitle')}
            onPress={() => openUrl(APP_CONFIG.termsUrl)}
            iconColor="#0EA5E9"
            iconBg="#F0F9FF"
          />
          <SettingDivider />
          <SettingRow
            icon="mail"
            title={t('settings.contact.title')}
            subtitle={APP_CONFIG.supportEmail}
            onPress={() => openUrl(`mailto:${APP_CONFIG.supportEmail}`)}
            iconColor={Colors.primary}
            iconBg={Colors.primaryBg}
          />
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <SectionLabel label={t('settings.section.safety')} />
        <View style={{ backgroundColor: Colors.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' }}>
          <SettingRow
            icon="alert-triangle"
            title={t('settings.safety.title')}
            subtitle={t('settings.safety.subtitle')}
            onPress={handleSafety}
            iconColor={Colors.warning}
            iconBg={Colors.warningBg}
          />
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <SectionLabel label={t('settings.section.account')} />
        <View style={{ backgroundColor: Colors.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' }}>
          <SettingRow
            icon="trash-2"
            title={t('settings.delete.title')}
            subtitle={t('settings.delete.subtitle')}
            onPress={() => {
              if (isDeletingData) return;
              Alert.alert(
                t('settings.delete.confirmTitle'),
                t('settings.delete.confirmBody'),
                [
                  { text: t('common.cancel'), style: 'cancel' },
                  {
                    text: t('settings.delete.confirmCta'),
                    style: 'destructive',
                    onPress: async () => {
                      setIsDeletingData(true);
                      try {
                        const { getDb } = await import('@/db/client');
                        const db = await getDb();
                        await db.execAsync(`
                          DELETE FROM project_activities;
                          DELETE FROM price_overrides;
                          DELETE FROM checklist_items;
                          DELETE FROM project_photos;
                          DELETE FROM shopping_items;
                          DELETE FROM projects;
                          DELETE FROM contractor_requests;
                          DELETE FROM saved_contractors;
                          DELETE FROM contractor_blocks;
                          DELETE FROM contractor_reports;
                          DELETE FROM contractor_reviews;
                          DELETE FROM hb_stage_contractor_shortlist;
                          DELETE FROM hb_stage_contractor_needs;
                          DELETE FROM hb_checklist_items;
                          DELETE FROM hb_documents;
                          DELETE FROM hb_utilities;
                          DELETE FROM house_build_projects;
                        `);
                        await refreshProjects();
                        Alert.alert(t('common.done'), t('settings.delete.successBody'));
                      } catch (err) {
                        console.error('[Settings] delete all data error:', err);
                        Alert.alert(t('common.error'), t('settings.delete.errorBody'));
                      } finally {
                        setIsDeletingData(false);
                      }
                    },
                  },
                ]
              );
            }}
            danger
          />
        </View>
      </View>

      <Txt style={{ textAlign: 'center', fontSize: 12, color: Colors.textMuted, marginBottom: 20 }}>
        {t('settings.footer', { appName: APP_CONFIG.appName, version: APP_CONFIG.version })}
      </Txt>
    </ScrollView>
  );
}
