import { View, Text, Pressable } from 'react-native';
import { QrCode, CreditCard, Smartphone, Landmark, Wallet } from 'lucide-react-native';
import { colors, typography, spacing, radius, shadows } from '@shared/ui/tokens';
import { useTranslation } from 'react-i18next';
import type { MockPaymentMethod } from '@shared/mock/types';

interface PaymentMethodListProps {
  methods: MockPaymentMethod[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const TYPE_ICONS: Record<MockPaymentMethod['type'], typeof QrCode> = {
  NAPAS_QR: QrCode,
  VISA_MASTERCARD: CreditCard,
  MOMO: Smartphone,
  ZALOPAY: Smartphone,
  BANK_TRANSFER: Landmark,
};

export function PaymentMethodList({ methods, selectedId, onSelect }: PaymentMethodListProps) {
  const { t } = useTranslation();

  const STATUS_CONFIG: Record<
    MockPaymentMethod['status'],
    { label: string; textColor: string; bgColor: string; showLink?: boolean }
  > = {
    AVAILABLE: { label: t('topUp.available'), textColor: colors.success, bgColor: `${colors.success}1A` },
    LINKED: { label: t('topUp.linked'), textColor: colors.primary, bgColor: `${colors.primary}1A` },
    NOT_LINKED: {
      label: t('topUp.notLinked'),
      textColor: colors.textTertiary,
      bgColor: colors.bgInput,
      showLink: true,
    },
  };

  if (methods.length === 0) {
    return (
      <View style={{ gap: spacing.elementGap }}>
        <Text style={typography.cardTitle}>{t('topUp.paymentMethod')}</Text>
        <View style={{ alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg }}>
          <Wallet size={32} color={colors.textTertiary} />
          <Text style={[typography.body, { color: colors.textTertiary }]}>
            {t('topUp.noPaymentMethods')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ gap: spacing.elementGap }}>
      <Text style={typography.cardTitle}>{t('topUp.paymentMethod')}</Text>

      <View style={{ gap: spacing.sm }}>
        {methods.map((method) => {
          const Icon = TYPE_ICONS[method.type];
          const statusCfg = STATUS_CONFIG[method.status];
          const isSelected = method.id === selectedId;
          const isDisabled = method.status === 'NOT_LINKED';

          return (
            <Pressable
              key={method.id}
              onPress={() => {
                if (!isDisabled) {
                  onSelect(method.id);
                }
              }}
              disabled={isDisabled}
              className="flex-row items-center"
              style={{
                gap: spacing.elementGap,
                borderRadius: radius.md,
                backgroundColor: colors.bgWhite,
                padding: spacing.cardPadding,
                borderWidth: isSelected ? 2 : 0,
                borderColor: isSelected ? colors.primary : 'transparent',
                opacity: isDisabled ? 0.6 : 1,
                ...shadows.card,
              }}
            >
              {/* Radio */}
              <View
                className="flex items-center justify-center"
                style={{
                  height: 20,
                  width: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: isSelected ? colors.primary : colors.textTertiary,
                }}
              >
                {isSelected && <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: colors.primary }} />}
              </View>

              {/* Icon */}
              <View
                className="flex items-center justify-center"
                style={{ height: 40, width: 40, borderRadius: radius.md, backgroundColor: colors.bgInput }}
              >
                <Icon size={20} color={colors.textSecondary} />
              </View>

              {/* Name */}
              <Text className="flex-1" style={{ ...typography.body, fontWeight: '500', color: colors.textPrimary }}>{method.name}</Text>

              {/* Status badge */}
              <View className="flex-row items-center" style={{ gap: spacing.sm }}>
                <View style={{ borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2, backgroundColor: statusCfg.bgColor }}>
                  <Text style={{ ...typography.overline, color: statusCfg.textColor }}>
                    {statusCfg.label}
                  </Text>
                </View>
                {statusCfg.showLink && (
                  <Pressable>
                    <Text style={{ ...typography.caption, fontWeight: '500', color: colors.primary }}>{t('topUp.linkNow')}</Text>
                  </Pressable>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
