import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { CheckCircle, Eye, EyeOff, Info } from 'lucide-react-native';
import { AppHeader } from '@shared/ui/AppHeader';
import { useModal } from '@shared/ui';
import { colors, typography, spacing, radius, shadows, components } from '@shared/ui/tokens';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useBadgeLinkData } from './useBadgeLinkData';

const FULL_BADGE_ID = 'RFID-20260115-7890';
const MASKED_BADGE_ID = 'RFID-****7890';

export default function BadgeLinkScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { show: showModal } = useModal();
  const { employee: _employee } = useBadgeLinkData();

  const [badgeVisible, setBadgeVisible] = useState(false);

  const handleReportLost = () => {
    showModal({
      title: t('badge.reportLost'),
      message: t('badge.lostConfirmMessage'),
      variant: 'danger',
      confirmText: t('common.confirm'),
      cancelText: t('common.cancel'),
      onConfirm: async () => {
        // In production this would call a mutation to deactivate the badge.
        // For now show a success alert after confirming.
        showModal({ title: t('badge.reportLost'), message: t('badge.lostSuccess'), confirmText: t('common.ok') });
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppHeader title={t('badge.title')} onBack={() => navigation.goBack()} />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.lg, paddingBottom: spacing.xxl }}>
        <View style={{ gap: spacing.lg }}>
          {/* Status card */}
          <View className="flex-row items-center" style={{ gap: spacing.elementGap, borderRadius: radius.xl, backgroundColor: colors.successLight, padding: spacing.cardPadding }}>
            <CheckCircle size={28} color={colors.success} />
            <View>
              <Text style={{ ...typography.cardTitle, color: colors.success }}>{t('badge.linked')}</Text>
              <Text style={{ ...typography.body, color: colors.success, opacity: 0.8, marginTop: 2 }}>{t('badge.active')}</Text>
            </View>
          </View>

          {/* Badge info card */}
          <View style={{ backgroundColor: colors.bgCard, borderRadius: radius.xl, overflow: 'hidden', ...shadows.card }}>
            {/* Row: Badge ID */}
            <View className="flex-row items-center justify-between" style={{ paddingHorizontal: spacing.cardPadding, paddingVertical: 14 }}>
              <Text style={typography.body}>{t('badge.badgeId')}</Text>
              <View className="flex-row items-center" style={{ gap: spacing.sm }}>
                <Text style={{ ...typography.body, fontWeight: '500', color: colors.textPrimary }}>
                  {badgeVisible ? FULL_BADGE_ID : MASKED_BADGE_ID}
                </Text>
                <Pressable
                  className="flex items-center justify-center active:bg-gray-100"
                  style={{ height: 28, width: 28, borderRadius: radius.full, backgroundColor: colors.bgInput }}
                  onPress={() => setBadgeVisible((v) => !v)}
                >
                  {badgeVisible ? (
                    <EyeOff size={14} color={colors.textTertiary} />
                  ) : (
                    <Eye size={14} color={colors.textTertiary} />
                  )}
                </Pressable>
              </View>
            </View>
            <View style={{ borderTopWidth: 1, borderTopColor: colors.border, marginHorizontal: spacing.cardPadding }} />

            {/* Row: Status */}
            <View className="flex-row items-center justify-between" style={{ paddingHorizontal: spacing.cardPadding, paddingVertical: 14 }}>
              <Text style={typography.body}>{t('badge.status')}</Text>
              <View className="flex-row items-center" style={{ gap: 6 }}>
                <View style={{ height: 6, width: 6, borderRadius: 3, backgroundColor: colors.success }} />
                <Text style={{ ...typography.body, fontWeight: '500', color: colors.success }}>
                  {t('badge.statusActive')}
                </Text>
              </View>
            </View>
            <View style={{ borderTopWidth: 1, borderTopColor: colors.border, marginHorizontal: spacing.cardPadding }} />

            {/* Row: Linked date */}
            <View className="flex-row items-center justify-between" style={{ paddingHorizontal: spacing.cardPadding, paddingVertical: 14 }}>
              <Text style={typography.body}>{t('badge.linkedDate')}</Text>
              <Text style={{ ...typography.body, fontWeight: '500', color: colors.textPrimary }}>15/01/2026</Text>
            </View>
          </View>

          {/* How it works */}
          <View style={{ gap: spacing.elementGap }}>
            <Text style={typography.cardTitle}>{t('badge.howToUse')}</Text>
            <View style={{ gap: spacing.elementGap }}>
              {[
                t('badge.step1'),
                t('badge.step2'),
                t('badge.step3'),
              ].map((text, i) => (
                <View key={i} className="flex-row items-start" style={{ gap: spacing.elementGap }}>
                  <View className="flex shrink-0 items-center justify-center" style={{ height: 28, width: 28, borderRadius: radius.full, backgroundColor: colors.primary }}>
                    <Text style={{ ...typography.caption, fontWeight: '700', color: colors.textInverse }}>{i + 1}</Text>
                  </View>
                  <Text style={{ ...typography.body, paddingTop: 4, flex: 1 }}>{text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Info banner */}
          <View className="flex-row" style={{ gap: spacing.elementGap, borderRadius: radius.md, backgroundColor: colors.primaryLight, padding: spacing.cardPaddingCompact }}>
            <Info size={18} color={colors.primary} />
            <Text style={{ ...typography.caption, color: colors.textSecondary, lineHeight: 18, flex: 1 }}>
              {t('badge.adminInfo')}
            </Text>
          </View>

          {/* Bottom action */}
          <View style={{ gap: spacing.sm, paddingTop: spacing.sm }}>
            <Pressable
              className="flex w-full items-center justify-center active:opacity-80"
              style={{ borderRadius: radius.md, backgroundColor: colors.danger, height: components.input.height }}
              onPress={handleReportLost}
            >
              <Text style={{ ...typography.button, color: colors.textInverse }}>
                {t('badge.reportLost')}
              </Text>
            </Pressable>
            <Text style={{ ...typography.caption, textAlign: 'center' }}>{t('badge.lostWarning')}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
