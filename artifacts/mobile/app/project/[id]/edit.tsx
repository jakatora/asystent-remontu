import { parseDecimal } from '@/shared/lib/number';
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { getJobById } from '@/features/content/registry';
import { calculateMaterials } from '@/features/calculator/engine';
import { parseMeasurements } from '@/shared/lib/measurements';
import { MeasurementSelect } from '@/components/ui/MeasurementSelect';
import { substratePrimerSpecification } from '@/features/calculator/substratePrimer';
import { isSanitaryJob } from '@/features/calculator/sanitarySealant';

function Field({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  suffix,
}: {
  label: string;
  icon: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'decimal-pad' | 'number-pad';
  suffix?: string;
}) {
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Feather name={icon as any} size={14} color={Colors.textSecondary} />
        <Txt w="medium" style={{ fontSize: 13, color: Colors.textSecondary }}>{label}</Txt>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          keyboardType={keyboardType ?? 'default'}
          multiline={multiline}
          style={{
            flex: 1,
            backgroundColor: Colors.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.border,
            padding: 14,
            fontSize: 15,
            fontFamily: 'Inter_400Regular',
            color: Colors.text,
            minHeight: multiline ? 100 : undefined,
            textAlignVertical: multiline ? 'top' : 'center',
          }}
        />
        {suffix && (
          <Txt style={{ fontSize: 14, color: Colors.textMuted, marginLeft: 8 }}>{suffix}</Txt>
        )}
      </View>
    </View>
  );
}

export default function EditProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { projects, updateProject, logActivity } = useApp();
  const { t, language } = useLanguage();

  const project = projects.find((p) => p.id === id);
  const epsJob = project && (['eps-insulation-bso', 'sink-installation'].includes(project.jobId) || substratePrimerSpecification(project.jobId) || isSanitaryJob(project.jobId)) ? getJobById(project.jobId) : undefined;
  const [epsMeasurements, setEpsMeasurements] = useState<Record<string, string>>({});

  const [name, setName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomWidth, setRoomWidth] = useState('');
  const [roomLength, setRoomLength] = useState('');
  const [roomHeight, setRoomHeight] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const leaveEditor = () => {
    if (router.canGoBack()) router.back();
    else router.replace({ pathname: '/project/[id]', params: { id, tab: 'estimate' } });
  };

  useEffect(() => {
    if (!project) return;
    setName(project.name);
    setRoomName(project.roomName ?? '');
    setRoomWidth(project.roomWidth ? String(project.roomWidth) : '');
    setRoomLength(project.roomLength ? String(project.roomLength) : '');
    setRoomHeight(project.roomHeight ? String(project.roomHeight) : '');
    setNotes(project.notes ?? '');
    setEpsMeasurements(Object.fromEntries(Object.entries(project.calculationResult?.measurements ?? {}).map(([key, value]) => [key, String(value)])));
  }, [project?.id]);

  const handleSave = async () => {
    if (!project) return;
    if (!name.trim()) {
      Alert.alert(t('project.edit.errorTitle'), t('project.edit.emptyNameError'));
      return;
    }
    const parsed = epsJob ? parseMeasurements(epsJob, epsMeasurements) : undefined;
    if (parsed?.errors.length) {
      Alert.alert(t('project.edit.errorTitle'), `${language === 'pl' ? 'Sprawdź pole' : 'Check field'}: ${parsed.errors[0].label}`);
      return;
    }

    setSaving(true);
    try {
      const w = parseDecimal(roomWidth);
      const l = parseDecimal(roomLength);
      const h = parseDecimal(roomHeight);

      await updateProject({
        ...project,
        name: name.trim(),
        roomName: roomName.trim() || undefined,
        roomWidth: isFinite(w) && w > 0 ? w : undefined,
        roomLength: isFinite(l) && l > 0 ? l : undefined,
        roomHeight: isFinite(h) && h > 0 ? h : undefined,
        notes: notes.trim() || undefined,
        ...(epsJob && parsed ? { measurements: parsed.values, calculationResult: calculateMaterials(epsJob, parsed.values) } : {}),
      });

      await logActivity(project.id, 'edited', t('project.edit.activityEdited'));
      leaveEditor();
    } catch (err) {
      console.error('[EditProject] save error:', err);
      Alert.alert(t('project.edit.errorTitle'), t('project.edit.saveError'));
    } finally {
      setSaving(false);
    }
  };

  if (!project) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <Txt w="medium" style={{ fontSize: 16, color: Colors.textSecondary }}>
          {t('project.edit.notFound')}
        </Txt>
      </View>
    );
  }

  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 16;

  return (
    <>
      <Stack.Screen
        options={{
          title: t('project.edit.title'),
          headerBackTitle: t('project.edit.headerBack'),
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: Colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: bottomPad, gap: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              backgroundColor: Colors.surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: Colors.border,
              padding: 16,
              gap: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Feather name="edit-3" size={18} color={Colors.primary} />
              <Txt w="bold" style={{ fontSize: 17, color: Colors.text }}>{t('project.edit.infoSection')}</Txt>
            </View>

            <Field
              label={t('project.edit.nameLabel')}
              icon="file-text"
              value={name}
              onChangeText={setName}
              placeholder={t('project.edit.namePlaceholder')}
            />

            <Field
              label={t('project.edit.notesLabel')}
              icon="message-square"
              value={notes}
              onChangeText={setNotes}
              placeholder={t('project.edit.notesPlaceholder')}
              multiline
            />
          </View>

          <View
            style={{
              backgroundColor: Colors.surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: Colors.border,
              padding: 16,
              gap: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Feather name="home" size={18} color={Colors.info} />
              <Txt w="bold" style={{ fontSize: 17, color: Colors.text }}>{t('project.edit.roomSection')}</Txt>
            </View>

            <Field
              label={t('project.edit.roomNameLabel')}
              icon="map-pin"
              value={roomName}
              onChangeText={setRoomName}
              placeholder={t('project.edit.roomNamePlaceholder')}
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Field
                  label={t('project.edit.widthLabel')}
                  icon="maximize-2"
                  value={roomWidth}
                  onChangeText={setRoomWidth}
                  placeholder="0.0"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Field
                  label={t('project.edit.lengthLabel')}
                  icon="maximize-2"
                  value={roomLength}
                  onChangeText={setRoomLength}
                  placeholder="0.0"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <Field
              label={t('project.edit.heightLabel')}
              icon="arrow-up"
              value={roomHeight}
              onChangeText={setRoomHeight}
              placeholder={t('project.edit.heightPlaceholder')}
              keyboardType="decimal-pad"
            />

            {isFinite(parseDecimal(roomWidth)) &&
              isFinite(parseDecimal(roomLength)) &&
              parseDecimal(roomWidth) > 0 &&
              parseDecimal(roomLength) > 0 && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    backgroundColor: Colors.infoBg,
                    borderRadius: 10,
                    padding: 10,
                  }}
                >
                  <Feather name="grid" size={14} color={Colors.info} />
                  <Txt w="medium" style={{ fontSize: 13, color: Colors.info }}>
                    {t('project.edit.areaLabel', { area: (parseDecimal(roomWidth) * parseDecimal(roomLength)).toFixed(1) })}
                  </Txt>
                </View>
              )}
          </View>

          {epsJob && <View style={{ padding: 16, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, gap: 16 }}>
            <Txt w="bold" style={{ fontSize: 17 }}>{isSanitaryJob(epsJob.id) ? (language === 'pl' ? 'Spoina i produkty do uszczelnienia' : 'Joint dimensions and sealing products') : substratePrimerSpecification(epsJob.id) ? (language === 'pl' ? 'Obmiary i zużycie materiałów' : 'Measurements and material consumption') : epsJob.id === 'sink-installation' ? (language === 'pl' ? 'Umywalki i potrzebne przyłącza' : 'Basins and required connections') : (language === 'pl' ? 'Obmiary ocieplenia' : 'Facade insulation measurements')}</Txt>
            <Txt style={{ lineHeight: 20, color: Colors.textSecondary }}>{isSanitaryJob(epsJob.id)
              ? (language === 'pl' ? 'Sprawdź długość i przekrój spoiny, wybierz model silikonu oraz taśmy. Preparat do usuwania resztek liczysz osobno. Zapisz, aby przeliczyć zestaw. Zmiana produktu lub ilości może wymagać ponownego potwierdzenia „Mam” i „Kupione”.' : 'Check joint length and cross-section and select the silicone and tape models. Enter remover packs separately. Save to recalculate the set. Product or quantity changes may require confirming Owned and Purchased again.')
              : substratePrimerSpecification(epsJob.id)
              ? (language === 'pl' ? 'Sprawdź powierzchnię i założenia gruntu, a przy wylewce także obwód. Zapisz, aby przeliczyć materiały. Wcześniejsze oznaczenia gruntu „Mam” i „Kupione” wymagają potwierdzenia, jeśli zmienił się produkt, ilość lub jednostka. Własne pozycje zakupowe pozostają zapisane.' : 'Check the area and primer allowance, and the perimeter for a screed. Save to recalculate materials. Earlier primer ownership and purchase marks require confirmation if the product, quantity or unit changed. Custom shopping items remain saved.')
              : epsJob.id === 'sink-installation'
              ? (language === 'pl' ? 'Wpisz liczbę umywalek i dodatkowych wężyków. Mocowania pozostają do ustalenia, dopóki nie potwierdzisz dopasowanego zestawu lub posiadania wszystkich potrzebnych mocowań. Zmiana ilości wymaga ponownego potwierdzenia „Mam” i „Kupione”.' : 'Enter basin and extra hose counts. Fixings remain unconfirmed until you select a suitable kit or declare that all required fixings are owned. Quantity changes require confirming “Owned” and “Purchased” again.')
              : (language === 'pl' ? 'Puste pola bez wartości domyślnej pozostają do ustalenia. Wpisane 0 oznacza świadomie pominiętą ilość. Zmiana obmiaru wymaga ponownego potwierdzenia „Mam” i „Kupione”.' : 'Blank fields without defaults remain unconfirmed. Entering 0 explicitly excludes that quantity. Changed measurements require confirming “Owned” and “Purchased” again.')}</Txt>
            {epsJob.measurementInputs.map(input => <View key={input.id} style={{ gap: 4 }}>
              {'inputType' in input && input.inputType === 'select' ? <>
                <Txt w="medium" style={{ fontSize: 15 }}>{input.label}</Txt>
                <MeasurementSelect label={input.label} options={input.options ?? []} value={epsMeasurements[input.id] ? parseDecimal(epsMeasurements[input.id]) : input.defaultValue}
                  onChange={value => setEpsMeasurements(current => ({ ...current, [input.id]: String(value) }))}/>
              </> : <Field label={input.label} icon="maximize-2" value={epsMeasurements[input.id] ?? ''} onChangeText={value => setEpsMeasurements(current => ({ ...current, [input.id]: value }))} placeholder={input.defaultValue !== undefined ? String(input.defaultValue) : input.placeholder} keyboardType={'inputType' in input && input.inputType === 'count' ? 'number-pad' : 'decimal-pad'} suffix={input.unit} />}
              {input.hint && <Txt style={{ fontSize: 12, color: Colors.textSecondary, lineHeight: 18 }}>{input.hint}</Txt>}
            </View>)}
          </View>}

          <View style={{ gap: 10 }}>
            <Button
              label={saving ? t('project.edit.saving') : t('project.edit.saveCta')}
              onPress={handleSave}
              fullWidth
              icon={<Feather name="check" size={16} color="#fff" />}
            />
            <Button
              label={t('project.edit.cancelCta')}
              variant="outline"
              onPress={leaveEditor}
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
