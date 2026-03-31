import React from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

const paddingClasses = {
  none: '',
  sm:   'p-3',
  md:   'p-4',
  lg:   'p-5',
};

export function Card({ children, style, onPress, padding = 'md', className = '' }: CardProps) {
  const base = `bg-surface rounded-2xl border border-stroke ${paddingClasses[padding]} ${className}`;

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} className={base} style={style}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={base} style={style}>
      {children}
    </View>
  );
}
