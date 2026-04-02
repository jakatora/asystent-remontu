import React, { useState } from 'react';
import { View, ScrollView, TextInput, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';

const HB_ACCENT = '#2563EB';
const HB_ACCENT_BG = '#EFF6FF';

export default function EnergyPlanningScreen() {
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  const [targetEP, setTargetEP] = useState('');
  const [wallU, setWallU] = useState('');
  const [roofU, setRoofU] = useState('');
  const [floorU, setFloorU] = useState('');
  const [heatingNotes, setHeatingNotes] = useState('');

  return (
    <>
      <Stack.Screen options={{ title: 'Planowanie energetyczne' }} />
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
              <Txt w="bold" style={{ fontSize: 18, color: Colors.text }}>Standard energetyczny</Txt>
            </View>
            <Txt style={{ fontSize: 13, color: Colors.textSecondary, lineHeight: 20 }}>
              Uzupelnij orientacyjne parametry energetyczne Twojego projektu. Wartosci powinny wynikac z obliczen projektanta.
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
              To arkusz pomocniczy — nie zastepuje obliczen energetycznych. Wartosci U i EP musza wynikac z projektu i obowiazujacych przepisów.
            </Txt>
          </View>

          <EnergyField
            label="Docelowy wskaznik EP [kWh/(m2*rok)]"
            help="Wskaznik rocznego zapotrzebowania na energie pierwotna. Wymagania okreslone sa w WT."
            value={targetEP}
            onChange={setTargetEP}
            placeholder="np. 70"
            keyboardType="numeric"
          />

          <Txt w="semibold" style={{ fontSize: 15, color: Colors.text, marginTop: 20, marginBottom: 12 }}>
            Docelowe wspolczynniki U
          </Txt>

          <EnergyField
            label="Sciany zewnetrzne U [W/(m2*K)]"
            help="Wspolczynnik przenikania ciepla scian. WT 2021: maks. 0,20."
            value={wallU}
            onChange={setWallU}
            placeholder="np. 0.18"
            keyboardType="decimal-pad"
          />

          <EnergyField
            label="Dach / stropodach U [W/(m2*K)]"
            help="WT 2021: maks. 0,15 dla dachow."
            value={roofU}
            onChange={setRoofU}
            placeholder="np. 0.12"
            keyboardType="decimal-pad"
          />

          <EnergyField
            label="Podloga na gruncie U [W/(m2*K)]"
            help="WT 2021: maks. 0,30."
            value={floorU}
            onChange={setFloorU}
            placeholder="np. 0.25"
            keyboardType="decimal-pad"
          />

          <Txt w="semibold" style={{ fontSize: 15, color: Colors.text, marginTop: 20, marginBottom: 12 }}>
            Koncepcja ogrzewania i wentylacji
          </Txt>

          <View style={{ marginBottom: 16 }}>
            <Txt style={{ fontSize: 13, color: Colors.text, marginBottom: 6 }}>Notatki</Txt>
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
              placeholder="Np. pompa ciepla + rekuperacja, ogrzewanie podlogowe..."
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
            <Txt w="semibold" style={{ fontSize: 13, color: '#16A34A', marginBottom: 8 }}>Kluczowe zasady</Txt>
            {[
              'Dom to jednolita powloka cieplna — ciaglоsc izolacji jest kluczowa.',
              'Sciany, dach, podloga, okna i przejscia musza tworzyc ciagla izolacje.',
              'Mostki cieplne (balkony, wience, okna) wymagaja swiadomych detali.',
              'Decyzje dot. izolacji, ogrzewania i wentylacji planuj razem.',
              'Grubosc izolacji musi wynikac z obliczen, nie z ogólnych porad.',
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
              Wartosci orientacyjne — szczególy potwierdz z projektem i obowiazujacymi Warunkami Technicznymi (WT).
            </Txt>
          </View>

          <View style={{ marginTop: 12, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' }}>
            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>Zrodlo: Warunki techniczne (WT 2021), Prawo budowlane</Txt>
            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>Ostatnia weryfikacja: 2025-01-15</Txt>
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
