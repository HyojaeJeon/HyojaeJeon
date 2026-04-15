import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { MapPin, Bell, Fingerprint } from 'lucide-react-native';
import { PrimaryButton } from '@shared/ui';
import { colors, typography, spacing, radius, shadows } from '@shared/ui/tokens';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface PermissionStepProps {
  onNext: () => void;
}

interface PermissionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

function PermissionCard({ icon, title, description, enabled, onToggle }: PermissionCardProps) {
  return (
    <Pressable
      className="flex flex-row items-center active:bg-gray-50"
      style={{ gap: spacing.elementGap, borderRadius: radius.md, backgroundColor: colors.bgCard, padding: spacing.cardPaddingCompact, ...shadows.card }}
      onPress={onToggle}
    >
      {/* Icon */}
      <View className="flex flex-shrink-0 items-center justify-center" style={{ height: 40, width: 40, borderRadius: radius.md, backgroundColor: colors.primaryLight }}>
        {icon}
      </View>

      {/* Text */}
      <View className="flex-1 min-w-0">
        <Text style={typography.cardTitle}>{title}</Text>
        <Text style={{ ...typography.caption, marginTop: 2, lineHeight: 16 }}>{description}</Text>
      </View>

      {/* Toggle */}
      <Pressable onPress={onToggle} hitSlop={8}>
        <View
          className="relative flex-shrink-0"
          style={{
            height: 28, width: 48, borderRadius: radius.full,
            backgroundColor: enabled ? colors.primary : colors.border,
          }}
        >
          <View
            className="absolute"
            style={{
              top: 3, height: 22, width: 22, borderRadius: 11,
              backgroundColor: colors.bgWhite,
              left: enabled ? 23 : 3,
            }}
          />
        </View>
      </Pressable>
    </Pressable>
  );
}

export function PermissionStep({ onNext }: PermissionStepProps) {
  const { t } = useTranslation();

  const [locationEnabled, setLocationEnabled] = useState(true);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  return (
    <View className="flex flex-col" style={{ paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.xxl }}>
      {/* Step indicator */}
      <View className="flex flex-row items-center" style={{ gap: spacing.sm }}>
        <Text style={{ ...typography.caption, fontWeight: '500', color: colors.primary }}>{t('auth.step', { current: 3, total: 4 })}</Text>
      </View>
      <View style={{ marginTop: spacing.sm, height: 4, width: '100%', borderRadius: radius.full, backgroundColor: colors.border }}>
        <View style={{ height: 4, width: '75%', borderRadius: radius.full, backgroundColor: colors.primary }} />
      </View>

      {/* Title */}
      <Text style={{ ...typography.sectionTitle, fontSize: 20, fontWeight: '700', marginTop: spacing.xxl }}>
        {t('auth.permission.title')}
      </Text>
      <Text style={{ ...typography.body, marginTop: spacing.sm }}>
        Cho ph{'\u00E9'}p {'\u1EE9'}ng d{'\u1EE5'}ng truy c{'\u1EAD'}p {'\u0111'}{'\u1EC3'} tr{'\u1EA3'}i nghi{'\u1EC7'}m t{'\u1ED1'}t h{'\u01A1'}n
      </Text>

      {/* Permission cards */}
      <View style={{ marginTop: spacing.xxl, gap: spacing.elementGap }}>
        <PermissionCard
          icon={<MapPin size={20} color={colors.primary} />}
          title={t('auth.permission.location')}
          description={t('auth.permission.locationDesc')}
          enabled={locationEnabled}
          onToggle={() => setLocationEnabled((v) => !v)}
        />
        <PermissionCard
          icon={<Bell size={20} color={colors.primary} />}
          title={t('auth.permission.notification')}
          description={t('auth.permission.notificationDesc')}
          enabled={notificationEnabled}
          onToggle={() => setNotificationEnabled((v) => !v)}
        />
        <PermissionCard
          icon={<Fingerprint size={20} color={colors.primary} />}
          title={t('auth.permission.biometric')}
          description={t('auth.permission.biometricDesc')}
          enabled={biometricEnabled}
          onToggle={() => setBiometricEnabled((v) => !v)}
        />
      </View>

      {/* Later note */}
      <Text style={{ ...typography.caption, textAlign: 'center', marginTop: spacing.lg }}>
        {t('auth.permission.laterNote')}
      </Text>

      {/* Continue button */}
      <View style={{ marginTop: spacing.xxl }}>
        <PrimaryButton
          title={t('common.continue')}
          onPress={onNext}
          size="lg"
          className="w-full"
        />
      </View>
    </View>
  );
}
