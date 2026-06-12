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
  keyboardType?: 'default' | 'decimal-pad';
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
  const { t } = useLanguage();

  const project = projects.find((p) => p.id === id);

  const [name, setName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomWidth, setRoomWidth] = useState('');
  const [roomLength, setRoomLength] = useState('');
  const [roomHeight, setRoomHeight] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!project) return;
    setName(project.name);
    setRoomName(project.roomName ?? '');
    setRoomWidth(project.roomWidth ? String(project.roomWidth) : '');
    setRoomLength(project.roomLength ? String(project.roomLength) : '');
    setRoomHeight(project.roomHeight ? String(project.roomHeight) : '');
    setNotes(project.notes ?? '');
  }, [project?.id]);

  const handleSave = async () => {
    if (!project) return;
    if (!name.trim()) {
      Alert.alert(t('project.edit.errorTitle'), t('project.edit.emptyNameError'));
      return;
    }

    setSaving(true);
    try {
      const w = parseFloat(roomWidth);
      const l = parseFloat(roomLength);
      const h = parseFloat(roomHeight);

      await updateProject({
        ...project,
        name: name.trim(),
        roomName: roomName.trim() || undefined,
        roomWidth: isFinite(w) && w > 0 ? w : undefined,
        roomLength: isFinite(l) && l > 0 ? l : undefined,
        roomHeight: isFinite(h) && h > 0 ? h : undefined,
        notes: notes.trim() || undefined,
      });

      await logActivity(project.id, 'edited', t('project.edit.activityEdited'));
      router.back();
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

            {isFinite(parseFloat(roomWidth)) &&
              isFinite(parseFloat(roomLength)) &&
              parseFloat(roomWidth) > 0 &&
              parseFloat(roomLength) > 0 && (
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
                    {t('project.edit.areaLabel', { area: (parseFloat(roomWidth) * parseFloat(roomLength)).toFixed(1) })}
                  </Txt>
                </View>
              )}
          </View>

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
              onPress={() => router.back()}
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
