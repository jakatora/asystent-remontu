import React, { useState } from 'react';
import { View, ScrollView, TextInput, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';

const HB_ACCENT = '#2563EB';
const HB_ACCENT_BG = '#EFF6FF';

export default function EnergyPlanningScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  const [targetEP, setTargetEP] = useState('');
  const [wallU, setWallU] = useState('');
  const [roofU, setRoofU] = useState('');
  const [floorU, setFloorU] = useState('');
  const [heatingNotes, setHeatingNotes] = useState('');

  return (
    <>
      <Stack.Screen options={{ title: t('hb.energyPlanning.title') }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <View style={{
            backgroundColor: HB_ACCENT_BG,
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#BFDBFE',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Feather name="thermometer" size={20} color={HB_ACCENT} />
              <Txt w="bold" style={{ fontSize: 18, color: Colors.text }}>{t('hb.energyPlanning.heroTitle')}</Txt>
            </View>
            <Txt style={{ fontSize: 13, color: Colors.textSecondary, lineHeight: 20 }}>
              {t('hb.energyPlanning.heroBody')}
            </Txt>
          </View>

          <View style={{
            backgroundColor: '#FFFBEB',
            borderRadius: 12,
            padding: 12,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#FDE68A',
            flexDirection: 'row',
            gap: 10,
          }}>
            <Feather name="info" size={16} color="#92400E" style={{ marginTop: 2 }} />
            <Txt style={{ fontSize: 12, color: '#92400E', flex: 1 }}>
              {t('hb.energyPlanning.disclaimer')}
            </Txt>
          </View>

          <EnergyField
            label={t('hb.energyPlanning.epLabel')}
            help={t('hb.energyPlanning.epHelp')}
            value={targetEP}
            onChange={setTargetEP}
            placeholder={t('hb.energyPlanning.epPlaceholder')}
            keyboardType="numeric"
          />

          <Txt w="semibold" style={{ fontSize: 15, color: Colors.text, marginTop: 20, marginBottom: 12 }}>
            {t('hb.energyPlanning.uSection')}
          </Txt>

          <EnergyField
            label={t('hb.energyPlanning.wallLabel')}
            help={t('hb.energyPlanning.wallHelp')}
            value={wallU}
            onChange={setWallU}
            placeholder={t('hb.energyPlanning.wallPlaceholder')}
            keyboardType="decimal-pad"
          />

          <EnergyField
            label={t('hb.energyPlanning.roofLabel')}
            help={t('hb.energyPlanning.roofHelp')}
            value={roofU}
            onChange={setRoofU}
            placeholder={t('hb.energyPlanning.roofPlaceholder')}
            keyboardType="decimal-pad"
          />

          <EnergyField
            label={t('hb.energyPlanning.floorLabel')}
            help={t('hb.energyPlanning.floorHelp')}
            value={floorU}
            onChange={setFloorU}
            placeholder={t('hb.energyPlanning.floorPlaceholder')}
            keyboardType="decimal-pad"
          />

          <Txt w="semibold" style={{ fontSize: 15, color: Colors.text, marginTop: 20, marginBottom: 12 }}>
            {t('hb.energyPlanning.heatingSection')}
          </Txt>

          <View style={{ marginBottom: 16 }}>
            <Txt style={{ fontSize: 13, color: Colors.text, marginBottom: 6 }}>{t('hb.energyPlanning.notesLabel')}</Txt>
            <TextInput
              style={{
                backgroundColor: Colors.surface,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: Colors.border,
                padding: 14,
                fontSize: 14,
                color: Colors.text,
                minHeight: 100,
                textAlignVertical: 'top',
              }}
              multiline
              value={heatingNotes}
              onChangeText={setHeatingNotes}
              placeholder={t('hb.energyPlanning.notesPlaceholder')}
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={{
            backgroundColor: '#F0FDF4',
            borderRadius: 12,
            padding: 14,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: '#BBF7D0',
          }}>
            <Txt w="semibold" style={{ fontSize: 13, color: '#16A34A', marginBottom: 8 }}>{t('hb.energyPlanning.rulesTitle')}</Txt>
            {[
              t('hb.energyPlanning.rule1'),
              t('hb.energyPlanning.rule2'),
              t('hb.energyPlanning.rule3'),
              t('hb.energyPlanning.rule4'),
              t('hb.energyPlanning.rule5'),
            ].map((note, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
                <Feather name="check" size={12} color="#16A34A" style={{ marginTop: 2 }} />
                <Txt style={{ fontSize: 12, color: Colors.text, flex: 1 }}>{note}</Txt>
              </View>
            ))}
          </View>

          <View style={{
            backgroundColor: '#F8FAFC',
            borderRadius: 10,
            padding: 12,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            flexDirection: 'row',
            gap: 8,
          }}>
            <Feather name="shield" size={14} color={Colors.textMuted} style={{ marginTop: 2 }} />
            <Txt style={{ fontSize: 11, color: Colors.textMuted, flex: 1 }}>
              {t('hb.energyPlanning.footnote')}
            </Txt>
          </View>

          <View style={{ marginTop: 12, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' }}>
            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>{t('hb.energyPlanning.source')}</Txt>
            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>{t('hb.energyPlanning.lastReviewed')}</Txt>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

function EnergyField({ label, help, value, onChange, placeholder, keyboardType }: {
  label: string;
  help: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  keyboardType?: 'numeric' | 'decimal-pad';
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Txt w="semibold" style={{ fontSize: 13, color: Colors.text, marginBottom: 2 }}>{label}</Txt>
      <Txt style={{ fontSize: 11, color: Colors.textMuted, marginBottom: 6 }}>{help}</Txt>
      <TextInput
        style={{
          backgroundColor: Colors.surface,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: Colors.border,
          padding: 14,
          fontSize: 16,
          color: Colors.text,
        }}
        keyboardType={keyboardType || 'default'}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
      />
    </View>
  );
}
