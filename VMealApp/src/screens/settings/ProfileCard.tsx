import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import type { MockMealEmployee } from '@shared/mock/types';
import { colors, typography, spacing, shadows, radius, components } from '@shared/ui/tokens';

interface ProfileCardProps {
  employee: MockMealEmployee | null;
  onPress?: () => void;
}

function getInitials(name: string): string {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function ProfileCard({ employee, onPress }: ProfileCardProps) {
  const { t } = useTranslation();

  if (!employee) {
    return (
      <View
        style={{
          backgroundColor: colors.bgCard,
          borderRadius: radius.xl,
          padding: spacing.cardPadding,
          alignItems: 'center',
          justifyContent: 'center',
          height: 80,
          ...shadows.card,
        }}
      >
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  const initials = getInitials(employee.name);

  return (
    <View>
      <Pressable onPress={onPress} className="active:opacity-90">
        <View
          style={{
            backgroundColor: colors.bgCard,
            borderRadius: radius.xl,
            padding: spacing.cardPadding,
            ...shadows.card,
          }}
        >
          <View className="flex-row items-center" style={{ gap: spacing.lg }}>
            {/* Avatar */}
            <View
              className="flex shrink-0 items-center justify-center"
              style={{
                height: components.avatar.xl.size,
                width: components.avatar.xl.size,
                borderRadius: radius.full,
                backgroundColor: colors.primary,
              }}
            >
              <Text style={{ color: colors.textInverse, fontSize: components.avatar.xl.fontSize, fontWeight: '700' }}>{initials}</Text>
            </View>

            {/* Info */}
            <View className="flex-1 min-w-0">
              <Text style={typography.sectionTitle} numberOfLines={1}>
                {employee.name}
              </Text>
              <Text style={{ ...typography.body, marginTop: 2 }}>{employee.department}</Text>
              <Text style={{ ...typography.caption, marginTop: 2 }}>{employee.employeeCode}</Text>
              <Text style={{ ...typography.caption, marginTop: 2 }}>{employee.corporateName}</Text>
            </View>

            {/* Chevron */}
            <ChevronRight size={20} color={colors.textPlaceholder} />
          </View>
        </View>
      </Pressable>

      {/* Account status */}
      <View className="flex-row items-center" style={{ gap: 6, marginTop: spacing.sm, paddingHorizontal: 4 }}>
        <View style={{ height: 6, width: 6, borderRadius: radius.full, backgroundColor: colors.success }} />
        <Text style={{ ...typography.caption, color: colors.success }}>{t('settings.activeAccount')}</Text>
      </View>
    </View>
  );
}
