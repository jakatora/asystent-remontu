import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

type BadgeVariant = 'easy' | 'medium' | 'hard' | 'low' | 'high' | 'warning' | 'info' | 'success';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'info' }: BadgeProps) {
  return (
    <View style={[styles.badge, styles[`bg_${variant}`]]}>
      <Text style={[styles.text, styles[`text_${variant}`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  bg_easy: { backgroundColor: Colors.successBg },
  bg_medium: { backgroundColor: Colors.warningBg },
  bg_hard: { backgroundColor: Colors.dangerBg },
  bg_low: { backgroundColor: Colors.successBg },
  bg_high: { backgroundColor: Colors.dangerBg },
  bg_warning: { backgroundColor: Colors.warningBg },
  bg_info: { backgroundColor: Colors.infoBg },
  bg_success: { backgroundColor: Colors.successBg },

  text_easy: { color: Colors.success },
  text_medium: { color: Colors.warning },
  text_hard: { color: Colors.danger },
  text_low: { color: Colors.success },
  text_high: { color: Colors.danger },
  text_warning: { color: Colors.warning },
  text_info: { color: Colors.info },
  text_success: { color: Colors.success },
});
