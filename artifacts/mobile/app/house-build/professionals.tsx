import React from 'react';
import { View, ScrollView, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { PROFESSIONAL_ROLES } from '@/features/house-build/stages';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';

export default function ProfessionalsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  const required = PROFESSIONAL_ROLES.filter((r) => r.isRequired);
  const optional = PROFESSIONAL_ROLES.filter((r) => !r.isRequired);

  return (
    <>
      <Stack.Screen options={{ title: t('hb.professionals.title') }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <View style={{
            backgroundColor: '#F5F3FF',
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#DDD6FE',
          }}>
            <Txt w="bold" style={{ fontSize: 16, color: '#6D28D9' }}>{t('hb.professionals.heroTitle')}</Txt>
            <Txt style={{ fontSize: 13, color: '#7C3AED', marginTop: 4 }}>
              {t('hb.professionals.heroSubtitle')}
            </Txt>
          </View>

          <Txt w="semibold" style={{ fontSize: 15, color: Colors.text, marginBottom: 12 }}>{t('hb.professionals.requiredSection')}</Txt>
          {required.map((role) => (
            <ProfessionalCard key={role.role} role={role} />
          ))}

          <Txt w="semibold" style={{ fontSize: 15, color: Colors.text, marginTop: 16, marginBottom: 12 }}>{t('hb.professionals.optionalSection')}</Txt>
          {optional.map((role) => (
            <ProfessionalCard key={role.role} role={role} />
          ))}

          <View style={{
            backgroundColor: Colors.warningBg,
            borderRadius: 12,
            padding: 14,
            marginTop: 16,
            borderWidth: 1,
            borderColor: '#FDE68A',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Feather name="alert-triangle" size={14} color={Colors.warning} />
              <Txt w="semibold" style={{ fontSize: 13, color: '#92400E' }}>{t('hb.professionals.tipTitle')}</Txt>
            </View>
            <Txt style={{ fontSize: 12, color: '#92400E' }}>
              {t('hb.professionals.tipBody')}
            </Txt>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

function ProfessionalCard({ role }: { role: typeof PROFESSIONAL_ROLES[number] }) {
  const { t } = useLanguage();
  return (
    <View style={{
      backgroundColor: Colors.surface,
      borderRadius: 14,
      padding: 14,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: Colors.border,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: '#F5F3FF',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Feather name="user" size={18} color="#8B5CF6" />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Txt w="semibold" style={{ fontSize: 14, color: Colors.text }}>{role.label}</Txt>
            {role.isRequired && (
              <View style={{ backgroundColor: Colors.dangerBg, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}>
                <Txt style={{ fontSize: 9, color: Colors.danger }}>{t('hb.professionals.requiredBadge')}</Txt>
              </View>
            )}
          </View>
          <Txt style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>{role.description}</Txt>
          <Txt style={{ fontSize: 11, color: Colors.textMuted, marginTop: 2 }}>{t('hb.professionals.whenLabel', { when: role.whenNeeded })}</Txt>
        </View>
      </View>
    </View>
  );
}
