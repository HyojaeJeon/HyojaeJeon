import { View, Text, Pressable } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { formatVnd } from '@shared/utils/format';
import { colors, typography, spacing, radius, components } from '@shared/ui/tokens';
import { useTranslation } from 'react-i18next';
import type { MockMenuItem } from '@shared/mock/types';

interface MenuItemCardProps {
  item: MockMenuItem;
  quantity: number;
  onQuantityChange?: (itemId: string, newQty: number) => void;
}

export function MenuItemCard({ item, quantity, onQuantityChange }: MenuItemCardProps) {
  const { t } = useTranslation();
  const isDisabled = !item.isAvailable;

  const handleDecrement = () => {
    if (isDisabled || quantity <= 0) return;
    // TODO: Add haptic feedback — ReactNativeHapticFeedback.trigger('impactLight')
    onQuantityChange?.(item.id, quantity - 1);
  };

  const handleIncrement = () => {
    if (isDisabled) return;
    // TODO: Add haptic feedback — ReactNativeHapticFeedback.trigger('impactLight')
    onQuantityChange?.(item.id, quantity + 1);
  };

  return (
    <View
      className="flex-row items-center justify-between"
      style={{
        ...components.card,
        padding: spacing.cardPadding,
        opacity: isDisabled ? 0.5 : 1,
      }}
    >
      {/* Left: info */}
      <View className="flex-1" style={{ paddingRight: spacing.elementGap }}>
        <View className="flex-row items-center" style={{ gap: spacing.sm }}>
          <Text style={{ ...typography.cardTitle, color: isDisabled ? colors.textTertiary : colors.textPrimary }}>
            {item.nameVi}
          </Text>
          {item.isPopular && !isDisabled && (
            <View style={{ borderRadius: radius.full, backgroundColor: `${colors.warning}1A`, paddingHorizontal: spacing.sm, paddingVertical: 2 }}>
              <Text style={{ fontSize: 10, fontWeight: '500', color: colors.warning }}>
                {t('order.popular')}
              </Text>
            </View>
          )}
        </View>
        <Text style={{ ...typography.caption, marginTop: 2 }} numberOfLines={1}>{item.descriptionVi}</Text>
        <Text style={{ ...typography.body, fontWeight: '500', color: colors.textPrimary, marginTop: spacing.xs }}>
          {item.priceVnd === 0 ? 'Mien phi' : formatVnd(item.priceVnd)}
        </Text>
      </View>

      {/* Right: quantity controls */}
      <View className="flex-row items-center" style={{ gap: spacing.sm }}>
        {quantity > 0 ? (
          <>
            <Pressable
              onPress={handleDecrement}
              className="flex items-center justify-center"
              style={{ height: 32, width: 32, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgWhite }}
              disabled={isDisabled}
            >
              <Minus size={16} color={colors.textSecondary} />
            </Pressable>
            <Text style={{ width: 24, textAlign: 'center', ...typography.cardTitle }}>
              {quantity}
            </Text>
            <Pressable
              onPress={handleIncrement}
              className="flex items-center justify-center"
              style={{ height: 32, width: 32, borderRadius: radius.sm, backgroundColor: colors.primary }}
              disabled={isDisabled}
            >
              <Plus size={16} color={colors.textInverse} />
            </Pressable>
          </>
        ) : (
          <Pressable
            onPress={handleIncrement}
            className="flex items-center justify-center"
            style={{
              height: 32,
              width: 32,
              borderRadius: radius.sm,
              borderWidth: 1,
              borderColor: isDisabled ? colors.borderLight : colors.border,
              backgroundColor: isDisabled ? colors.bgInput : colors.bgWhite,
            }}
            disabled={isDisabled}
          >
            <Plus size={16} color={isDisabled ? colors.textPlaceholder : colors.textSecondary} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
