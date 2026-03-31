import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { WarningRule } from '@/types/renovation';
import { Colors } from '@/constants/colors';

interface WarningBannerProps {
  warnings: WarningRule[];
}

export function WarningBanner({ warnings }: WarningBannerProps) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <View style={styles.container}>
      {warnings.map((w, i) => (
        <View key={i} style={[styles.banner, styles[`bg_${w.level}`]]}>
          <Feather
            name={w.level === 'danger' ? 'alert-octagon' : w.level === 'warning' ? 'alert-triangle' : 'info'}
            size={20}
            color={w.level === 'danger' ? Colors.danger : w.level === 'warning' ? Colors.warning : Colors.info}
            style={styles.icon}
          />
          <Text style={[styles.text, styles[`text_${w.level}`]]}>{w.message}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  icon: { marginTop: 1 },
  text: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    lineHeight: 20,
  },
  bg_info: { backgroundColor: Colors.infoBg, borderLeftWidth: 3, borderLeftColor: Colors.info },
  bg_warning: { backgroundColor: Colors.warningBg, borderLeftWidth: 3, borderLeftColor: Colors.warning },
  bg_danger: { backgroundColor: Colors.dangerBg, borderLeftWidth: 3, borderLeftColor: Colors.danger },
  text_info: { color: '#1e40af' },
  text_warning: { color: '#92400e' },
  text_danger: { color: '#991b1b' },
});
