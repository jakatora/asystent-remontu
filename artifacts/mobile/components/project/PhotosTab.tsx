import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { PHOTO_TYPE_COLORS } from '@/utils/format';
import type { ProjectPhoto, PhotoType } from '@/types/domain';
import { useLanguage } from '@/context/LanguageContext';
import { resolveProjectPhotoUri } from '@/features/storage/projectBackupFiles';

interface PhotosTabProps {
  photos: ProjectPhoto[];
  onAddPhotoMenu: (photoType: PhotoType) => void;
  onDeletePhoto: (photo: ProjectPhoto) => Promise<void>;
}

export function PhotosTab({ photos, onAddPhotoMenu, onDeletePhoto }: PhotosTabProps) {
  const { t, language } = useLanguage();
  const [selected, setSelected] = useState<ProjectPhoto>();
  const [busy, setBusy] = useState(false);
  const [removeFailed, setRemoveFailed] = useState(false);
  const pending = useRef(false);

  const confirmDelete = async () => {
    if (!selected || pending.current) return;
    pending.current = true;
    setBusy(true);
    setRemoveFailed(false);
    try {
      await onDeletePhoto(selected);
      setSelected(undefined);
    } catch {
      setRemoveFailed(true);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };
  return (
    <View style={{ gap: 16 }}>
      <Txt w="bold" style={{ fontSize: 18, color: Colors.text }}>
        {t('cmp.PhotosTab.title')}
      </Txt>
      <Txt style={{ fontSize: 14, color: Colors.textSecondary }}>
        {t('cmp.PhotosTab.subtitle')}
      </Txt>

      {(['before', 'during', 'after'] as PhotoType[]).map((type) => {
        const typePhotos = photos.filter((p) => p.photoType === type);
        const tc = PHOTO_TYPE_COLORS[type];
        const stage = t(`cmp.PhotosTab.${type}`);
        const selectedIndex = typePhotos.findIndex(photo => photo.id === selected?.id);
        return (
          <View key={type} style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: tc.bg, borderRadius: 8 }}>
                  <Txt w="semibold" style={{ fontSize: 13, color: tc.color }}>
                    {stage}
                  </Txt>
                </View>
                <Txt style={{ fontSize: 13, color: Colors.textMuted }}>
                  ({typePhotos.length})
                </Txt>
              </View>
              <TouchableOpacity
                onPress={() => onAddPhotoMenu(type)}
                accessibilityRole="button"
                accessibilityLabel={`${t('cmp.PhotosTab.add')}: ${stage}`}
                style={{
                  minHeight:44,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  backgroundColor: Colors.surfaceAlt,
                  borderRadius: 8,
                }}
              >
                <Feather name="plus" size={14} color={Colors.primary} />
                <Txt w="medium" style={{ fontSize: 12, color: Colors.primary }}>{t('cmp.PhotosTab.add')}</Txt>
              </TouchableOpacity>
            </View>

            {typePhotos.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10 }}
              >
                {typePhotos.map((photo, index) => (
                  <View key={photo.id} style={{ width: 140 }}>
                    <Image
                      accessibilityLabel={photo.caption || t('cmp.PhotosTab.photoLabel', { number: index + 1, stage })}
                      source={{ uri: resolveProjectPhotoUri(photo.uri) }}
                      style={{
                        width: 140,
                        height: 140,
                        borderRadius: 12,
                        backgroundColor: Colors.surfaceAlt,
                      }}
                      resizeMode="cover"
                    />
                    <Txt style={{ fontSize: 10, color: Colors.textMuted, marginTop: 4 }}>
                      {new Date(photo.createdAt).toLocaleDateString(language === 'pl' ? 'pl-PL' : 'en-GB')}
                    </Txt>
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={t('cmp.PhotosTab.removeLabel', { number: index + 1, stage })}
                      disabled={busy}
                      onPress={() => { setRemoveFailed(false); setSelected(photo); }}
                      style={{ minHeight: 48, justifyContent: 'center', alignItems: 'center' }}
                    >
                      <Txt w="medium" style={{ color: Colors.danger }}>{t('project.detail.deletePhotoCta')}</Txt>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View
                style={{
                  backgroundColor: Colors.surfaceAlt,
                  borderRadius: 12,
                  padding: 20,
                  alignItems: 'center',
                  gap: 6,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  borderStyle: 'dashed',
                }}
              >
                <Feather name="camera" size={24} color={Colors.textMuted} />
                <Txt style={{ fontSize: 13, color: Colors.textMuted }}>
                  {t('cmp.PhotosTab.noPhotos')}
                </Txt>
              </View>
            )}
            {selectedIndex >= 0 && (
              <View style={{ gap: 8, padding: 12, borderRadius: 10, backgroundColor: Colors.surfaceAlt }}>
                <Txt w="semibold" accessibilityRole="header">{t('cmp.PhotosTab.removeLabel', { number: selectedIndex + 1, stage })}</Txt>
                <Txt>{t('project.detail.deletePhotoBody')}</Txt>
                {removeFailed && <Txt accessibilityRole="alert" style={{ color: Colors.danger }}>{t('cmp.PhotosTab.removeError')}</Txt>}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={() => setSelected(undefined)} style={{ minHeight: 48, paddingHorizontal: 12, justifyContent: 'center' }}>
                    <Txt>{t('project.detail.deletePhotoCancel')}</Txt>
                  </TouchableOpacity>
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel={t('project.detail.deletePhotoTitle')} disabled={busy} onPress={confirmDelete} style={{ minHeight: 48, paddingHorizontal: 12, justifyContent: 'center' }}>
                    <Txt w="semibold" style={{ color: Colors.danger }}>{t('project.detail.deletePhotoCta')}</Txt>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        );
      })}

    </View>
  );
}
