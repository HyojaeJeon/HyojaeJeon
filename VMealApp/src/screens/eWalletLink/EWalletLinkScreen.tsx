import { View, Text, ScrollView } from 'react-native';
import { Info } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { AppHeader, PrimaryButton, Card, useModal } from '@shared/ui';
import { colors, typography, spacing, radius, components } from '@shared/ui/tokens';

interface WalletItem {
  id: string;
  name: string;
  initial: string;
  color: string;
  bgColor: string;
  linked: boolean;
}

const WALLETS: WalletItem[] = [
  {
    id: 'momo',
    name: 'MoMo',
    initial: 'M',
    color: '#FFFFFF',
    bgColor: '#A50064',
    linked: true,
  },
  {
    id: 'zalopay',
    name: 'ZaloPay',
    initial: 'Z',
    color: '#FFFFFF',
    bgColor: '#0068FF',
    linked: false,
  },
];

export default function EWalletLinkScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { show: showModal } = useModal();

  const handleLink = (wallet: WalletItem) => {
    showModal({
      title: t('eWallet.linkConfirmTitle'),
      message: t('eWallet.linkConfirmMessage', { name: wallet.name }),
      confirmText: t('eWallet.linkAction'),
      cancelText: t('common.cancel'),
      onConfirm: async () => {
        // In production: initiate OAuth / deep link flow
      },
    });
  };

  const handleUnlink = (wallet: WalletItem) => {
    showModal({
      title: t('eWallet.unlinkConfirmTitle'),
      message: t('eWallet.unlinkConfirmMessage', { name: wallet.name }),
      variant: 'danger',
      confirmText: t('eWallet.unlinkAction'),
      cancelText: t('common.cancel'),
      onConfirm: async () => {
        // In production: call unlink mutation
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppHeader title={t('eWallet.title')} onBack={() => navigation.goBack()} />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.lg, paddingBottom: spacing.xxl }}>
        <View style={{ gap: spacing.lg }}>
          {WALLETS.map((wallet) => (
            <Card key={wallet.id} style={{ padding: spacing.cardPaddingCompact }}>
              <View className="flex-row items-center">
                {/* Brand circle */}
                <View
                  className="items-center justify-center"
                  style={{ height: components.avatar.md.size, width: components.avatar.md.size, borderRadius: radius.full, backgroundColor: wallet.bgColor }}
                >
                  <Text style={{ fontSize: 18, fontWeight: '700', color: wallet.color }}>
                    {wallet.initial}
                  </Text>
                </View>

                {/* Name + status */}
                <View style={{ flex: 1, marginLeft: spacing.elementGap }}>
                  <Text style={typography.cardTitle}>
                    {wallet.name}
                  </Text>
                  <View className="flex-row items-center" style={{ marginTop: spacing.xs }}>
                    <View
                      style={{
                        height: 6, width: 6, borderRadius: 3, marginRight: 6,
                        backgroundColor: wallet.linked ? colors.success : colors.textPlaceholder,
                      }}
                    />
                    <Text
                      style={{
                        ...typography.caption,
                        fontWeight: '500',
                        color: wallet.linked ? colors.success : colors.textTertiary,
                      }}
                    >
                      {wallet.linked ? t('eWallet.linked') : t('eWallet.notLinked')}
                    </Text>
                  </View>
                </View>

                {/* Action button */}
                {wallet.linked ? (
                  <PrimaryButton
                    title={t('eWallet.unlinkAction')}
                    onPress={() => handleUnlink(wallet)}
                    variant="outline"
                    size="sm"
                  />
                ) : (
                  <PrimaryButton
                    title={t('eWallet.linkAction')}
                    onPress={() => handleLink(wallet)}
                    variant="primary"
                    size="sm"
                  />
                )}
              </View>
            </Card>
          ))}

          {/* Info banner */}
          <View className="flex-row" style={{ gap: spacing.elementGap, borderRadius: radius.md, borderWidth: 1, borderColor: `${colors.primary}1A`, backgroundColor: colors.primaryLight, padding: spacing.cardPaddingCompact, marginTop: spacing.sm }}>
            <Info size={18} color={colors.primary} />
            <Text style={{ ...typography.caption, color: colors.textSecondary, lineHeight: 18, flex: 1 }}>
              {t('eWallet.info')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
