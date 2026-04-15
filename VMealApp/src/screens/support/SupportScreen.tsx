import { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Linking } from 'react-native';
import { Search, ChevronDown, ChevronUp, Mail, Phone } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { AppHeader, Card } from '@shared/ui';
import { colors, typography, spacing, radius } from '@shared/ui/tokens';

interface FaqItem {
  questionKey: string;
  answerKey: string;
}

const FAQ_ITEMS: FaqItem[] = [
  { questionKey: 'support.faq1Q', answerKey: 'support.faq1A' },
  { questionKey: 'support.faq2Q', answerKey: 'support.faq2A' },
  { questionKey: 'support.faq3Q', answerKey: 'support.faq3A' },
  { questionKey: 'support.faq4Q', answerKey: 'support.faq4A' },
  { questionKey: 'support.faq5Q', answerKey: 'support.faq5A' },
];

export default function SupportScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const filteredFaq = FAQ_ITEMS.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = t(item.questionKey).toLowerCase();
    const a = t(item.answerKey).toLowerCase();
    const query = searchQuery.toLowerCase();
    return q.includes(query) || a.includes(query);
  });

  const toggleExpand = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:support@vmeal.vn');
  };

  const handlePhonePress = () => {
    Linking.openURL('tel:+842812345678');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppHeader title={t('support.title')} onBack={() => navigation.goBack()} />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.lg, paddingBottom: spacing.xxl }}>
        {/* Search bar */}
        <View className="flex-row items-center" style={{ height: 44, borderRadius: radius.md, backgroundColor: colors.bgWhite, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.elementGap, marginBottom: spacing.lg }}>
          <Search size={18} color={colors.textTertiary} />
          <TextInput
            className="flex-1"
            style={{ marginLeft: spacing.sm, fontSize: typography.body.fontSize, color: colors.textPrimary }}
            placeholder={t('support.searchPlaceholder')}
            placeholderTextColor={colors.textPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
        </View>

        {/* FAQ section */}
        <Text style={{ ...typography.overline, marginBottom: spacing.elementGap }}>
          {t('support.faqTitle')}
        </Text>

        <View style={{ gap: spacing.sm, marginBottom: spacing.xxl }}>
          {filteredFaq.map((item, index) => {
            const isExpanded = expandedIndex === index;

            return (
              <Card key={index} className="overflow-hidden">
                <Pressable
                  className="flex-row items-center justify-between"
                  style={{ padding: spacing.cardPaddingCompact }}
                  onPress={() => toggleExpand(index)}
                >
                  <Text className="flex-1" style={{ ...typography.cardTitle, marginRight: spacing.elementGap }}>
                    {t(item.questionKey)}
                  </Text>
                  {isExpanded ? (
                    <ChevronUp size={18} color={colors.textTertiary} />
                  ) : (
                    <ChevronDown size={18} color={colors.textTertiary} />
                  )}
                </Pressable>

                {isExpanded && (
                  <View style={{ paddingHorizontal: spacing.cardPaddingCompact, paddingBottom: spacing.cardPaddingCompact }}>
                    <View style={{ height: 1, backgroundColor: colors.divider, marginBottom: spacing.elementGap }} />
                    <Text style={{ ...typography.caption, color: colors.textSecondary, lineHeight: 20 }}>
                      {t(item.answerKey)}
                    </Text>
                  </View>
                )}
              </Card>
            );
          })}

          {filteredFaq.length === 0 && (
            <View className="items-center" style={{ paddingVertical: spacing.sectionGap }}>
              <Text style={typography.body}>
                {t('support.noResults')}
              </Text>
            </View>
          )}
        </View>

        {/* Contact section */}
        <Text style={{ ...typography.overline, marginBottom: spacing.elementGap }}>
          {t('support.contactTitle')}
        </Text>

        <View style={{ gap: spacing.sm }}>
          <Pressable onPress={handleEmailPress}>
            <Card style={{ padding: spacing.cardPaddingCompact }}>
              <View className="flex-row items-center">
                <View className="items-center justify-center" style={{ height: 40, width: 40, borderRadius: radius.md, backgroundColor: colors.primaryLight }}>
                  <Mail size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.elementGap }}>
                  <Text style={typography.caption}>{t('support.email')}</Text>
                  <Text style={{ ...typography.cardTitle, marginTop: 2 }}>
                    support@vmeal.vn
                  </Text>
                </View>
              </View>
            </Card>
          </Pressable>

          <Pressable onPress={handlePhonePress}>
            <Card style={{ padding: spacing.cardPaddingCompact }}>
              <View className="flex-row items-center">
                <View className="items-center justify-center" style={{ height: 40, width: 40, borderRadius: radius.md, backgroundColor: colors.successLight }}>
                  <Phone size={20} color={colors.success} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.elementGap }}>
                  <Text style={typography.caption}>{t('support.phone')}</Text>
                  <Text style={{ ...typography.cardTitle, marginTop: 2 }}>
                    +84 28 1234 5678
                  </Text>
                </View>
              </View>
            </Card>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
