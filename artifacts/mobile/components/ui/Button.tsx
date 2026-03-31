import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  View,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Txt } from './Txt';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  testID?: string;
}

const variantStyle: Record<ButtonVariant, string> = {
  primary:   'bg-primary',
  secondary: 'bg-slate-800',
  outline:   'bg-transparent border-[1.5px] border-primary',
  ghost:     'bg-transparent',
  danger:    'bg-danger',
};

const textStyle: Record<ButtonVariant, string> = {
  primary:   'text-white',
  secondary: 'text-white',
  outline:   'text-primary',
  ghost:     'text-primary',
  danger:    'text-white',
};

const sizeStyle: Record<ButtonSize, string> = {
  sm: 'px-4 py-2.5 rounded-xl',
  md: 'px-6 py-4 rounded-2xl',
  lg: 'px-7 py-[18px] rounded-2xl',
};

const textSizeStyle: Record<ButtonSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  fullWidth = false,
  testID,
}: ButtonProps) {
  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <TouchableOpacity
      testID={testID}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      className={`items-center justify-center ${variantStyle[variant]} ${sizeStyle[size]} ${fullWidth ? 'w-full' : ''} ${disabled || loading ? 'opacity-45' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#F97316'} size="small" />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon && <View className="mr-2">{icon}</View>}
          <Txt w="semibold" className={`text-center ${textStyle[variant]} ${textSizeStyle[size]}`}>
            {label}
          </Txt>
          {iconRight && <View className="ml-2">{iconRight}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}
