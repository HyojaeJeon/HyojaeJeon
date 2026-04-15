import type { ReactNode } from 'react';
import { Pressable, Text, ActivityIndicator, type ViewStyle } from 'react-native';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  className?: string;
  style?: ViewStyle;
}

const VARIANT_CONTAINER: Record<string, string> = {
  primary: 'bg-[#3B82F6]',
  secondary: 'bg-gray-100',
  danger: 'bg-red-500',
  outline: 'border border-gray-200 bg-white',
  ghost: 'bg-transparent',
};

const VARIANT_TEXT: Record<string, string> = {
  primary: 'text-white',
  secondary: 'text-gray-900',
  danger: 'text-white',
  outline: 'text-gray-900',
  ghost: 'text-blue-500',
};

const VARIANT_SPINNER: Record<string, string> = {
  primary: '#ffffff',
  secondary: '#111827',
  danger: '#ffffff',
  outline: '#111827',
  ghost: '#3B82F6',
};

const SIZE_CONTAINER: Record<string, string> = {
  sm: 'h-[36px] rounded-lg px-4',
  md: 'h-[44px] rounded-xl px-5',
  lg: 'h-[52px] rounded-xl px-6',
};

const SIZE_TEXT: Record<string, string> = {
  sm: 'text-[13px]',
  md: 'text-[14px]',
  lg: 'text-[15px]',
};

export function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  className = '',
  style,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`flex-row items-center justify-center ${SIZE_CONTAINER[size]} ${VARIANT_CONTAINER[variant]} ${isDisabled ? 'opacity-50' : 'active:opacity-80'} ${className}`}
      style={style}
    >
      {loading ? (
        <ActivityIndicator size="small" color={VARIANT_SPINNER[variant]} />
      ) : (
        <>
          {icon}
          <Text
            className={`font-semibold ${SIZE_TEXT[size]} ${VARIANT_TEXT[variant]} ${icon ? 'ml-2' : ''}`}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}
