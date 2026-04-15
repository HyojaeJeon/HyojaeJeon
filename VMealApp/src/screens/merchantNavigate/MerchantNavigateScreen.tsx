import { View, Text, ScrollView, Linking, Platform } from 'react-native';
import { MapPin, ExternalLink, Navigation } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@navigation/RootNavigator';
import { AppHeader, Card, PrimaryButton } from '@shared/ui';
import { colors, typography, spacing, radius } from '@shared/ui/tokens';

type MerchantNavigateRoute = RouteProp<RootStackParamList, 'MerchantNavigateScreen'>;

interface NavApp {
  id: string;
  nameKey: string;
  initial: string;
  bgColor: string;
  textColor: string;
  platform: 'all' | 'ios';
  getUrl: (lat: number, lng: number, address: string) => string;
}

const NAV_APPS: NavApp[] = [
  {
    id: 'google_maps',
    nameKey: 'merchantNavigate.googleMaps',
    initial: 'G',
    bgColor: '#4285F4',
    textColor: '#FFFFFF',
    platform: 'all',
    getUrl: (lat, lng) =>
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
  },
  {
    id: 'apple_maps',
    nameKey: 'merchantNavigate.appleMaps',
    initial: 'A',
    bgColor: '#000000',
    textColor: '#FFFFFF',
    platform: 'ios',
    getUrl: (lat, lng, address) =>
      `maps://maps.apple.com/?daddr=${lat},${lng}&q=${encodeURIComponent(address)}`,
  },
  {
    id: 'grab',
    nameKey: 'merchantNavigate.grab',
    initial: 'Gr',
    bgColor: '#00B14F',
    textColor: '#FFFFFF',
    platform: 'all',
    getUrl: (lat, lng) =>
      `grab://open?screenType=BOOKING&pickUpLatLong=&dropOffLatLong=${lat},${lng}`,
  },
  {
    id: 'gojek',
    nameKey: 'merchantNavigate.gojek',
    initial: 'Go',
    bgColor: '#00AA13',
    textColor: '#FFFFFF',
    platform: 'all',
    getUrl: (lat, lng) =>
      `gojek://gopay/pay?dest_lat=${lat}&dest_long=${lng}`,
  },
];

export default function MerchantNavigateScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<MerchantNavigateRoute>();

  const { latitude, longitude, address, merchantName } = route.params;

  const availableApps = NAV_APPS.filter(
    (app) => app.platform === 'all' || (app.platform === 'ios' && Platform.OS === 'ios'),
  );

  const handleOpenApp = (app: NavApp) => {
    const url = app.getUrl(latitude, longitude, address);
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else if (app.id === 'google_maps') {
          // Fallback to web URL
          Linking.openURL(
            `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
          );
        }
      })
      .catch(() => {
        // Silent fail — app not installed
      });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppHeader title={t('merchantNavigate.title')} onBack={() => navigation.goBack()} />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.lg, paddingBottom: spacing.xxl }}>
        {/* Merchant address card */}
        <Card style={{ padding: spacing.cardPadding, marginBottom: spacing.cardPadding }}>
          <View className="flex-row items-start">
            <View className="items-center justify-center" style={{ height: 40, width: 40, borderRadius: radius.md, backgroundColor: colors.dangerLight, marginTop: 2 }}>
              <MapPin size={20} color={colors.danger} />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.elementGap }}>
              <Text style={{ ...typography.cardTitle, fontSize: 16 }}>
                {merchantName}
              </Text>
              <Text style={{ ...typography.caption, color: colors.textTertiary, marginTop: spacing.xs, lineHeight: 20 }}>
                {address}
              </Text>
              <View className="flex-row items-center" style={{ marginTop: spacing.sm }}>
                <Navigation size={12} color={colors.textTertiary} />
                <Text style={{ ...typography.caption, marginLeft: spacing.xs }}>
                  {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Navigation apps */}
        <Text style={{ ...typography.overline, marginBottom: spacing.elementGap }}>
          {t('merchantNavigate.openWith')}
        </Text>

        <View style={{ gap: spacing.elementGap }}>
          {availableApps.map((app) => (
            <Card key={app.id} style={{ padding: spacing.cardPaddingCompact }}>
              <View className="flex-row items-center">
                {/* App icon placeholder */}
                <View
                  className="items-center justify-center"
                  style={{ height: 44, width: 44, borderRadius: radius.md, backgroundColor: app.bgColor }}
                >
                  <Text
                    style={{ fontSize: 14, fontWeight: '700', color: app.textColor }}
                  >
                    {app.initial}
                  </Text>
                </View>

                {/* App name */}
                <Text className="flex-1" style={{ ...typography.cardTitle, marginLeft: spacing.elementGap }}>
                  {t(app.nameKey)}
                </Text>

                {/* Open button */}
                <PrimaryButton
                  title={t('merchantNavigate.open')}
                  onPress={() => handleOpenApp(app)}
                  variant="outline"
                  size="sm"
                  icon={<ExternalLink size={14} color="#374151" />}
                />
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
