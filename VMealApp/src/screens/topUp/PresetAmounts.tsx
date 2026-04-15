import { View, Text, TextInput, Pressable } from 'react-native';
import { formatVnd } from '@shared/utils/format';
import { colors, typography, spacing, radius, shadows, components } from '@shared/ui/tokens';
import { useTranslation } from 'react-i18next';

interface PresetAmountsProps {
  amounts: number[];
  selected: number | null;
  onSelect: (amount: number) => void;
}

export function PresetAmounts({ amounts, selected, onSelect }: PresetAmountsProps) {
  const { t } = useTranslation();

  return (
    <View style={{ gap: spacing.elementGap }}>
      <Text style={typography.cardTitle}>{t('topUp.selectAmount')}</Text>

      {/* 2x2 grid */}
      <View className="flex-row flex-wrap" style={{ gap: spacing.elementGap }}>
        {amounts.map((amount) => {
          const isSelected = amount === selected;
          return (
            <Pressable
              key={amount}
              onPress={() => onSelect(amount)}
              className="items-center justify-center"
              style={[
                {
                  height: 56,
                  width: '48%',
                  borderRadius: radius.md,
                  backgroundColor: isSelected ? colors.primaryLight : colors.bgWhite,
                  borderWidth: isSelected ? 2 : 0,
                  borderColor: isSelected ? colors.primary : 'transparent',
                },
                !isSelected && shadows.card,
              ]}
            >
              <Text
                style={{
                  ...typography.cardTitle,
                  color: isSelected ? colors.primary : colors.textPrimary,
                }}
              >
                {formatVnd(amount)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Custom amount input */}
      <Text style={{ ...typography.caption, textAlign: 'center' }}>{t('topUp.orEnterCustom')}</Text>
      <View
        className="flex-row items-center"
        style={{
          height: components.input.height,
          borderRadius: components.input.borderRadius,
          backgroundColor: colors.bgWhite,
          paddingHorizontal: components.input.paddingHorizontal,
          ...shadows.card,
        }}
      >
        <TextInput
          placeholder="Nhap so tien"
          placeholderTextColor={colors.textPlaceholder}
          className="flex-1 bg-transparent"
          style={{ fontSize: components.input.fontSize, color: colors.textPrimary }}
          keyboardType="numeric"
          onChangeText={(text) => {
            const num = parseInt(text.replace(/\D/g, ''), 10);
            if (!isNaN(num) && num > 0) {
              onSelect(num);
            }
          }}
        />
        <Text style={{ ...typography.cardTitle, color: colors.textTertiary }}>d</Text>
      </View>
    </View>
  );
}
