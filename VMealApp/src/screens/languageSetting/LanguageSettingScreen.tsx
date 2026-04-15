import { View, Text, ScrollView, Pressable } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { AppHeader, Card } from '@shared/ui';
import { colors, typography, spacing, radius } from '@shared/ui/tokens';
import { useAppDispatch, useAppSelector } from '@store/index';
import { setLocale } from '@store/slices/settingsSlice';
import { i18n } from '@i18n/index';

interface LanguageOption {
  code: 'vi' | 'ko' | 'en';
  flag: string;
  name: string;
  nativeName: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'vi', flag: 'VN', name: 'Vietnamese', nativeName: 'Ti\u1EBFng Vi\u1EC7t' },
  { code: 'ko', flag: 'KR', name: 'Korean', nativeName: '\uD55C\uAD6D\uC5B4' },
  { code: 'en', flag: 'US', name: 'English', nativeName: 'English' },
];

const FLAG_COLORS: Record<string, { bg: string; text: string }> = {
  VN: { bg: '#DC2626', text: '#FBBF24' },
  KR: { bg: '#FFFFFF', text: '#1D4ED8' },
  US: { bg: '#1D4ED8', text: '#FFFFFF' },
};

export default function LanguageSettingScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const currentLocale = useAppSelector((s) => s.settings.locale);

  const handleSelect = (code: 'vi' | 'ko' | 'en') => {
    dispatch(setLocale(code));
    i18n.changeLanguage(code);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppHeader title={t('languageSetting.title')} onBack={() => navigation.goBack()} />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={{ ...typography.caption, marginBottom: spacing.elementGap }}>
          {t('languageSetting.subtitle')}
        </Text>

        <View style={{ gap: spacing.elementGap }}>
          {LANGUAGES.map((lang) => {
            const isSelected = currentLocale === lang.code;
            const flag = FLAG_COLORS[lang.flag];

            return (
              <Pressable key={lang.code} onPress={() => handleSelect(lang.code)}>
                <Card
                  style={{
                    padding: spacing.cardPaddingCompact,
                    borderWidth: isSelected ? 2 : 1,
                    borderColor: isSelected ? colors.primary : 'transparent',
                  }}
                >
                  <View className="flex-row items-center">
                    {/* Flag placeholder */}
                    <View
                      className="items-center justify-center"
                      style={{ height: 40, width: 40, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: flag?.bg ?? '#E5E7EB' }}
                    >
                      <Text
                        style={{ fontSize: 14, fontWeight: '700', color: flag?.text ?? '#374151' }}
                      >
                        {lang.flag}
                      </Text>
                    </View>

                    {/* Language names */}
                    <View style={{ flex: 1, marginLeft: spacing.elementGap }}>
                      <Text style={typography.cardTitle}>
                        {lang.nativeName}
                      </Text>
                      <Text style={{ ...typography.caption, marginTop: 2 }}>
                        {lang.name}
                      </Text>
                    </View>

                    {/* Radio indicator */}
                    <View
                      className="items-center justify-center"
                      style={{
                        height: 24, width: 24, borderRadius: 12, borderWidth: 2,
                        borderColor: isSelected ? colors.primary : colors.textPlaceholder,
                        backgroundColor: isSelected ? colors.primary : 'transparent',
                      }}
                    >
                      {isSelected && <Check size={14} color={colors.textInverse} />}
                    </View>
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
