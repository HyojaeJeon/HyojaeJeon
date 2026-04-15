import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import { shadows, radius, spacing, colors } from './tokens';

type ShadowVariant = 'card' | 'elevated' | 'balance' | 'none';

interface CardProps {
  children: ReactNode;
  className?: string;
  /** 그림자 변형: card(기본) | elevated(강조) | balance(브랜드) | none */
  variant?: ShadowVariant;
  /** @deprecated — use variant instead */
  shadow?: boolean;
  style?: ViewStyle;
}

const SHADOW_MAP: Record<ShadowVariant, ViewStyle> = {
  card: shadows.card,
  elevated: shadows.cardElevated,
  balance: shadows.balanceCard,
  none: shadows.none,
};

export function Card({ children, className = '', variant, shadow = true, style }: CardProps) {
  const resolvedVariant = variant ?? (shadow ? 'card' : 'none');

  return (
    <View
      className={`bg-white ${className}`}
      style={[
        {
          borderRadius: radius.xl,
          padding: spacing.cardPadding,
          backgroundColor: colors.bgCard,
        },
        SHADOW_MAP[resolvedVariant],
        style,
      ]}
    >
      {children}
    </View>
  );
}
