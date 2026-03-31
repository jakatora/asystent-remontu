import React from 'react';
import { View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { PHOTO_TYPE_LABELS, PHOTO_TYPE_COLORS, timeAgo } from '@/utils/format';
import type { ProjectPhoto, PhotoType } from '@/types/domain';

interface PhotosTabProps {
  photos: ProjectPhoto[];
  onAddPhotoMenu: (photoType: PhotoType) => void;
  onDeletePhoto: (photo: ProjectPhoto) => void;
}

export function PhotosTab({ photos, onAddPhotoMenu, onDeletePhoto }: PhotosTabProps) {
  return (
    <View style={{ gap: 16 }}>
      <Txt w="bold" style={{ fontSize: 18, color: Colors.text }}>
        Dokumentacja zdjęciowa
      </Txt>
      <Txt style={{ fontSize: 14, color: Colors.textSecondary }}>
        Dodaj zdjęcia przed, w trakcie i po remoncie.
      </Txt>

      {(['before', 'during', 'after'] as PhotoType[]).map((type) => {
        const typePhotos = photos.filter((p) => p.photoType === type);
        const tc = PHOTO_TYPE_COLORS[type];
        return (
          <View key={type} style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: tc.bg, borderRadius: 8 }}>
                  <Txt w="semibold" style={{ fontSize: 13, color: tc.color }}>
                    {PHOTO_TYPE_LABELS[type]}
                  </Txt>
                </View>
                <Txt style={{ fontSize: 13, color: Colors.textMuted }}>
                  ({typePhotos.length})
                </Txt>
              </View>
              <TouchableOpacity
                onPress={() => onAddPhotoMenu(type)}
                style={{
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
                <Txt w="medium" style={{ fontSize: 12, color: Colors.primary }}>Dodaj</Txt>
              </TouchableOpacity>
            </View>

            {typePhotos.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10 }}
              >
                {typePhotos.map((photo) => (
                  <TouchableOpacity
                    key={photo.id}
                    onLongPress={() => onDeletePhoto(photo)}
                    activeOpacity={0.9}
                  >
                    <Image
                      source={{ uri: photo.uri }}
                      style={{
                        width: 140,
                        height: 140,
                        borderRadius: 12,
                        backgroundColor: Colors.surfaceAlt,
                      }}
                      resizeMode="cover"
                    />
                    <Txt style={{ fontSize: 10, color: Colors.textMuted, marginTop: 4 }}>
                      {timeAgo(photo.createdAt)}
                    </Txt>
                  </TouchableOpacity>
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
                  Brak zdjęć
                </Txt>
              </View>
            )}
          </View>
        );
      })}

      {photos.length > 0 && (
        <View
          style={{
            flexDirection: 'row',
            gap: 8,
            backgroundColor: Colors.infoBg,
            borderRadius: 10,
            padding: 10,
            alignItems: 'flex-start',
          }}
        >
          <Feather name="info" size={14} color={Colors.info} style={{ marginTop: 1 }} />
          <Txt style={{ flex: 1, fontSize: 12, color: '#1e40af', lineHeight: 17 }}>
            Przytrzymaj zdjęcie, aby je usunąć.
          </Txt>
        </View>
      )}
    </View>
  );
}
