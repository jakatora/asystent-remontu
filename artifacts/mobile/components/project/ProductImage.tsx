import React, { useState } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';

export function ProductImage({ uri, name, size = 64 }: { uri?: string; name: string; size?: number }) {
  const { t } = useLanguage();
  const [failedUri, setFailedUri] = useState<string>();
  return (
    <View style={{ width: size, height: size, flexShrink: 0, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {uri && failedUri !== uri ? (
        <Image source={{ uri }} style={{ width: size - 8, height: size - 8 }} contentFit="contain" cachePolicy="memory-disk" accessibilityLabel={t('upgrade.product.photo', { name })} onError={() => setFailedUri(uri)} />
      ) : <Feather name="package" size={26} color={Colors.textSecondary} />}
    </View>
  );
}
