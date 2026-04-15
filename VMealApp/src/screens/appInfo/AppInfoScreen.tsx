import { View, Text, ScrollView, Pressable, Linking, Platform } from 'react-native';
import { ChevronRight, FileText, Shield, Code } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { AppHeader, Card } from '@shared/ui';
import { colors, typography, spacing, radius } from '@shared/ui/tokens';

interface LinkRow {
  labelKey: string;
  icon: LucideIcon;
  url: string;
}

const LINK_ROWS: LinkRow[] = [
  {
    labelKey: 'appInfo.termsOfService',
    icon: FileText,
    url: 'https://vmeal.vn/terms',
  },
  {
    labelKey: 'appInfo.privacyPolicy',
    icon: Shield,
    url: 'https://vmeal.vn/privacy',
  },
  {
    labelKey: 'appInfo.openSourceLicenses',
    icon: Code,
    url: 'https://vmeal.vn/licenses',
  },
];

export default function AppInfoScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  const osVersion = String(Platform.Version);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppHeader title={t('appInfo.title')} onBack={() => navigation.goBack()} />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.xxl, paddingBottom: spacing.xxl }}>
        {/* Logo + version section */}
        <View className="items-center" style={{ marginBottom: spacing.sectionGap }}>
          {/* VMeal gradient "V" logo */}
          <View className="items-center justify-center" style={{ height: 80, width: 80, borderRadius: radius.xl, backgroundColor: colors.primary, marginBottom: spacing.lg }}>
            <Text style={{ fontSize: 40, fontWeight: '800', color: colors.textInverse }}>V</Text>
          </View>

          <Text style={typography.displayMedium}>VMeal</Text>
          <Text style={{ ...typography.body, marginTop: spacing.xs }}>
            {t('appInfo.version', { ver: '1.0.0', build: '100' })}
          </Text>
          <Text style={{ ...typography.caption, color: colors.textPlaceholder, marginTop: spacing.xs }}>
            {t('appInfo.copyright')}
          </Text>
        </View>

        {/* Links section */}
        <Card className="overflow-hidden" style={{ marginBottom: spacing.xxl }}>
          {LINK_ROWS.map((row, index) => {
            const IconComp = row.icon;
            const isLast = index === LINK_ROWS.length - 1;

            return (
              <Pressable
                key={row.labelKey}
                className="flex-row items-center active:bg-gray-50"
                style={{ paddingHorizontal: spacing.cardPaddingCompact, paddingVertical: 14 }}
                onPress={() => handleLinkPress(row.url)}
              >
                <IconComp size={18} color={colors.textSecondary} />
                <Text className="flex-1" style={{ ...typography.cardTitle, marginLeft: spacing.elementGap }}>
                  {t(row.labelKey)}
                </Text>
                <ChevronRight size={18} color={colors.textPlaceholder} />
                {!isLast && (
                  <View className="absolute bottom-0" style={{ left: spacing.cardPaddingCompact, right: spacing.cardPaddingCompact, height: 1, backgroundColor: colors.divider }} />
                )}
              </Pressable>
            );
          })}
        </Card>

        {/* Device info */}
        <View className="items-center" style={{ gap: spacing.xs }}>
          <Text style={{ fontSize: 11, color: colors.textPlaceholder }}>
            {t('appInfo.platform')}: {Platform.OS === 'ios' ? 'iOS' : 'Android'}
          </Text>
          <Text style={{ fontSize: 11, color: colors.textPlaceholder }}>
            {t('appInfo.osVersion')}: {osVersion}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
